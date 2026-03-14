import 'dotenv/config'
import 'express-async-errors'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { router } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { setupWebSocket } from './services/integrations/websocket.service'

const app = express()
const PORT = process.env.PORT || 3001

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
  origin: frontendUrl === '*' ? true : frontendUrl.split(',').map(u => u.trim()),
  credentials: true,
}))
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
