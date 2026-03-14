import { Response } from 'express'
import axios from 'axios'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

// Helper: get axios instance for a usina integration
async function getUsinaApi(integrationId: string) {
  const integration = await prisma.usinaIntegration.findUnique({ where: { id: integrationId } })
  if (!integration || !integration.active) throw new AppError('Integração não encontrada ou inativa', 404)

  return {
    api: axios.create({
      baseURL: integration.baseUrl,
      headers: { 'x-api-key': integration.apiKey, 'Content-Type': 'application/json' },
      timeout: 10000,
    }),
    integration,
  }
}

// ── Gerenciar integrações ──────────────────────────────────────

export async function list(req: AuthRequest, res: Response) {
  const integrations = await prisma.usinaIntegration.findMany({
    where: { companyId: req.user!.companyId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(integrations)
}

export async function create(req: AuthRequest, res: Response) {
  const { name, baseUrl, apiKey } = req.body
  if (!name || !baseUrl || !apiKey) throw new AppError('Nome, URL e API key obrigatórios')

  const integration = await prisma.usinaIntegration.create({
    data: { name, baseUrl, apiKey, companyId: req.user!.companyId },
  })
  res.status(201).json(integration)
}

export async function update(req: AuthRequest, res: Response) {
  const integration = await prisma.usinaIntegration.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(integration)
}

export async function remove(req: AuthRequest, res: Response) {
  await prisma.usinaIntegration.update({ where: { id: req.params.id }, data: { active: false } })
  res.json({ message: 'Integração desativada' })
}

// ── Testar conexão ─────────────────────────────────────────────

export async function testConnection(req: AuthRequest, res: Response) {
  try {
    const { api } = await getUsinaApi(req.params.id)
    const response = await api.get('/integration/catalog')
    await prisma.usinaIntegration.update({
      where: { id: req.params.id },
      data: { lastSyncAt: new Date() },
    })
    res.json({ success: true, productsCount: response.data.length })
  } catch (err: any) {
    res.json({ success: false, error: err.response?.data?.error || err.message })
  }
}

// ── Catálogo de produtos da usina ──────────────────────────────

export async function fetchCatalog(req: AuthRequest, res: Response) {
  const { api } = await getUsinaApi(req.params.id)
  try {
    const response = await api.get('/integration/catalog')
    res.json(response.data)
  } catch (err: any) {
    throw new AppError(err.response?.data?.error || 'Erro ao buscar catálogo da usina', 502)
  }
}

// ── Pedidos de Material ────────────────────────────────────────

export async function listOrders(req: AuthRequest, res: Response) {
  const orders = await prisma.materialOrder.findMany({
    where: { project: { companyId: req.user!.companyId } },
    include: {
      project: { select: { name: true, code: true } },
      usinaIntegration: { select: { name: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export async function getOrderById(req: AuthRequest, res: Response) {
  const order = await prisma.materialOrder.findUnique({
    where: { id: req.params.id },
    include: {
      project: true,
      usinaIntegration: { select: { name: true, baseUrl: true } },
      items: true,
    },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)
  res.json(order)
}

export async function createOrder(req: AuthRequest, res: Response) {
  const { usinaIntegrationId, projectId, items, deliveryDate, deliveryAddress, notes } = req.body
  if (!usinaIntegrationId || !projectId || !items?.length) {
    throw new AppError('Integração, obra e itens obrigatórios')
  }

  const code = `MAT${Date.now().toString().slice(-6)}`
  const order = await prisma.materialOrder.create({
    data: {
      code,
      usinaIntegrationId,
      projectId,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      deliveryAddress,
      notes,
      items: { create: items },
    },
    include: { items: true, project: { select: { name: true } } },
  })
  res.status(201).json(order)
}

// ── Enviar pedido para a usina ─────────────────────────────────

export async function sendOrder(req: AuthRequest, res: Response) {
  const order = await prisma.materialOrder.findUnique({
    where: { id: req.params.id },
    include: { items: true, usinaIntegration: true, project: true },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)
  if (order.status !== 'RASCUNHO') throw new AppError('Pedido já foi enviado')

  const { api } = await getUsinaApi(order.usinaIntegrationId)

  try {
    const response = await api.post('/integration/orders', {
      items: order.items.map(i => ({
        productId: i.usinaProductId,
        quantity: Number(i.quantity),
        unitPrice: i.unitPrice ? Number(i.unitPrice) : undefined,
      })),
      deliveryDate: order.deliveryDate?.toISOString(),
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      externalRef: order.code,
    })

    const usinaData = response.data
    await prisma.materialOrder.update({
      where: { id: order.id },
      data: {
        status: 'ENVIADO',
        usinaOrderId: usinaData.id,
        usinaOrderNumber: usinaData.number,
        totalAmount: usinaData.totalAmount,
      },
    })

    res.json({ success: true, usinaOrderNumber: usinaData.number, totalAmount: usinaData.totalAmount })
  } catch (err: any) {
    throw new AppError(err.response?.data?.error || 'Erro ao enviar pedido para a usina', 502)
  }
}

// ── Sincronizar status do pedido com a usina ───────────────────

export async function syncOrderStatus(req: AuthRequest, res: Response) {
  const order = await prisma.materialOrder.findUnique({
    where: { id: req.params.id },
    include: { usinaIntegration: true },
  })
  if (!order) throw new AppError('Pedido não encontrado', 404)
  if (!order.usinaOrderId) throw new AppError('Pedido ainda não enviado para a usina')

  const { api } = await getUsinaApi(order.usinaIntegrationId)

  try {
    const response = await api.get(`/integration/orders/${order.usinaOrderId}`)
    const usinaOrder = response.data

    // Map usina status to PavControl status
    const statusMap: Record<string, string> = {
      OPEN: 'ACEITO',
      IN_PRODUCTION: 'EM_PRODUCAO',
      READY: 'PRONTO',
      DELIVERING: 'ENTREGANDO',
      COMPLETED: 'ENTREGUE',
      CANCELLED: 'CANCELADO',
    }

    const newStatus = statusMap[usinaOrder.status] || order.status

    await prisma.materialOrder.update({
      where: { id: order.id },
      data: {
        status: newStatus as any,
        totalAmount: usinaOrder.totalAmount,
      },
    })

    res.json({
      usinaStatus: usinaOrder.status,
      pavcontrolStatus: newStatus,
      weightTickets: usinaOrder.weightTickets || [],
    })
  } catch (err: any) {
    throw new AppError(err.response?.data?.error || 'Erro ao sincronizar status', 502)
  }
}
