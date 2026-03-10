import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export async function list(req: Request, res: Response) {
  const { status, supplierId } = req.query
  const orders = await prisma.purchaseOrder.findMany({
    where: {
      status: status ? (status as any) : undefined,
      supplierId: supplierId ? String(supplierId) : undefined,
    },
    include: {
      supplier: { select: { name: true, code: true } },
      items: { include: { material: { select: { name: true, unit: true } } } },
      operator: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export async function getById(req: Request, res: Response) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: req.params.id },
    include: {
      supplier: true,
      items: { include: { material: true } },
      operator: { select: { name: true } },
      stockMovements: { include: { material: { select: { name: true } } } },
      accountsPayable: true,
    },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)
  res.json(order)
}

export async function create(req: AuthRequest, res: Response) {
  const { supplierId, expectedDate, items, notes } = req.body
  if (!supplierId || !items?.length) throw new AppError('Campos obrigatórios faltando')

  const totalAmount = items.reduce(
    (sum: number, i: any) => sum + Number(i.quantity) * Number(i.unitPrice),
    0
  )
  const number = `PC${Date.now().toString().slice(-8)}`

  const order = await prisma.purchaseOrder.create({
    data: {
      number,
      supplierId,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      totalAmount,
      notes,
      operatorId: req.user!.id,
      items: {
        create: items.map((i: any) => ({
          materialId: i.materialId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: Number(i.quantity) * Number(i.unitPrice),
        })),
      },
    },
    include: { supplier: { select: { name: true } }, items: true },
  })
  res.status(201).json(order)
}

export async function receiveItems(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { items, nfNumber } = req.body
  // items: [{ purchaseOrderItemId, receivedQty }]

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: { include: { material: true } } },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)

  await prisma.$transaction(async (tx) => {
    for (const recv of items) {
      const item = order.items.find((i) => i.id === recv.purchaseOrderItemId)
      if (!item) continue

      // Update received quantity on item
      await tx.purchaseOrderItem.update({
        where: { id: item.id },
        data: { receivedQty: { increment: recv.receivedQty } },
      })

      // Update material stock
      const material = await tx.material.findUniqueOrThrow({
        where: { id: item.materialId },
      })
      const newBalance = Number(material.currentStock) + Number(recv.receivedQty)
      await tx.material.update({
        where: { id: item.materialId },
        data: { currentStock: newBalance, unitCost: item.unitPrice },
      })

      // Create stock movement
      await tx.stockMovement.create({
        data: {
          materialId: item.materialId,
          type: 'ENTRADA_COMPRA',
          quantity: recv.receivedQty,
          unitCost: item.unitPrice,
          totalCost: Number(recv.receivedQty) * Number(item.unitPrice),
          balance: newBalance,
          purchaseOrderId: id,
          notes: nfNumber ? `NF ${nfNumber}` : undefined,
        },
      })
    }

    // Update order status
    const updatedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: id } })
    const allReceived = updatedItems.every((i) => Number(i.receivedQty) >= Number(i.quantity))
    const anyReceived = updatedItems.some((i) => Number(i.receivedQty) > 0)

    await tx.purchaseOrder.update({
      where: { id },
      data: {
        status: allReceived ? 'RECEIVED' : anyReceived ? 'PARTIAL' : order.status,
      },
    })
  })

  const updated = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: { include: { material: { select: { name: true } } } } },
  })
  res.json(updated)
}

export async function cancel(req: Request, res: Response) {
  const order = await prisma.purchaseOrder.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  })
  res.json(order)
}
