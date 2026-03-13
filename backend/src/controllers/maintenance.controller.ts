import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

// ── Equipment ─────────────────────────────────────────────────

export async function listEquipments(req: Request, res: Response) {
  const equipments = await prisma.equipment.findMany({
    where: { active: true },
    include: {
      _count: { select: { maintenanceOrders: true } },
    },
    orderBy: { name: 'asc' },
  })
  res.json(equipments)
}

export async function createEquipment(req: Request, res: Response) {
  const { name, category, brand, model, serialNumber, purchaseDate } = req.body
  if (!name || !category) throw new AppError('Nome e categoria obrigatórios')
  const code = `EQ${Date.now().toString().slice(-6)}`
  const equipment = await prisma.equipment.create({
    data: {
      code, name, category, brand, model, serialNumber,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
    },
  })
  res.status(201).json(equipment)
}

export async function updateEquipment(req: Request, res: Response) {
  const equipment = await prisma.equipment.update({
    where: { id: String(req.params.id) },
    data: req.body,
  })
  res.json(equipment)
}

// ── Maintenance Orders ────────────────────────────────────────

export async function listOrders(req: Request, res: Response) {
  const status = qs(req.query.status)
  const type = qs(req.query.type)
  const orders = await prisma.maintenanceOrder.findMany({
    where: {
      status: status ? (status as any) : undefined,
      type: type ? (type as any) : undefined,
    },
    include: {
      equipment: { select: { name: true, category: true } },
      vehicle: { select: { plate: true, type: true } },
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export async function getOrderById(req: Request, res: Response) {
  const order = await prisma.maintenanceOrder.findUnique({
    where: { id: String(req.params.id) },
    include: {
      equipment: true,
      vehicle: { select: { plate: true, brand: true, model: true } },
      technician: { select: { name: true } },
    },
  })
  if (!order) throw new AppError('Ordem não encontrada', 404)
  res.json(order)
}

export async function createOrder(req: AuthRequest, res: Response) {
  const { equipmentId, vehicleId, type, description, scheduledAt, notes } = req.body
  if (!type || !description) throw new AppError('Tipo e descrição obrigatórios')
  if (!equipmentId && !vehicleId) throw new AppError('Informe equipamento ou veículo')

  const number = `OS${Date.now().toString().slice(-8)}`
  const order = await prisma.maintenanceOrder.create({
    data: {
      number, equipmentId, vehicleId, type, description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      technicianId: req.user!.id,
      notes,
    },
    include: {
      equipment: { select: { name: true } },
      vehicle: { select: { plate: true } },
    },
  })
  res.status(201).json(order)
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const { status, cost } = req.body
  const data: Record<string, unknown> = { status }
  if (status === 'IN_PROGRESS') data.startedAt = new Date()
  if (status === 'COMPLETED') {
    data.completedAt = new Date()
    if (cost) data.cost = cost
  }

  const order = await prisma.maintenanceOrder.update({
    where: { id: String(req.params.id) },
    data,
  })
  res.json(order)
}
