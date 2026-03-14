import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const vehicleId = qs(req.query.vehicleId)
  const from = qs(req.query.from)
  const to = qs(req.query.to)

  const logs = await prisma.fuelLog.findMany({
    where: {
      vehicle: { companyId: req.user!.companyId },
      vehicleId: vehicleId || undefined,
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: { vehicle: { select: { plate: true, type: true } } },
    orderBy: { date: 'desc' },
  })
  res.json(logs)
}

export async function create(req: AuthRequest, res: Response) {
  const { vehicleId, liters } = req.body
  if (!vehicleId || !liters) throw new AppError('Veículo e litros obrigatórios')

  const data: any = { ...req.body }
  if (data.liters && data.pricePerLiter) {
    data.totalCost = Number(data.liters) * Number(data.pricePerLiter)
  }

  const log = await prisma.fuelLog.create({
    data,
    include: { vehicle: { select: { plate: true } } },
  })
  res.status(201).json(log)
}

export async function update(req: AuthRequest, res: Response) {
  const data: any = { ...req.body }
  if (data.liters && data.pricePerLiter) {
    data.totalCost = Number(data.liters) * Number(data.pricePerLiter)
  }
  const log = await prisma.fuelLog.update({ where: { id: req.params.id }, data })
  res.json(log)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.fuelLog.delete({ where: { id: req.params.id } })
  res.json({ message: 'Abastecimento removido' })
}

export async function summary(req: AuthRequest, res: Response) {
  const from = qs(req.query.from)
  const to = qs(req.query.to)

  const logs = await prisma.fuelLog.findMany({
    where: {
      vehicle: { companyId: req.user!.companyId },
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: { vehicle: { select: { plate: true } } },
  })

  const totalLiters = logs.reduce((s, l) => s + Number(l.liters), 0)
  const totalCost = logs.reduce((s, l) => s + Number(l.totalCost || 0), 0)

  res.json({ totalLiters, totalCost, count: logs.length })
}
