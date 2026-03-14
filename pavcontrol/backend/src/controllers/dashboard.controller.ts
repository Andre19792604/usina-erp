import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AuthRequest } from '../middleware/auth'
import dayjs from 'dayjs'

export async function overview(req: AuthRequest, res: Response) {
  const companyId = req.user!.companyId
  const today = dayjs().startOf('day').toDate()
  const endOfDay = dayjs().endOf('day').toDate()

  const [
    projectsActive,
    productionToday,
    equipmentActive,
    vehiclesActive,
    fuelToday,
    recentProductions,
  ] = await Promise.all([
    prisma.project.count({ where: { companyId, status: 'EM_ANDAMENTO' } }),
    prisma.production.findMany({
      where: { project: { companyId }, date: { gte: today, lte: endOfDay } },
    }),
    prisma.equipment.count({ where: { companyId, status: 'EM_OPERACAO' } }),
    prisma.vehicle.count({ where: { companyId, active: true } }),
    prisma.fuelLog.findMany({
      where: { vehicle: { companyId }, date: { gte: today, lte: endOfDay } },
    }),
    prisma.production.findMany({
      where: { project: { companyId } },
      include: {
        project: { select: { name: true } },
        service: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ])

  const totalProductionToday = productionToday.reduce((s, p) => s + Number(p.quantity), 0)
  const totalFuelToday = fuelToday.reduce((s, f) => s + Number(f.liters), 0)
  const totalFuelCostToday = fuelToday.reduce((s, f) => s + Number(f.totalCost || 0), 0)

  res.json({
    projectsActive,
    totalProductionToday,
    equipmentActive,
    vehiclesActive,
    totalFuelToday,
    totalFuelCostToday,
    recentProductions,
  })
}
