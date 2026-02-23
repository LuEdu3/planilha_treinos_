# Planilha Progressão de Carga | IA 🤘🏿🤘🏿🤘🏿🤘🏿🤘🏿

Aplicativo web para controle de progressão de carga na academia.

- **1 série aquecimento** → 50% da carga
- **1 série preparação** → 70% da carga  
- **3 séries válidas** → 100%

Ao preencher a carga da série válida (100%), os valores de aquecimento e preparação são calculados automaticamente.

## Rodar localmente as 

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Envie o repositório para o GitHub.
2. Acesse [vercel.com](https://vercel.com) e importe o repositório.
3. Deixe o framework como **Next.js** (detecção automática).
4. Faça o deploy.

Ou use a CLI:

```bash
npm i -g vercel
vercel
```

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Tema azul, layout responsivo (mobile-first)

## Roadmap

Veja [ROADMAP.md](./ROADMAP.md) para autenticação com Google, recuperação de contas e persistência por usuário.
