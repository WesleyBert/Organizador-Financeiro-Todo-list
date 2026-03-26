# Projeto Full-Stack (Back-end + Front-end)

Este projeto implementa um **sistema de bloco de notas** com:
- Back-end: API REST + SQLite (Prisma) para CRUD de notas e busca por texto
- Front-end: Vue/Vite com painel para listar, buscar, criar e editar notas em Markdown

## Como rodar (dev)

### 1) Back-end
```bash
cd "Back-end"
npm install
npm run dev
```

O back-end roda por padrão em `http://localhost:3001`.

### 2) Front-end
```bash
cd "Front-end\\game-gallery-frontend"
npm install
npm run dev
```

O front se comunica com o back através de `VITE_API_URL`.

## Variáveis de ambiente

Copie:
- `Back-end/.env.example` -> `Back-end/.env`
- `Front-end/game-gallery-frontend/.env.example` -> `Front-end/game-gallery-frontend/.env.local`

## Rotas do front (painel de notas)
- `/notes` (todas as notas)
- `/notes/backend`
- `/notes/frontend`
- `/notes/new`
- `/notes/edit/:id`
- `/notes/:id`

