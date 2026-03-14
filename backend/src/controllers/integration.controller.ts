import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { ApiKeyRequest } from '../middleware/apiKeyAuth'

// ── Admin: Gerenciar API keys ──────────────────────────────────

export async function listKeys(_req: Request, res: Response) {
  const keys = await prisma.integrationKey.findMany({
    include: { client: { select: { name: true, cnpjCpf: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(keys)
}

export async function createKey(req: Request, res: Response) {
  const { name, clientId, permissions } = req.body
  if (!name) throw new AppError('Nome obrigatório')

  const apiKey = `usina_${crypto.randomBytes(32).toString('hex')}`
  const key = await prisma.integrationKey.create({
    data: { name, apiKey, clientId, permissions: permissions || ['products:read', 'orders:create', 'orders:read'] },
    include: { client: { select: { name: true } } },
  })
  res.status(201).json(key)
}

export async function revokeKey(req: Request, res: Response) {
  await prisma.integrationKey.update({
    where: { id: req.params.id },
    data: { active: false },
  })
  res.json({ message: 'Chave revogada' })
}

// ── API Pública (autenticada por API key) ──────────────────────

// GET /integration/catalog — Catálogo de produtos disponíveis
export async function catalog(_req: ApiKeyRequest, res: Response) {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      unitPrice: true,
      unit: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  })
  res.json(products)
}

// POST /integration/orders — Criar pedido (vira SalesOrder na usina)
export async function createOrder(req: ApiKeyRequest, res: Response) {
  const { items, deliveryDate, deliveryAddress, notes, externalRef } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Itens do pedido obrigatórios')
  }

  const clientId = req.integration?.clientId
  if (!clientId) throw new AppError('API key não vinculada a um cliente', 400)

  // Validate products and calculate totals
  let totalAmount = 0
  const orderItems: any[] = []

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) throw new AppError(`Produto ${item.productId} não encontrado`, 404)

    const unitPrice = item.unitPrice || Number(product.unitPrice)
    const total = unitPrice * Number(item.quantity)
    totalAmount += total

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      total,
    })
  }

  // Generate order number
  const count = await prisma.salesOrder.count()
  const number = `PV${String(count + 1).padStart(6, '0')}`

  // Create SalesOrder
  const salesOrder = await prisma.salesOrder.create({
    data: {
      number,
      clientId,
      status: 'OPEN',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      address: deliveryAddress,
      totalAmount,
      notes: `[PavControl${externalRef ? ` - Ref: ${externalRef}` : ''}] ${notes || ''}`.trim(),
      items: { create: orderItems },
    },
    include: {
      items: { include: { product: { select: { name: true, type: true } } } },
      client: { select: { name: true } },
    },
  })

  res.status(201).json({
    id: salesOrder.id,
    number: salesOrder.number,
    status: salesOrder.status,
    totalAmount: salesOrder.totalAmount,
    items: salesOrder.items.map(i => ({
      productId: i.productId,
      productName: i.product.name,
      productType: i.product.type,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
    createdAt: salesOrder.createdAt,
  })
}

// GET /integration/orders — Listar pedidos do cliente
export async function listOrders(req: ApiKeyRequest, res: Response) {
  const clientId = req.integration?.clientId
  if (!clientId) throw new AppError('API key não vinculada a um cliente', 400)

  const orders = await prisma.salesOrder.findMany({
    where: { clientId },
    include: {
      items: { include: { product: { select: { name: true, type: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  res.json(orders.map(o => ({
    id: o.id,
    number: o.number,
    status: o.status,
    totalAmount: o.totalAmount,
    deliveryDate: o.deliveryDate,
    items: o.items.map(i => ({
      productId: i.productId,
      productName: i.product.name,
      productType: i.product.type,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  })))
}

// GET /integration/orders/:id — Detalhe de um pedido
export async function getOrder(req: ApiKeyRequest, res: Response) {
  const clientId = req.integration?.clientId
  if (!clientId) throw new AppError('API key não vinculada a um cliente', 400)

  const order = await prisma.salesOrder.findFirst({
    where: { id: req.params.id, clientId },
    include: {
      items: { include: { product: { select: { name: true, type: true, code: true } } } },
      weightTickets: {
        select: { number: true, grossWeight: true, tare: true, netWeight: true, weighedAt: true },
      },
    },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)

  res.json({
    id: order.id,
    number: order.number,
    status: order.status,
    totalAmount: order.totalAmount,
    deliveryDate: order.deliveryDate,
    address: order.address,
    notes: order.notes,
    items: order.items.map(i => ({
      productId: i.productId,
      productCode: i.product.code,
      productName: i.product.name,
      productType: i.product.type,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
    weightTickets: order.weightTickets,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  })
}
