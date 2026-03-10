import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'

export async function list(req: Request, res: Response) {
  const { search, category } = req.query
  const materials = await prisma.material.findMany({
    where: {
      active: true,
      category: category ? (category as any) : undefined,
      OR: search
        ? [
            { name: { contains: String(search), mode: 'insensitive' } },
            { code: { contains: String(search) } },
          ]
        : undefined,
    },
    orderBy: { name: 'asc' },
  })
  res.json(materials)
}

export async function getById(req: Request, res: Response) {
  const m = await prisma.material.findUnique({ where: { id: req.params.id } })
  if (!m) throw new AppError('Material não encontrado', 404)
  res.json(m)
}

export async function create(req: Request, res: Response) {
  const data = req.body
  if (!data.name || !data.category || !data.unit) throw new AppError('Campos obrigatórios faltando')
  const code = `MAT${Date.now().toString().slice(-6)}`
  const material = await prisma.material.create({ data: { ...data, code } })
  res.status(201).json(material)
}

export async function update(req: Request, res: Response) {
  const material = await prisma.material.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(material)
}

export async function stockMovements(req: Request, res: Response) {
  const movements = await prisma.stockMovement.findMany({
    where: { materialId: req.params.id },
    orderBy: { occurredAt: 'desc' },
    take: 100,
  })
  res.json(movements)
}
