import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export async function list(req: AuthRequest, res: Response) {
  const services = await prisma.service.findMany({
    where: { companyId: req.user!.companyId, active: true },
    orderBy: { name: 'asc' },
  })
  res.json(services)
}

export async function create(req: AuthRequest, res: Response) {
  const { name } = req.body
  if (!name) throw new AppError('Nome do serviço obrigatório')

  const code = `SRV${Date.now().toString().slice(-6)}`
  const service = await prisma.service.create({
    data: { ...req.body, code, companyId: req.user!.companyId },
  })
  res.status(201).json(service)
}

export async function update(req: AuthRequest, res: Response) {
  const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body })
  res.json(service)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.service.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Serviço desativado' })
}
