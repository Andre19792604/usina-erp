import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const projectId = qs(req.query.projectId)
  const status = qs(req.query.status)
  const from = qs(req.query.from)
  const to = qs(req.query.to)

  const productions = await prisma.production.findMany({
    where: {
      project: { companyId: req.user!.companyId },
      projectId: projectId || undefined,
      status: status ? status as any : undefined,
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: {
      project: { select: { name: true, code: true } },
      service: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  })
  res.json(productions)
}

export async function getById(req: AuthRequest, res: Response) {
  const production = await prisma.production.findUnique({
    where: { id: req.params.id },
    include: {
      project: true,
      service: true,
      user: { select: { name: true } },
    },
  })
  if (!production) throw new AppError('Produção não encontrada', 404)
  res.json(production)
}

export async function create(req: AuthRequest, res: Response) {
  const { projectId, serviceId, quantity } = req.body
  if (!projectId || !serviceId || !quantity) {
    throw new AppError('Obra, serviço e quantidade obrigatórios')
  }

  const production = await prisma.production.create({
    data: { ...req.body, userId: req.user!.id },
    include: {
      project: { select: { name: true } },
      service: { select: { name: true } },
    },
  })
  res.status(201).json(production)
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status } = req.body
  const production = await prisma.production.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(production)
}
