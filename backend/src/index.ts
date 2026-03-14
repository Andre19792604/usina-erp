import 'dotenv/config'
import 'express-async-errors'
import http from 'http'
import express from 'express'
import { router } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { setupWebSocket } from './services/integrations/websocket.service'

const app = express()
const PORT = process.env.PORT || 3001

// CORS manual — headers explícitos
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (_req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', router)
app.use(errorHandler)

const server = http.createServer(app)
setupWebSocket(server)

server.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`)
})

export default app
