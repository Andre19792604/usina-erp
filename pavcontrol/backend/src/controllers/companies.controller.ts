import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export async function list(_req: Request, res: Response) {
  const companies = await prisma.company.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
  res.json(companies)
}

export async function getById(req: Request, res: Response) {
  const company = await prisma.company.findUnique({ where: { id: req.params.id } })
  if (!company) throw new AppError('Empresa não encontrada', 404)
  res.json(company)
}

export async function create(req: Request, res: Response) {
  const { name, cnpj } = req.body
  if (!name || !cnpj) throw new AppError('Nome e CNPJ obrigatórios')

  const exists = await prisma.company.findUnique({ where: { cnpj } })
  if (exists) throw new AppError('CNPJ já cadastrado')

  const company = await prisma.company.create({ data: req.body })
  res.status(201).json(company)
}

export async function update(req: Request, res: Response) {
  const company = await prisma.company.update({ where: { id: req.params.id }, data: req.body })
  res.json(company)
}

export async function myCurrent(req: AuthRequest, res: Response) {
  const company = await prisma.company.findUnique({ where: { id: req.user!.companyId } })
  if (!company) throw new AppError('Empresa não encontrada', 404)
  res.json(company)
}
