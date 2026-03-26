# Back-end (Bloco de Notas)

API REST para CRUD de notas (escopos `backend` e `frontend`) com busca por texto.

## Pré-requisitos
- Node.js 20+

## Variáveis de ambiente
Copie `./.env.example` para `./.env` e ajuste:
- `PORT` (padrão: `3001`)
- `CORS_ORIGIN` (URLs permitidas; se vazio, libera `*`)
- `DATABASE_URL` (SQLite dev: `file:./dev.db`)

## Rodar em desenvolvimento
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Migrations (Prisma)
Em dev (SQLite):
```bash
npx prisma migrate dev --name init
```

## Endpoints
- `GET /api/health`
- `GET /api/notes?scope=backend|frontend&q=texto`
- `GET /api/notes/:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

