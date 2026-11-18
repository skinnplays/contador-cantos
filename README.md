# Contador Cantos - Criatório Strike

Site para contar cantos de pássaros em torneios, direto no celular. Instalado, aparece na tela inicial como **Contador Strike**.

- Botão grande **+1** e botão **−1** para corrigir
- Cronômetro de **10 ou 15 minutos**
- **Média por minuto** e **previsão** do total no fim da prova
- Cantos **minuto a minuto**
- **Vistos** a cada 50 ou 60 cantos, com o tempo de prova em que cada um aconteceu
- A **tela fica ligada** durante a contagem
- Funciona **sem internet** e pode ser instalado na tela inicial do celular

## Rodar no computador

```
npx serve .
```

Para que a tela fique ligada no celular, o site precisa estar em HTTPS. O GitHub Pages já entrega o site em HTTPS.

## Testes

```
node --test test/
```
