import 'dotenv/config'
import { createServer } from 'http'
import { createApp } from './app'

const port = Number(process.env.PORT || 3001)
const app = createApp()

// Express/Router
const server = createServer(app)

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[back-end] rodando na porta ${port}`)
})

