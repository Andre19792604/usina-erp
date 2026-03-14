import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const status = qs(req.query.status)
  const maintenances = await prisma.maintenance.findMany({
    where: {
      equipment: { companyId: req.user!.companyId },
      status: status ? status as any : undefined,
    },
    include: { equipment: { select: { name: true, code: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(maintenances)
}

export async function create(req: AuthRequest, res: Response) {
  const { equipmentId, description } = req.body
  if (!equipmentId || !description) throw new AppError('Equipamento e descrição obrigatórios')

  const maintenance = await prisma.maintenance.create({
    data: req.body,
    include: { equipment: { select: { name: true } } },
  })
  res.status(201).json(maintenance)
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status } = req.body
  const data: any = { status }
  if (status === 'CONCLUIDA') data.completedDate = new Date()

  const maintenance = await prisma.maintenance.update({
    where: { id: req.params.id },
    data,
  })
  res.json(maintenance)
}
