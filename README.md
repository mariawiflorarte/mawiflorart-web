# MawiFlorart — App de estoque

Este é o app de controle de estoque da MawiFlorart, já configurado para salvar
os dados no Firebase (Firestore), em vez de ficar preso a uma conversa do Claude.

## Como publicar (Vercel)

1. Crie uma conta gratuita em https://vercel.com (pode entrar com sua conta do
   GitHub ou e-mail).
2. Crie um repositório no GitHub e suba esta pasta inteira nele (ou use o
   comando `vercel` pela linha de comando, se preferir).
3. Na Vercel, clique em "Add New" → "Project", selecione o repositório e
   clique em "Deploy". A Vercel detecta automaticamente que é um projeto Vite.
4. Em poucos minutos você recebe um link tipo `mawiflorart.vercel.app`.

## Como rodar no seu computador antes de publicar (opcional)

Se tiver o Node.js instalado:

```
npm install
npm run dev
```

Isso abre o app localmente para você testar antes de publicar.

## Importante sobre as fotos

Os dados (incluindo fotos dos produtos) ficam guardados como um único
documento no Firestore. Isso funciona bem para uma quantidade moderada de
produtos com fotos pequenas, mas o Firestore tem um limite de 1 MB por
documento. Se no futuro você cadastrar muitas fotos, pode ser necessário
migrar as imagens para o Firebase Storage (um serviço separado, feito
especificamente para arquivos). Avise se isso acontecer que eu ajusto o
código.

## Segurança do banco de dados

O banco foi criado em "modo de teste", o que significa que, por enquanto,
qualquer pessoa com o link do seu projeto poderia ler ou alterar os dados
diretamente pelo Firebase (não pelo app — precisaria saber como). Depois de
tudo funcionando, é recomendável configurar regras de segurança no Firestore.
Posso te ajudar com isso quando chegar a hora.
