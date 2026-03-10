import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'

// ── Products ──────────────────────────────────────────────────

export async function listProducts(req: Request, res: Response) {
  const { search } = req.query
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: search
        ? [
            { name: { contains: String(search), mode: 'insensitive' } },
            { code: { contains: String(search) } },
          ]
        : undefined,
    },
    include: { formulas: { where: { active: true }, select: { id: true, name: true, version: true } } },
    orderBy: { name: 'asc' },
  })
  res.json(products)
}

export async function getProductById(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      formulas: {
        where: { active: true },
        include: { items: { include: { material: true } } },
      },
    },
  })
  if (!product) throw new AppError('Produto não encontrado', 404)
  res.json(product)
}

export async function createProduct(req: Request, res: Response) {
  const { name, type, description, unitPrice, unit } = req.body
  if (!name || !type) throw new AppError('Nome e tipo obrigatórios')
  const code = `PROD${Date.now().toString().slice(-6)}`
  const product = await prisma.product.create({
    data: { code, name, type, description, unitPrice, unit },
  })
  res.status(201).json(product)
}

export async function updateProduct(req: Request, res: Response) {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(product)
}

// ── Formulas (Traços) ─────────────────────────────────────────

export async function listFormulas(req: Request, res: Response) {
  const { productId } = req.query
  const formulas = await prisma.formula.findMany({
    where: {
      active: true,
      productId: productId ? String(productId) : undefined,
    },
    include: {
      product: { select: { name: true, type: true } },
      items: { include: { material: { select: { name: true, unit: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(formulas)
}

export async function getFormulaById(req: Request, res: Response) {
  const formula = await prisma.formula.findUnique({
    where: { id: req.params.id },
    include: {
      product: true,
      items: { include: { material: true } },
    },
  })
  if (!formula) throw new AppError('Fórmula não encontrada', 404)
  res.json(formula)
}

export async function createFormula(req: Request, res: Response) {
  const { productId, name, items, notes } = req.body
  if (!productId || !name || !items?.length)
    throw new AppError('Campos obrigatórios faltando')

  // Validate percentages sum to 100
  const totalPct = items.reduce((s: number, i: any) => s + Number(i.percentage), 0)
  if (Math.abs(totalPct - 100) > 0.1)
    throw new AppError(`Soma das porcentagens deve ser 100% (atual: ${totalPct.toFixed(2)}%)`)

  // Get latest version for this product
  const latest = await prisma.formula.findFirst({
    where: { productId },
    orderBy: { version: 'desc' },
  })
  const version = (latest?.version ?? 0) + 1

  const code = `TRACO${Date.now().toString().slice(-6)}`
  const formula = await prisma.formula.create({
    data: {
      code,
      name,
      productId,
      version,
      notes,
      items: {
        create: items.map((i: any) => ({
          materialId: i.materialId,
          percentage: i.percentage,
        })),
      },
    },
    include: {
      items: { include: { material: { select: { name: true } } } },
    },
  })
  res.status(201).json(formula)
}

export async function updateFormula(req: Request, res: Response) {
  const { name, notes, items } = req.body
  const { id } = req.params

  if (items) {
    const totalPct = items.reduce((s: number, i: any) => s + Number(i.percentage), 0)
    if (Math.abs(totalPct - 100) > 0.1)
      throw new AppError(`Soma das porcentagens deve ser 100% (atual: ${totalPct.toFixed(2)}%)`)

    // Delete old items and recreate
    await prisma.formulaItem.deleteMany({ where: { formulaId: id } })
    await prisma.formulaItem.createMany({
      data: items.map((i: any) => ({
        formulaId: id,
        materialId: i.materialId,
        percentage: i.percentage,
      })),
    })
  }

  const formula = await prisma.formula.update({
    where: { id },
    data: { name, notes },
    include: { items: { include: { material: { select: { name: true } } } } },
  })
  res.json(formula)
}
