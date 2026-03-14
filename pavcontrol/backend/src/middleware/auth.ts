import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role; companyId: string }
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new AppError('Token não fornecido', 401)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      role: Role
      companyId: string
    }
    req.user = payload
    next()
  } catch {
    throw new AppError('Token inválido ou expirado', 401)
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError('Não autenticado', 401)
    if (!roles.includes(req.user.role)) {
      throw new AppError('Acesso não autorizado', 403)
    }
    next()
  }
}
