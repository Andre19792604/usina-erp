import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth'

export async function list(req: Request, res: Response) {
  const { from, to, vehicleId } = req.query
  const tickets = await prisma.weightTicket.findMany({
    where: {
      vehicleId: vehicleId ? String(vehicleId) : undefined,
      weighedAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    include: {
      vehicle: { select: { plate: true, type: true } },
      operator: { select: { name: true } },
    },
    orderBy: { weighedAt: 'desc' },
  })
  res.json(tickets)
}

export async function create(req: AuthRequest, res: Response) {
  const { vehicleId, type, driverName, grossWeight, tare, salesOrderId, notes } = req.body
  const netWeight = Number(grossWeight) - Number(tare)
  const number = `PES${Date.now().toString().slice(-8)}`

  const ticket = await prisma.weightTicket.create({
    data: {
      number,
      vehicleId,
      type,
      driverName,
      grossWeight,
      tare,
      netWeight,
      salesOrderId,
      notes,
      operatorId: req.user!.id,
    },
    include: {
      vehicle: { select: { plate: true } },
    },
  })
  res.status(201).json(ticket)
}
