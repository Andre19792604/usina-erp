import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: Request, res: Response) {
  const status = qs(req.query.status)
  const from = qs(req.query.from)
  const to = qs(req.query.to)
  const orders = await prisma.productionOrder.findMany({
    where: {
      status: status ? (status as any) : undefined,
      scheduledDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    include: {
      product: { select: { name: true, type: true } },
      formula: { select: { name: true } },
      operator: { select: { name: true } },
    },
    orderBy: { scheduledDate: 'desc' },
  })
  res.json(orders)
}

export async function getById(req: Request, res: Response) {
  const order = await prisma.productionOrder.findUnique({
    where: { id: String(req.params.id) },
    include: {
      product: true,
      formula: { include: { items: { include: { material: true } } } },
      operator: { select: { name: true } },
      qualityControls: true,
      stockMovements: { include: { material: true } },
    },
  })
  if (!order) throw new AppError('Ordem não encontrada', 404)
  res.json(order)
}

export async function create(req: AuthRequest, res: Response) {
  const data = req.body
  const number = `OP${Date.now().toString().slice(-8)}`
  const order = await prisma.productionOrder.create({
    data: { ...data, number, operatorId: req.user!.id },
    include: { product: { select: { name: true } } },
  })
  res.status(201).json(order)
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status, producedQty, temperature } = req.body
  const id = String(req.params.id)

  const data: Record<string, unknown> = { status }
  if (status === 'IN_PROGRESS') data.startedAt = new Date()
  if (status === 'COMPLETED') {
    data.completedAt = new Date()
    if (producedQty) data.producedQty = producedQty
  }
  if (temperature) data.temperature = temperature

  const order = await prisma.productionOrder.update({ where: { id }, data })
  res.json(order)
}

export async function addQualityControl(req: Request, res: Response) {
  const qc = await prisma.qualityControl.create({
    data: { ...req.body, productionOrderId: String(req.params.id) },
  })
  res.status(201).json(qc)
}
