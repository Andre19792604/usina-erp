import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

// ── Quotes ────────────────────────────────────────────────────

export async function listQuotes(req: Request, res: Response) {
  const { status, clientId } = req.query
  const quotes = await prisma.quote.findMany({
    where: {
      status: status ? (status as any) : undefined,
      clientId: clientId ? String(clientId) : undefined,
    },
    include: {
      client: { select: { name: true, code: true } },
      items: { include: { product: { select: { name: true, type: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(quotes)
}

export async function getQuoteById(req: Request, res: Response) {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      items: { include: { product: true } },
      salesOrders: { select: { number: true, status: true } },
    },
  })
  if (!quote) throw new AppError('Orçamento não encontrado', 404)
  res.json(quote)
}

export async function createQuote(req: AuthRequest, res: Response) {
  const { clientId, validUntil, items, notes } = req.body
  if (!clientId || !validUntil || !items?.length)
    throw new AppError('Campos obrigatórios faltando')

  const totalAmount = items.reduce(
    (sum: number, i: any) => sum + Number(i.quantity) * Number(i.unitPrice),
    0
  )
  const number = `ORC${Date.now().toString().slice(-8)}`

  const quote = await prisma.quote.create({
    data: {
      number,
      clientId,
      validUntil: new Date(validUntil),
      totalAmount,
      notes,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: Number(i.quantity) * Number(i.unitPrice),
        })),
      },
    },
    include: { client: { select: { name: true } }, items: true },
  })
  res.status(201).json(quote)
}

export async function updateQuoteStatus(req: Request, res: Response) {
  const { status } = req.body
  const quote = await prisma.quote.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(quote)
}

// Convert approved quote → sales order
export async function quoteToSalesOrder(req: AuthRequest, res: Response) {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  })
  if (!quote) throw new AppError('Orçamento não encontrado', 404)
  if (quote.status !== 'APPROVED')
    throw new AppError('Orçamento precisa estar aprovado para gerar pedido')

  const number = `PV${Date.now().toString().slice(-8)}`
  const salesOrder = await prisma.salesOrder.create({
    data: {
      number,
      clientId: quote.clientId,
      quoteId: quote.id,
      totalAmount: quote.totalAmount,
      operatorId: req.user!.id,
      items: {
        create: quote.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
      },
    },
    include: { client: { select: { name: true } }, items: true },
  })

  // Mark quote as having a sales order (no status change here — quote stays APPROVED)
  res.status(201).json(salesOrder)
}

// ── Sales Orders ──────────────────────────────────────────────

export async function listSalesOrders(req: Request, res: Response) {
  const { status, clientId, from, to } = req.query
  const orders = await prisma.salesOrder.findMany({
    where: {
      status: status ? (status as any) : undefined,
      clientId: clientId ? String(clientId) : undefined,
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    include: {
      client: { select: { name: true, code: true } },
      items: { include: { product: { select: { name: true, type: true } } } },
      operator: { select: { name: true } },
      _count: { select: { weightTickets: true, productionOrders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export async function getSalesOrderById(req: Request, res: Response) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      items: { include: { product: true } },
      operator: { select: { name: true } },
      productionOrders: { select: { number: true, status: true, producedQty: true } },
      weightTickets: { select: { number: true, netWeight: true, weighedAt: true } },
      invoices: { select: { number: true, status: true, totalAmount: true } },
      accountsReceivable: { select: { amount: true, status: true, dueDate: true } },
    },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)
  res.json(order)
}

export async function createSalesOrder(req: AuthRequest, res: Response) {
  const { clientId, quoteId, deliveryDate, address, items, notes } = req.body
  if (!clientId || !items?.length) throw new AppError('Campos obrigatórios faltando')

  const totalAmount = items.reduce(
    (sum: number, i: any) => sum + Number(i.quantity) * Number(i.unitPrice),
    0
  )
  const number = `PV${Date.now().toString().slice(-8)}`

  const order = await prisma.salesOrder.create({
    data: {
      number,
      clientId,
      quoteId,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      address,
      totalAmount,
      notes,
      operatorId: req.user!.id,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: Number(i.quantity) * Number(i.unitPrice),
        })),
      },
    },
    include: { client: { select: { name: true } }, items: true },
  })
  res.status(201).json(order)
}

export async function updateSalesOrderStatus(req: Request, res: Response) {
  const { status } = req.body
  const order = await prisma.salesOrder.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(order)
}
