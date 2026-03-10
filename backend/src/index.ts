import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', router)
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`)
})

export default app
