# StrongAle

StrongAle é uma linguagem de programação esotérica com o propósito de construir programas seguindo um layout de receita de cerveja.

Por exemplo a "receita" abaixo é um programa que calcula e imprime a sequência fibonacci até 100.

```
Malte Trigo 50g 
Malte Caramelo 10g 
Malte Aveia 20g 
Lupulo Fibonacci 15g
Levedura Alta 2g

Cozimento 
    20C durante 15 minutos
    30C durante 50 minutos
    80C durante 0 dias
    30C durante 10 minutos
    80C durante 1 dias

Fermentação
    80C durante 2 minutos        
    20C durante 50 minutos
    .

Maturação
    90C durante 10 minutos < 80C durante 100 dias
    20C durante 10 minutos
    30C durante 20 minutos
    80C durante 10 minutos
    30C durante 10 minutos
    40C durante 50 minutos    
    80C durante 10 minutos 
    30C durante 50 minutos
    80C durante 20 minutos 
    . 
```
A receita é interpretada e transformada em um código Javascript.

Para testar basta executar o comando:
```
node main.js fibonacci.txt
```

## Especificação da Linguagem
### Definição de váriaveis
Os tipos String, Integer e Boolean são suportados, para definir uma váriavel deve respeitar o padrão `Tipo Valor Codigo_referência`

Exemplos:

- Váriavel String com valor Fibonacci com código de referência 15
```
Lupulo Fibonacci 15g
```

- Váriavel Integer com valor 5 e código de referência 50, o valor é 5 porque a palavra Trigo contém 5 caracteres. Isso foi inpirado (copiado) da linguagem de programação Rockstar.
```
Malte Trigo 50g 
```


- Váriavel Boolean com valor True (Alta=True e Baixa=False) e código de referência 2.
```
Levedura Alta 2g 
```

### Tipos de operação
As operações são definidas pelo controle de temperatura
- PRINTOUT=20C
- SET=30C
- ADD=40C
- MINUS=50C
- MULT=60C
- DIV=70C
- LOAD=80C
- CMP=90C

A duração em minutos indica o código de referência da variável que vai ser utilizada na operação.
A duração em dias indica um valor constante.

Exemplos:
- Imprimir o conteúdo da variável com código de referência 10g
```
20C durante 10 minutos
```

- Setar o valor constante 12 na variável com código de referência 10g
```
30C durante 10 minutos
80C durante 12 dias
```

- Setar na variável com código de referência 5g, a soma das variáveis com código de referência 15g e 20g
```
30C durante 5 minutos
40C durante 15 minutos
80C durante 20 minutos
```

### Condicional IF
A operação de IF é definida pela palavra Fermentação.

Exemplo:
- Se valor da varíavel código de referência 2 é True, imprime a varável com código de referência 50

```
Fermentação
    80C durante 2 minutos
    20C durante 50 minutos
```

### Loop While
A operação de WHILE é definida pela palavra Maturação

Exemplo:
- Enquanto o valor da varíavel código de referência 10 for menor que 100, imprime a varável com código de referência 10

Maturação
    90C durante 10 minutos < 80C durante 100 dias
    20C durante 10 minutos

```






