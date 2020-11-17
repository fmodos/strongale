# StrongAle

StrongAle é uma linguagem de programação esotérica com o propósito de construir programas seguindo um layout de receita de cerveja.

Por exemplo a "receita" abaixo é um programa que calcula e imprime a sequência fibonacci até 100.

```
Malte Trigo 50g 
Malte Caramelo 10g 
Malte Aveia 20g 
Levedura Alta 5g

Cozimento 
    30C durante 50 minutos
    80C durante 0 dias
    30C durante 10 minutos
    80C durante 1 dias

Fermentação
    80C durante 5 minutos    
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
