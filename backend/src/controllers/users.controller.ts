import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'

export async function list(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  res.json(users)
}

export async function create(req: Request, res: Response) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) throw new AppError('Campos obrigatórios faltando')

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new AppError('E-mail já cadastrado')

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, active: true },
  })
  res.status(201).json(user)
}

export async function update(req: Request, res: Response) {
  const id = String(req.params.id)
  const { name, email, role, active } = req.body

  const user = await prisma.user.update({
    where: { id },
    data: { name, email, role, active },
    select: { id: true, name: true, email: true, role: true, active: true },
  })
  res.json(user)
}

export async function remove(req: Request, res: Response) {
  const id = String(req.params.id)
  await prisma.user.update({ where: { id }, data: { active: false } })
  res.json({ message: 'Usuário desativado' })
}
