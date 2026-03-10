import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password) throw new AppError('Email e senha obrigatórios')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.active) throw new AppError('Credenciais inválidas', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new AppError('Credenciais inválidas', 401)

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  })
  if (!user) throw new AppError('Usuário não encontrado', 404)
  res.json(user)
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) throw new AppError('Usuário não encontrado', 404)

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new AppError('Senha atual incorreta')

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  res.json({ message: 'Senha alterada com sucesso' })
}
