import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { qs } from '../utils/query'

export async function list(req: Request, res: Response) {
  const search = qs(req.query.search)
  const suppliers = await prisma.supplier.findMany({
    where: {
      active: true,
      OR: search
        ? [
            { name: { contains: String(search), mode: 'insensitive' } },
            { cnpjCpf: { contains: String(search) } },
          ]
        : undefined,
    },
    orderBy: { name: 'asc' },
  })
  res.json(suppliers)
}

export async function getById(req: Request, res: Response) {
  const s = await prisma.supplier.findUnique({ where: { id: String(req.params.id) } })
  if (!s) throw new AppError('Fornecedor não encontrado', 404)
  res.json(s)
}

export async function create(req: Request, res: Response) {
  const data = req.body
  if (!data.name || !data.cnpjCpf) throw new AppError('Nome e CNPJ/CPF obrigatórios')
  const code = `FOR${Date.now().toString().slice(-6)}`
  const supplier = await prisma.supplier.create({ data: { ...data, code } })
  res.status(201).json(supplier)
}

export async function update(req: Request, res: Response) {
  const supplier = await prisma.supplier.update({
    where: { id: String(req.params.id) },
    data: req.body,
  })
  res.json(supplier)
}

export async function remove(req: Request, res: Response) {
  await prisma.supplier.update({ where: { id: String(req.params.id) }, data: { active: false } })
  res.json({ message: 'Fornecedor desativado' })
}
