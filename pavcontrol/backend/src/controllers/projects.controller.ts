import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const search = qs(req.query.search)
  const status = qs(req.query.status)
  const projects = await prisma.project.findMany({
    where: {
      companyId: req.user!.companyId,
      active: true,
      status: status ? status as any : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search } },
            { client: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(projects)
}

export async function getById(req: AuthRequest, res: Response) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } })
  if (!project) throw new AppError('Obra não encontrada', 404)
  res.json(project)
}

export async function create(req: AuthRequest, res: Response) {
  const { name } = req.body
  if (!name) throw new AppError('Nome da obra obrigatório')

  const code = `OBR${Date.now().toString().slice(-6)}`
  const project = await prisma.project.create({
    data: { ...req.body, code, companyId: req.user!.companyId },
  })
  res.status(201).json(project)
}

export async function update(req: AuthRequest, res: Response) {
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(project)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.project.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Obra desativada' })
}
