import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from './errorHandler'

export interface ApiKeyRequest extends Request {
  integration?: { id: string; name: string; clientId: string | null }
}

export async function authenticateApiKey(req: ApiKeyRequest, _res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  if (!apiKey) throw new AppError('API key não fornecida', 401)

  const key = await prisma.integrationKey.findUnique({ where: { apiKey } })
  if (!key || !key.active) throw new AppError('API key inválida ou inativa', 401)

  // Update last used timestamp
  await prisma.integrationKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  })

  req.integration = { id: key.id, name: key.name, clientId: key.clientId }
  next()
}
