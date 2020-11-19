const fs = require('fs')
const process = require('process')

const codeToExecute = process.argv[2] || 'fibonacci.txt'

fs.readFile(codeToExecute, 'utf8', (err, data) => {
    if (err)
        return console.log(err)

    executeCode(data)
})

const applyLexicalAnalysis = code => {
    const codeTokens = code
        .replace(/[\n\r]/g, ' *nl* ')
        .replace(/Malte/g, ' *var_int* ')
        .replace(/Lupulo/g, ' *var_str* ')
        .replace(/Fermentação/g, ' *if* ')
        .replace(/Cozimento/g, ' *statement* ')
        .replace(/Maturação/g, ' *while* ')
        .replace(/minutos/g, ' *memory* ')
        .replace(/dias/g, ' *constant* ')
        .replace(/Levedura/g, ' *var_bool* ')
        .replace(/\./g, ' *endop* ')
        .replace(/([0-9]+g)/g, ' *ref_memory*_$1 ')
        .replace(/durante/g, '')
        .split(/[\t\f\v ]+/)

    const validTokens = [
        'var_int',
        'var_str',
        'if',
        'statement',
        'while',
        'memory',
        'constant',
        'var_bool',
        'endop'
    ]

    const tokens = codeTokens.map(token => {
        const tokenLength = token.length

        if (tokenLength <= 0 || isNaN(token)) {
            const tokenType = token.substring(1, tokenLength - 1)
            if (validTokens.find(value => value == tokenType)) {
                return { type: tokenType }
            } else if (token === '*nl*') { }
            else if (token.startsWith('*ref_memory*')) {
                return { type: 'ref_memory', value: token.replace('*ref_memory*_', '') }
            } else if (token.length > 0) {
                return { type: 'word', value: token }
            }
        } else {
            return { type: 'number', value: token }
        }
    }).filter(value => value != null)

    return tokens
}


const getMemoryReference = value => {
    return value.replace('g', '')
}

const parse = (tokens) => {
    const ValidTokens = {
        _if(currentToken, tokens) {
            const block = {
                type: "IfExpression",
                expression: findExpression(tokens),
                body: parse(tokens)
            }
            return block
        },
        _while(currentToken, tokens) {
            const block = {
                type: "WhileExpression",
                expression: findExpression(tokens),
                body: parse(tokens)

            }
            return block
        },
        _endop(currentToken, tokens) {
            return null
        },
        _var_int(currentToken, tokens) {
            let nextToken = tokens.shift()
            let variableValue = ''
            while (nextToken.type != 'ref_memory') {
                variableValue += nextToken.value
                nextToken = tokens.shift()
            }
            const block = {
                type: "VariableDefinition",
                var_type: 'int',
                ref: getMemoryReference(nextToken.value),
                value: variableValue.replace(/ /g, '').length
            }
            return block
        },
        _var_str(currentToken, tokens) {
            let nextToken = tokens.shift()
            let variableValue = ''
            while (nextToken.type != 'ref_memory') {
                variableValue += nextToken.value + ' '
                nextToken = tokens.shift()
            }
            const block = {
                type: "VariableDefinition",
                var_type: 'str',
                ref: getMemoryReference(nextToken.value),
                value: variableValue.trim()
            }
            return block
        },
        _var_bool(currentToken, tokens) {
            let nextToken = tokens.shift()
            let variableValue = ''
            while (nextToken.type != 'ref_memory') {
                variableValue += nextToken.value
                nextToken = tokens.shift()
            }
            const block = {
                type: "VariableDefinition",
                var_type: 'bool',
                ref: getMemoryReference(nextToken.value),
                value: variableValue == 'Alta'
            }
            return block
        },
        _word(currentToken, tokens) {
            let block = null
            if (currentToken.value == '30C') {
                block = {
                    type: "SetVariable",
                    var: findArgument(tokens),
                    expression: findExpression(tokens)
                }
            } else if (currentToken.value == '20C') {
                block = {
                    type: "CallExpression",
                    expression: 'print_out',
                    arguments: findArgument(tokens)
                }
            }
            else if (currentToken.value == '10C') {
                block = {
                    type: "CallExpression",
                    expression: 'print_out',
                    arguments: findArgument(tokens)
                }
            }
            return block
        }
    }

    let AST = []
    while (tokens.length > 0) {
        const currentToken = tokens.shift()
        const currentTokenType = '_' + currentToken.type
        const parseFunction = ValidTokens[currentTokenType]

        if (!parseFunction)
            continue

        const parseBlock = parseFunction(currentToken, tokens)

        if (!parseBlock)
            return AST

        AST.push(parseBlock)
    }

    return AST
}


const getCompareOperator = value => {
    const CompareOperators = {
        ',': '==',
        '>,': '>=',
        '<,': '<=',
        '-': '!='
    }

    return CompareOperators[value] || value
}


const findExpression = tokens => {
    const currentToken = tokens.shift()

    switch (currentToken.type) {
        case 'word':
            if (currentToken.value == '80C') {
                return findArgument(tokens)
            }
            if (currentToken.value == '90C') {
                var block = {
                    type: 'CompareExpression',
                    left: findArgument(tokens),
                    operator: getCompareOperator(tokens.shift().value),
                    right: findExpression(tokens)
                }
                return block
            }
            var mathOperator = getMathExpressionOperator(currentToken.value)
            if (mathOperator != null) {
                var block = {
                    type: 'MathExpression',
                    operator: mathOperator,
                    left: findArgument(tokens),
                    right: findExpression(tokens)
                }
                return block
            }
    }
}

const getMathExpressionOperator = value => {
    const MathExpressionOperators = {
        '40C': '+',
        '50C': '-',
        '60C': '*',
        '70C': '/',
    }
    return MathExpressionOperators[value]
}

const findArgument = tokens => {
    const variableValue = tokens.shift()
    const accessType = tokens.shift()
    return {
        type: accessType.type == 'constant' ? "ConstantValue" : "VariableReference",
        value: variableValue.value
    }
}

const transformAST = _ast => {
    let program = "var memory = {};\n"
    while (_ast.length > 0) {
        const currentToken = _ast.shift()
        program += applyTransformer(currentToken) + "\n"
    }
    return program
}

const applyTransformer = block => {
    const BlockTypes = {
        VariableDefinition() {
            return "memory['" + block.ref + "'] = " + getBlockValue(block) + ";"
        },
        VariableReference() {
            return "memory[" + block.value + "]"
        },
        ConstantValue() {
            return block.value
        },
        CallExpression() {
            if (block.expression == 'print_out') {
                return "console.log(" + applyTransformer(block.arguments) + ");"
            }
            return "memory['" + block.ref + "'] = " + block.value + ";"
        },
        SetVariable() {
            return applyTransformer(block.var) + " = " + applyTransformer(block.expression) + ";"
        },
        MathExpression() {
            return applyTransformer(block.left) + " " + block.operator + " " + applyTransformer(block.right) + " "
        },
        IfExpression() {
            return "if(" + applyTransformer(block.expression) + ") { \n" + getBlockBody(block.body) + " } \n"
        },
        WhileExpression() {
            return "while(" + applyTransformer(block.expression) + ") { \n" + getBlockBody(block.body) + " } \n"
        },
        CompareExpression() {
            return applyTransformer(block.left) + " " + block.operator + " " + applyTransformer(block.right)
        },
    }

    const blockFunction = BlockTypes[block.type]

    return blockFunction()
}

const getBlockBody = _ast => {
    var program = ""
    while (_ast.length > 0) {
        var currentToken = _ast.shift()
        program += applyTransformer(currentToken) + "\n"
    }
    return program
}

const getBlockValue = block => {
    if (block.var_type == 'str') {
        return "'" + block.value + "'";
    }
    return block.value
}

const executeCode = code => {
    AST = parse(applyLexicalAnalysis(code))
    const compiled = transformAST (AST)
    eval(compiled)
}    