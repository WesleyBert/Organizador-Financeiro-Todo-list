import cors from 'cors'
import express from 'express'
import notesRouter from './routes/notes'
import healthRouter from './routes/health'
import passwordsRouter from './routes/passwords'
import todoRouter from './routes/todo'
import financeRouter from './routes/finance'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))

  const corsOrigin = process.env.CORS_ORIGIN?.trim()
  const corsOptions =
    !corsOrigin || corsOrigin === '*'
      ? { origin: true }
      : {
          origin: corsOrigin.split(',').map(s => s.trim()),
        }

  app.use(cors(corsOptions as cors.CorsOptions))

  app.get('/', (_req, res) => {
    res.json({ name: 'back-end', status: 'ok' })
  })

  app.use('/api/health', healthRouter)
  app.use('/api/notes', notesRouter)
  app.use('/api/passwords', passwordsRouter)
  app.use('/api/todo', todoRouter)
  // O router de finanças define rotas começando em `/bills` e `/finance/...`
  // então ele é montado em `/api`.
  app.use('/api', financeRouter)

  return app
}

