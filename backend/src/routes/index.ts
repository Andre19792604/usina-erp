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

// ── Produção ──────────────────────────────────────────────────
router.get('/production', authenticate, production.list)
router.get('/production/:id', authenticate, production.getById)
router.post('/production', authenticate, authorize('ADMIN', 'GERENTE', 'OPERADOR'), production.create)
router.put('/production/:id/status', authenticate, production.updateStatus)
router.post('/production/:id/quality', authenticate, production.addQualityControl)

// ── Balança ───────────────────────────────────────────────────
router.get('/weight', authenticate, weight.list)
router.post('/weight', authenticate, authorize('ADMIN', 'GERENTE', 'BALANCA', 'OPERADOR'), weight.create)

// ── Financeiro ────────────────────────────────────────────────
router.get('/financial/dashboard', authenticate, financial.dashboard)
router.get('/financial/payable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.listPayable)
router.post('/financial/payable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.createPayable)
router.put('/financial/payable/:id/pay', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.payPayable)
router.get('/financial/receivable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO', 'VENDAS'), financial.listReceivable)
router.post('/financial/receivable', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.createReceivable)
router.put('/financial/receivable/:id/receive', authenticate, authorize('ADMIN', 'GERENTE', 'FINANCEIRO'), financial.receivePayment)
