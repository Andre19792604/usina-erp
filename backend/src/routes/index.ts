import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import * as auth from '../controllers/auth.controller'
import * as users from '../controllers/users.controller'
import * as clients from '../controllers/clients.controller'
import * as suppliers from '../controllers/suppliers.controller'
import * as materials from '../controllers/materials.controller'
import * as production from '../controllers/production.controller'
import * as weight from '../controllers/weight.controller'
import * as financial from '../controllers/financial.controller'
import * as sales from '../controllers/sales.controller'
import * as purchase from '../controllers/purchase.controller'
import * as products from '../controllers/products.controller'
import * as vehicles from '../controllers/vehicles.controller'
import * as maintenance from '../controllers/maintenance.controller'
import * as nfe from '../controllers/nfe.controller'

export const router = Router()

// ── Auth ──────────────────────────────────────────────────────
router.post('/auth/login', auth.login)
router.get('/auth/me', authenticate, auth.me)
router.put('/auth/password', authenticate, auth.changePassword)

// ── Usuários ──────────────────────────────────────────────────
router.get('/users', authenticate, authorize('ADMIN', 'GERENTE'), users.list)
router.post('/users', authenticate, authorize('ADMIN'), users.create)
router.put('/users/:id', authenticate, authorize('ADMIN'), users.update)
router.delete('/users/:id', authenticate, authorize('ADMIN'), users.remove)

// ── Clientes ──────────────────────────────────────────────────
router.get('/clients', authenticate, clients.list)
router.get('/clients/:id', authenticate, clients.getById)
router.post('/clients', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), clients.create)
router.put('/clients/:id', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), clients.update)
router.delete('/clients/:id', authenticate, authorize('ADMIN', 'GERENTE'), clients.remove)

// ── Fornecedores ──────────────────────────────────────────────
router.get('/suppliers', authenticate, suppliers.list)
router.get('/suppliers/:id', authenticate, suppliers.getById)
router.post('/suppliers', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS'), suppliers.create)
router.put('/suppliers/:id', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS'), suppliers.update)
router.delete('/suppliers/:id', authenticate, authorize('ADMIN', 'GERENTE'), suppliers.remove)

// ── Materiais / Estoque ────────────────────────────────────────
router.get('/materials', authenticate, materials.list)
router.get('/materials/:id', authenticate, materials.getById)
router.get('/materials/:id/movements', authenticate, materials.stockMovements)
router.post('/materials', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS'), materials.create)
router.put('/materials/:id', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS'), materials.update)

// ── Produtos e Fórmulas (Traços) ──────────────────────────────
router.get('/products', authenticate, products.listProducts)
router.get('/products/:id', authenticate, products.getProductById)
router.post('/products', authenticate, authorize('ADMIN', 'GERENTE'), products.createProduct)
router.put('/products/:id', authenticate, authorize('ADMIN', 'GERENTE'), products.updateProduct)
router.get('/formulas', authenticate, products.listFormulas)
router.get('/formulas/:id', authenticate, products.getFormulaById)
router.post('/formulas', authenticate, authorize('ADMIN', 'GERENTE', 'OPERADOR'), products.createFormula)
router.put('/formulas/:id', authenticate, authorize('ADMIN', 'GERENTE'), products.updateFormula)

// ── Produção ──────────────────────────────────────────────────
router.get('/production', authenticate, production.list)
router.get('/production/:id', authenticate, production.getById)
router.post('/production', authenticate, authorize('ADMIN', 'GERENTE', 'OPERADOR'), production.create)
router.put('/production/:id/status', authenticate, production.updateStatus)
router.post('/production/:id/quality', authenticate, production.addQualityControl)

// ── Balança ───────────────────────────────────────────────────
router.get('/weight', authenticate, weight.list)
router.post('/weight', authenticate, authorize('ADMIN', 'GERENTE', 'BALANCA', 'OPERADOR'), weight.create)

// ── Vendas ────────────────────────────────────────────────────
router.get('/quotes', authenticate, sales.listQuotes)
router.get('/quotes/:id', authenticate, sales.getQuoteById)
router.post('/quotes', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), sales.createQuote)
router.put('/quotes/:id/status', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), sales.updateQuoteStatus)
router.post('/quotes/:id/convert', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), sales.quoteToSalesOrder)
router.get('/sales-orders', authenticate, sales.listSalesOrders)
router.get('/sales-orders/:id', authenticate, sales.getSalesOrderById)
router.post('/sales-orders', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), sales.createSalesOrder)
router.put('/sales-orders/:id/status', authenticate, authorize('ADMIN', 'GERENTE', 'VENDAS'), sales.updateSalesOrderStatus)

// ── Compras ───────────────────────────────────────────────────
router.get('/purchase-orders', authenticate, purchase.list)
router.get('/purchase-orders/:id', authenticate, purchase.getById)
router.post('/purchase-orders', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS'), purchase.create)
router.post('/purchase-orders/:id/receive', authenticate, authorize('ADMIN', 'GERENTE', 'COMPRAS', 'OPERADOR'), purchase.receiveItems)
router.put('/purchase-orders/:id/cancel', authenticate, authorize('ADMIN', 'GERENTE'), purchase.cancel)

// ── Financeiro ────────────────────────────────────────────────
router.get('/financial/dashboard', authenticate, financial.dashboard)
router.get('/financial/payable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.listPayable)
router.post('/financial/payable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.createPayable)
router.put('/financial/payable/:id/pay', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.payPayable)
router.get('/financial/receivable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO', 'VENDAS'), financial.listReceivable)
router.post('/financial/receivable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.createReceivable)
router.put('/financial/receivable/:id/receive', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.receivePayment)

// ── Veículos ──────────────────────────────────────────────────
router.get('/vehicles', authenticate, vehicles.list)
router.get('/vehicles/plate/:plate', authenticate, vehicles.getByPlate)
router.get('/vehicles/:id', authenticate, vehicles.getById)
router.post('/vehicles', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.create)
router.put('/vehicles/:id', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.update)
router.delete('/vehicles/:id', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.remove)

// ── Manutenção ────────────────────────────────────────────────
router.get('/equipments', authenticate, maintenance.listEquipments)
router.post('/equipments', authenticate, authorize('ADMIN', 'GERENTE', 'MANUTENCAO'), maintenance.createEquipment)
router.put('/equipments/:id', authenticate, authorize('ADMIN', 'GERENTE', 'MANUTENCAO'), maintenance.updateEquipment)
router.get('/maintenance-orders', authenticate, maintenance.listOrders)
router.get('/maintenance-orders/:id', authenticate, maintenance.getOrderById)
router.post('/maintenance-orders', authenticate, authorize('ADMIN', 'GERENTE', 'MANUTENCAO'), maintenance.createOrder)
router.put('/maintenance-orders/:id/status', authenticate, maintenance.updateOrderStatus)

// ── NF-e ──────────────────────────────────────────────────────
router.get('/nfe', authenticate, nfe.list)
router.get('/nfe/:id', authenticate, nfe.getById)
router.get('/nfe/:id/xml', authenticate, nfe.getXml)
router.post('/nfe', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO', 'VENDAS'), nfe.create)
router.post('/nfe/import-xml', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), nfe.importXml)
router.put('/nfe/:id/status', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), nfe.updateStatus)
