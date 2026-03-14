import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const search = qs(req.query.search)
  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: req.user!.companyId,
      active: true,
      OR: search
        ? [
            { plate: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { plate: 'asc' },
  })
  res.json(vehicles)
}

export async function getById(req: AuthRequest, res: Response) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } })
  if (!vehicle) throw new AppError('Veículo não encontrado', 404)
  res.json(vehicle)
}

export async function create(req: AuthRequest, res: Response) {
  const { plate } = req.body
  if (!plate) throw new AppError('Placa obrigatória')

  const vehicle = await prisma.vehicle.create({
    data: { ...req.body, companyId: req.user!.companyId },
  })
  res.status(201).json(vehicle)
}

export async function update(req: AuthRequest, res: Response) {
  const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data: req.body })
  res.json(vehicle)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.vehicle.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Veículo desativado' })
}

// ── KM Logs ────────────────────────────────────────────────────

export async function listLogs(req: AuthRequest, res: Response) {
  const logs = await prisma.vehicleLog.findMany({
    where: { vehicleId: req.params.id },
    include: { vehicle: { select: { plate: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  })
  res.json(logs)
}

export async function createLog(req: AuthRequest, res: Response) {
  const { kmStart } = req.body
  if (!kmStart) throw new AppError('KM inicial obrigatório')

  const log = await prisma.vehicleLog.create({
    data: { ...req.body, vehicleId: req.params.id },
  })
  res.status(201).json(log)
}

export async function updateLog(req: AuthRequest, res: Response) {
  const data: any = { ...req.body }
  if (data.kmStart && data.kmEnd) {
    data.kmTotal = Number(data.kmEnd) - Number(data.kmStart)
  }
  const log = await prisma.vehicleLog.update({ where: { id: req.params.logId }, data })
  res.json(log)
}
