fs = require('fs')
process = require('process'); 
var code_to_execute = process.argv[2] || "fibonacci.txt"

fs.readFile(code_to_execute, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    execute_code(data)
    });



function lexer (code) {
    var _tokens = code
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
    var tokens = []
    for (var i = 0; i < _tokens.length; i++) {
      var t = _tokens[i]
      if(t.length <= 0 || isNaN(t)) {
        if (t === '*nl*') {
          //tokens.push({type: 'newline'})
        } else if (t === '*var_int*') {
          tokens.push({type: 'var_int'})
        } else if (t === '*var_str*') {
          tokens.push({type: 'var_str'})
        } else if (t === '*var_bool*') {
          tokens.push({type: 'var_bool'})
        } else if (t === '*statement*') {
          tokens.push({type: 'statement'})
        } else if (t === '*while*') {
            tokens.push({type: 'while'})
        } else if (t === '*if*') {
            tokens.push({type: 'if'})
        } else if (t === '*endop*') {
            tokens.push({type: 'endop'})
        } else if (t === '*constant*') {
            tokens.push({type: 'constant'})
        } else if (t === '*memory*') {
            tokens.push({type: 'memory'})
        } else if (t.startsWith('*ref_memory*')) {
            tokens.push({type: 'ref_memory', value: t.replace('*ref_memory*_','')})
        } else if(t.length > 0) {
          tokens.push({type: 'word', value: t})
        }
      } else {
        tokens.push({type: 'number', value: t})
      }
    }  
    return tokens
  }


function get_ref_memoria(value){
    return value.replace('g','')
}

function parser(tokens){
    var AST = []
    while(tokens.length > 0){
        var cur_token = tokens.shift()
        switch(cur_token.type){
            case 'if':
                var block = {
                    type : "IfExpression",
                    expression : findExpression(tokens),
                    body : parser(tokens)
                    
                }
                AST.push(block)
                break;
            case 'while':
                var block = {
                    type : "WhileExpression",
                    expression : findExpression(tokens),
                    body : parser(tokens)
                    
                }
                AST.push(block)
                break;
            case 'endop':
                return AST;
            case 'var_int':
                next_token = tokens.shift();
                valor_variavel = ''
                while(next_token.type != 'ref_memory'){
                    valor_variavel += next_token.value
                    next_token = tokens.shift();
                }
                var block = {
                    type : "VariableDefinition",
                    var_type : 'int',
                    ref : get_ref_memoria(next_token.value),
                    value: valor_variavel.replace(/ /g, '').length
                } 
                AST.push(block)
                break;
            case 'var_str':
                next_token = tokens.shift();
                valor_variavel = ''
                while(next_token.type != 'ref_memory'){
                    valor_variavel += next_token.value + ' '
                    next_token = tokens.shift();
                }
                var block = {
                    type : "VariableDefinition",
                    var_type : 'str',
                    ref : get_ref_memoria(next_token.value),
                    value: valor_variavel.trim()
                } 
                AST.push(block)
                break;
            case 'var_bool':
                next_token = tokens.shift();
                valor_variavel = ''
                while(next_token.type != 'ref_memory'){
                    valor_variavel += next_token.value
                    next_token = tokens.shift();
                }
                var block = {
                    type : "VariableDefinition",
                    var_type : 'bool',
                    ref : get_ref_memoria(next_token.value),
                    value: valor_variavel == 'Alta'
                } 
                AST.push(block)        
                break;                
            case 'word':
                var block = null
                if(cur_token.value == '30C'){
                    block = {
                        type : "SetVariable",
                        var : findArgument(tokens),
                        expression: findExpression(tokens)
                    } 
                } else if(cur_token.value == '20C'){
                    block = {
                        type : "CallExpression",
                        expression: 'print_out',
                        arguments : findArgument(tokens)
                    } 
                }
                else if(cur_token.value == '10C'){
                    block = {
                        type : "CallExpression",
                        expression: 'print_out',
                        arguments : findArgument(tokens)
                    } 
                }
                AST.push(block)            
        }        
            
    }
    return AST;
}


function getCompareOperator(value){
    if(value == ','){
        return '==';
    }
    if(value == '>,'){
        return '>=';
    }
    if(value == '<,'){
        return '<=';
    }
    if(value == '-'){
        return '!=';
    }
    return value;
}


function findExpression(tokens){
    cur_token = tokens.shift();
    switch(cur_token.type){
        case 'word':
            if(cur_token.value == '80C'){
                return findArgument(tokens);
            }
            if(cur_token.value == '90C'){
                var block = {
                    type : 'CompareExpression',
                    left : findArgument(tokens),
                    operator : getCompareOperator(tokens.shift().value),
                    right : findExpression(tokens)
                }
                return block;
            }
            var mathOperator = getMathExpressionOperator(cur_token.value)
            if(mathOperator != null){
                var block = {
                    type : 'MathExpression',
                    operator : mathOperator,
                    left : findArgument(tokens),
                    right : findExpression(tokens)
                }
                return block
            }
        }
}

function getMathExpressionOperator(value){
    if(value == '40C'){
        return '+';
    }
    if(value == '50C'){
        return '-';
    }
    if(value == '60C'){
        return '*';
    }
    if(value == '70C'){
        return '/';
    }
}

function findArgument(tokens){
    valor_variavel = tokens.shift();
    tipo_acesso = tokens.shift();
    return {
        type : tipo_acesso.type == 'constant' ? "ConstantValue" : "VariableReference",
        value: valor_variavel.value
    } 
}

function transformer(_ast){
    var program = "var memory = {};\n"
    while(_ast.length > 0){
        var cur_token = _ast.shift()        
        program += apply_transformer(cur_token) + "\n"
    }
    return program
}

function apply_transformer(block){
    switch(block.type){
        case 'VariableDefinition':
            return t_variable_definition(block);
        case 'VariableReference':
            return t_variable_reference(block);
        case 'ConstantValue':
            return t_constant_value(block);
        case 'CallExpression':
            return t_call_expression(block);
        case 'SetVariable':
            return t_set_variable(block);
        case 'MathExpression':
            return t_math_expression(block);
        case 'IfExpression':
            return t_if_expression(block);
        case 'WhileExpression':
            return t_while_expression(block);
        case 'CompareExpression':
            return t_compare_expression(block);
    }

}

function t_compare_expression(block){
    return apply_transformer(block.left) + " "+block.operator + " " +  apply_transformer(block.right);   
}

function t_while_expression(block){
    return "while("+apply_transformer(block.expression) + ") { \n"+  get_body(block.body) +  " } \n";   
}

function t_if_expression(block){
    return "if("+apply_transformer(block.expression) + ") { \n"+  get_body(block.body) +  " } \n";   
}

function get_body(_ast){
    var program = ""
    while(_ast.length > 0){
        var cur_token = _ast.shift()        
        program += apply_transformer(cur_token) + "\n"
    }
    return program
}

function t_math_expression(block){
    return apply_transformer(block.left) + " "+block.operator+" " +  apply_transformer(block.right) + " ";   
}

function t_set_variable(block){
    return apply_transformer(block.var) +" = " +apply_transformer(block.expression) +";";
}

function t_variable_definition(block){
    return "memory['"+block.ref+"'] = "+get_value(block)+";";
}

function get_value(block){
    if(block.var_type == 'str'){
        return "'"+block.value+"'";
    }
    return block.value
}

function t_call_expression(block){
    if(block.expression == 'print_out'){
        return "console.log("+apply_transformer(block.arguments)+");";
    }
    return "memory['"+block.ref+"'] = "+block.value+";";
}

function t_constant_value(block){
    return block.value
}

function t_variable_reference(block){
    return "memory["+block.value+"]";
}

function execute_code(code){    
    AST = parser(lexer(code))
    var compiled = transformer(AST)
    eval(compiled)
}    