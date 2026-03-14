import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { qs } from '../utils/query'

export async function list(req: AuthRequest, res: Response) {
  const search = qs(req.query.search)
  const equipment = await prisma.equipment.findMany({
    where: {
      companyId: req.user!.companyId,
      active: true,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search } },
          ]
        : undefined,
    },
    orderBy: { name: 'asc' },
  })
  res.json(equipment)
}

export async function getById(req: AuthRequest, res: Response) {
  const equipment = await prisma.equipment.findUnique({ where: { id: req.params.id } })
  if (!equipment) throw new AppError('Equipamento não encontrado', 404)
  res.json(equipment)
}

export async function create(req: AuthRequest, res: Response) {
  const { name } = req.body
  if (!name) throw new AppError('Nome do equipamento obrigatório')

  const code = `EQP${Date.now().toString().slice(-6)}`
  const equipment = await prisma.equipment.create({
    data: { ...req.body, code, companyId: req.user!.companyId },
  })
  res.status(201).json(equipment)
}

export async function update(req: AuthRequest, res: Response) {
  const equipment = await prisma.equipment.update({ where: { id: req.params.id }, data: req.body })
  res.json(equipment)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.equipment.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Equipamento desativado' })
}

// ── Horímetro Logs ─────────────────────────────────────────────

export async function listLogs(req: AuthRequest, res: Response) {
  const logs = await prisma.equipmentLog.findMany({
    where: { equipmentId: req.params.id },
    include: { equipment: { select: { name: true, code: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  })
  res.json(logs)
}

export async function createLog(req: AuthRequest, res: Response) {
  const { hourmeterStart } = req.body
  if (!hourmeterStart) throw new AppError('Horímetro inicial obrigatório')

  const log = await prisma.equipmentLog.create({
    data: { ...req.body, equipmentId: req.params.id },
  })
  res.status(201).json(log)
}

export async function updateLog(req: AuthRequest, res: Response) {
  const data: any = { ...req.body }
  if (data.hourmeterStart && data.hourmeterEnd) {
    data.hoursWorked = Number(data.hourmeterEnd) - Number(data.hourmeterStart)
  }
  const log = await prisma.equipmentLog.update({ where: { id: req.params.logId }, data })
  res.json(log)
}
