import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export async function list(req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    where: { companyId: req.user!.companyId },
    select: { id: true, name: true, email: true, role: true, phone: true, active: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  res.json(users)
}

export async function create(req: AuthRequest, res: Response) {
  const { name, email, password, role, phone } = req.body
  if (!name || !email || !password) throw new AppError('Nome, e-mail e senha obrigatórios')

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new AppError('E-mail já cadastrado')

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || 'OPERADOR', phone, companyId: req.user!.companyId },
  })
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role })
}

export async function update(req: AuthRequest, res: Response) {
  const data: any = { ...req.body }
  if (data.password) data.password = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, active: true },
  })
  res.json(user)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.user.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Usuário desativado' })
}
