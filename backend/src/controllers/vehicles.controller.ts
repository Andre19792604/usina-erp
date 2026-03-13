import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { qs } from '../utils/query'

export async function list(req: Request, res: Response) {
  const type = qs(req.query.type)
  const search = qs(req.query.search)
  const vehicles = await prisma.vehicle.findMany({
    where: {
      active: true,
      type: type ? (type as any) : undefined,
      OR: search
        ? [
            { plate: { contains: String(search).toUpperCase() } },
            { brand: { contains: String(search), mode: 'insensitive' } },
            { model: { contains: String(search), mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { plate: 'asc' },
  })
  res.json(vehicles)
}

export async function getById(req: Request, res: Response) {
  const v = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } })
  if (!v) throw new AppError('Veículo não encontrado', 404)
  res.json(v)
}

export async function create(req: Request, res: Response) {
  const data = req.body
  if (!data.plate || !data.type) throw new AppError('Placa e tipo obrigatórios')
  data.plate = data.plate.toUpperCase()
  const vehicle = await prisma.vehicle.create({ data })
  res.status(201).json(vehicle)
}

export async function update(req: Request, res: Response) {
  const data = req.body
  if (data.plate) data.plate = data.plate.toUpperCase()
  const vehicle = await prisma.vehicle.update({
    where: { id: String(req.params.id) },
    data,
  })
  res.json(vehicle)
}

export async function remove(req: Request, res: Response) {
  await prisma.vehicle.update({ where: { id: String(req.params.id) }, data: { active: false } })
  res.json({ message: 'Veículo desativado' })
}

export async function getByPlate(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { plate: String(req.params.plate).toUpperCase() },
  })
  if (!vehicle) throw new AppError('Veículo não encontrado', 404)
  res.json(vehicle)
}
