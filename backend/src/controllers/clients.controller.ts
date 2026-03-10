import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'

export async function list(req: Request, res: Response) {
  const { search, active } = req.query
  const clients = await prisma.client.findMany({
    where: {
      active: active === 'false' ? false : true,
      OR: search
        ? [
            { name: { contains: String(search), mode: 'insensitive' } },
            { cnpjCpf: { contains: String(search) } },
            { code: { contains: String(search) } },
          ]
        : undefined,
    },
    orderBy: { name: 'asc' },
  })
  res.json(clients)
}

export async function getById(req: Request, res: Response) {
  const client = await prisma.client.findUnique({ where: { id: req.params.id } })
  if (!client) throw new AppError('Cliente não encontrado', 404)
  res.json(client)
}

export async function create(req: Request, res: Response) {
  const data = req.body
  if (!data.name || !data.cnpjCpf) throw new AppError('Nome e CNPJ/CPF obrigatórios')

  const code = `CLI${Date.now().toString().slice(-6)}`
  const client = await prisma.client.create({ data: { ...data, code } })
  res.status(201).json(client)
}

export async function update(req: Request, res: Response) {
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(client)
}

export async function remove(req: Request, res: Response) {
  await prisma.client.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Cliente desativado' })
}
