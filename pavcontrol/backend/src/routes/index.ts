import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import * as auth from '../controllers/auth.controller'
import * as users from '../controllers/users.controller'
import * as companies from '../controllers/companies.controller'
import * as projects from '../controllers/projects.controller'
import * as services from '../controllers/services.controller'
import * as production from '../controllers/production.controller'
import * as equipment from '../controllers/equipment.controller'
import * as vehicles from '../controllers/vehicles.controller'
import * as fuel from '../controllers/fuel.controller'
import * as reports from '../controllers/reports.controller'
import * as dashboard from '../controllers/dashboard.controller'
import * as maintenance from '../controllers/maintenance.controller'
import * as usina from '../controllers/usina-integration.controller'

export const router = Router()

// ── Auth ──────────────────────────────────────────────────────
router.post('/auth/login', auth.login)
router.get('/auth/me', authenticate, auth.me)
router.put('/auth/password', authenticate, auth.changePassword)

// ── Dashboard ─────────────────────────────────────────────────
router.get('/dashboard', authenticate, dashboard.overview)

// ── Empresas ──────────────────────────────────────────────────
router.get('/companies', authenticate, authorize('ADMIN'), companies.list)
router.get('/companies/me', authenticate, companies.myCurrent)
router.get('/companies/:id', authenticate, authorize('ADMIN'), companies.getById)
router.post('/companies', authenticate, authorize('ADMIN'), companies.create)
router.put('/companies/:id', authenticate, authorize('ADMIN'), companies.update)

// ── Usuários ──────────────────────────────────────────────────
router.get('/users', authenticate, authorize('ADMIN', 'GERENTE'), users.list)
router.post('/users', authenticate, authorize('ADMIN'), users.create)
router.put('/users/:id', authenticate, authorize('ADMIN'), users.update)
router.delete('/users/:id', authenticate, authorize('ADMIN'), users.remove)

// ── Obras / Projetos ──────────────────────────────────────────
router.get('/projects', authenticate, projects.list)
router.get('/projects/:id', authenticate, projects.getById)
router.post('/projects', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO'), projects.create)
router.put('/projects/:id', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO'), projects.update)
router.delete('/projects/:id', authenticate, authorize('ADMIN', 'GERENTE'), projects.remove)

// ── Serviços ──────────────────────────────────────────────────
router.get('/services', authenticate, services.list)
router.post('/services', authenticate, authorize('ADMIN', 'GERENTE'), services.create)
router.put('/services/:id', authenticate, authorize('ADMIN', 'GERENTE'), services.update)
router.delete('/services/:id', authenticate, authorize('ADMIN', 'GERENTE'), services.remove)

// ── Produção Diária ───────────────────────────────────────────
router.get('/production', authenticate, production.list)
router.get('/production/:id', authenticate, production.getById)
router.post('/production', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO', 'OPERADOR'), production.create)
router.put('/production/:id/status', authenticate, production.updateStatus)

// ── Equipamentos ──────────────────────────────────────────────
router.get('/equipment', authenticate, equipment.list)
router.get('/equipment/:id', authenticate, equipment.getById)
router.post('/equipment', authenticate, authorize('ADMIN', 'GERENTE'), equipment.create)
router.put('/equipment/:id', authenticate, authorize('ADMIN', 'GERENTE'), equipment.update)
router.delete('/equipment/:id', authenticate, authorize('ADMIN', 'GERENTE'), equipment.remove)
router.get('/equipment/:id/logs', authenticate, equipment.listLogs)
router.post('/equipment/:id/logs', authenticate, equipment.createLog)
router.put('/equipment/:id/logs/:logId', authenticate, equipment.updateLog)

// ── Veículos ──────────────────────────────────────────────────
router.get('/vehicles', authenticate, vehicles.list)
router.get('/vehicles/:id', authenticate, vehicles.getById)
router.post('/vehicles', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.create)
router.put('/vehicles/:id', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.update)
router.delete('/vehicles/:id', authenticate, authorize('ADMIN', 'GERENTE'), vehicles.remove)
router.get('/vehicles/:id/logs', authenticate, vehicles.listLogs)
router.post('/vehicles/:id/logs', authenticate, vehicles.createLog)
router.put('/vehicles/:id/logs/:logId', authenticate, vehicles.updateLog)

// ── Combustível ───────────────────────────────────────────────
router.get('/fuel', authenticate, fuel.list)
router.get('/fuel/summary', authenticate, fuel.summary)
router.post('/fuel', authenticate, fuel.create)
router.put('/fuel/:id', authenticate, fuel.update)
router.delete('/fuel/:id', authenticate, fuel.remove)

// ── Relatórios Diários ────────────────────────────────────────
router.get('/reports', authenticate, reports.list)
router.get('/reports/:id', authenticate, reports.getById)
router.post('/reports', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO'), reports.create)
router.put('/reports/:id', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO'), reports.update)
router.delete('/reports/:id', authenticate, authorize('ADMIN', 'GERENTE'), reports.remove)

// ── Manutenção ────────────────────────────────────────────────
router.get('/maintenance', authenticate, maintenance.list)
router.post('/maintenance', authenticate, authorize('ADMIN', 'GERENTE', 'OPERADOR'), maintenance.create)
router.put('/maintenance/:id/status', authenticate, maintenance.updateStatus)

// ── Integração Usina ERP ────────────────────────────────────────
router.get('/usina', authenticate, usina.list)
router.post('/usina', authenticate, authorize('ADMIN', 'GERENTE'), usina.create)
router.put('/usina/:id', authenticate, authorize('ADMIN', 'GERENTE'), usina.update)
router.delete('/usina/:id', authenticate, authorize('ADMIN', 'GERENTE'), usina.remove)
router.post('/usina/:id/test', authenticate, usina.testConnection)
router.get('/usina/:id/catalog', authenticate, usina.fetchCatalog)

// ── Pedidos de Material (via Usina) ─────────────────────────────
router.get('/material-orders', authenticate, usina.listOrders)
router.get('/material-orders/:id', authenticate, usina.getOrderById)
router.post('/material-orders', authenticate, authorize('ADMIN', 'GERENTE', 'ENCARREGADO'), usina.createOrder)
router.post('/material-orders/:id/send', authenticate, authorize('ADMIN', 'GERENTE'), usina.sendOrder)
router.post('/material-orders/:id/sync', authenticate, usina.syncOrderStatus)
