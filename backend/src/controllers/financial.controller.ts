import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { qs } from '../utils/query'

export async function listPayable(req: Request, res: Response) {
  const status = qs(req.query.status)
  const items = await prisma.accountPayable.findMany({
    where: { status: status ? (status as any) : undefined },
    include: { supplier: { select: { name: true } } },
    orderBy: { dueDate: 'asc' },
  })
  res.json(items)
}

export async function createPayable(req: Request, res: Response) {
  const item = await prisma.accountPayable.create({ data: req.body })
  res.status(201).json(item)
}

export async function payPayable(req: Request, res: Response) {
  const { paidAmount, paymentMethod } = req.body
  const id = String(req.params.id)
  const current = await prisma.accountPayable.findUniqueOrThrow({ where: { id } })
  const newPaid = Number(current.paidAmount) + Number(paidAmount)
  const status = newPaid >= Number(current.amount) ? 'PAID' : 'PARTIAL'

  const item = await prisma.accountPayable.update({
    where: { id },
    data: { paidAmount: newPaid, paymentMethod, status, paidAt: status === 'PAID' ? new Date() : undefined },
  })
  res.json(item)
}

export async function listReceivable(req: Request, res: Response) {
  const status = qs(req.query.status)
  const items = await prisma.accountReceivable.findMany({
    where: { status: status ? (status as any) : undefined },
    include: { salesOrder: { select: { number: true } } },
    orderBy: { dueDate: 'asc' },
  })
  res.json(items)
}

export async function createReceivable(req: Request, res: Response) {
  const item = await prisma.accountReceivable.create({ data: req.body })
  res.status(201).json(item)
}

export async function receivePayment(req: Request, res: Response) {
  const { paidAmount, paymentMethod } = req.body
  const id = String(req.params.id)
  const current = await prisma.accountReceivable.findUniqueOrThrow({ where: { id } })
  const newPaid = Number(current.paidAmount) + Number(paidAmount)
  const status = newPaid >= Number(current.amount) ? 'PAID' : 'PARTIAL'

  const item = await prisma.accountReceivable.update({
    where: { id },
    data: { paidAmount: newPaid, paymentMethod, status, paidAt: status === 'PAID' ? new Date() : undefined },
  })
  res.json(item)
}

export async function dashboard(req: Request, res: Response) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [totalPayable, totalReceivable, overduePayable, overdueReceivable] =
    await Promise.all([
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['OPEN', 'PARTIAL'] } },
      }),
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['OPEN', 'PARTIAL'] } },
      }),
      prisma.accountPayable.count({
        where: { status: { in: ['OPEN', 'PARTIAL'] }, dueDate: { lt: today } },
      }),
      prisma.accountReceivable.count({
        where: { status: { in: ['OPEN', 'PARTIAL'] }, dueDate: { lt: today } },
      }),
    ])

  const productionThisMonth = await prisma.productionOrder.aggregate({
    _sum: { producedQty: true },
    where: { status: 'COMPLETED', completedAt: { gte: startOfMonth } },
  })

  res.json({
    totalPayable: totalPayable._sum.amount ?? 0,
    totalReceivable: totalReceivable._sum.amount ?? 0,
    overduePayable,
    overdueReceivable,
    productionThisMonth: productionThisMonth._sum.producedQty ?? 0,
  })
}
