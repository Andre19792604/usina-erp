import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const projectId = qs(req.query.projectId)
  const from = qs(req.query.from)
  const to = qs(req.query.to)

  const reports = await prisma.report.findMany({
    where: {
      companyId: req.user!.companyId,
      projectId: projectId || undefined,
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: {
      project: { select: { name: true, code: true } },
      user: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  })
  res.json(reports)
}

export async function getById(req: AuthRequest, res: Response) {
  const report = await prisma.report.findUnique({
    where: { id: req.params.id },
    include: {
      project: true,
      user: { select: { name: true } },
    },
  })
  if (!report) throw new AppError('Relatório não encontrado', 404)
  res.json(report)
}

export async function create(req: AuthRequest, res: Response) {
  const { projectId } = req.body
  if (!projectId) throw new AppError('Obra obrigatória')

  const report = await prisma.report.create({
    data: {
      ...req.body,
      userId: req.user!.id,
      companyId: req.user!.companyId,
    },
    include: {
      project: { select: { name: true } },
    },
  })
  res.status(201).json(report)
}

export async function update(req: AuthRequest, res: Response) {
  const report = await prisma.report.update({ where: { id: req.params.id }, data: req.body })
  res.json(report)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.report.delete({ where: { id: req.params.id } })
  res.json({ message: 'Relatório removido' })
}
