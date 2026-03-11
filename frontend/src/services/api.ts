import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
}

// ── Clients ───────────────────────────────────────────────────
export const clientService = {
  list: (params?: { search?: string; active?: boolean }) =>
    api.get('/clients', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/clients/${id}`).then(r => r.data),
  create: (data: any) => api.post('/clients', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/clients/${id}`).then(r => r.data),
}

// ── Suppliers ─────────────────────────────────────────────────
export const supplierService = {
  list: (params?: { search?: string }) =>
    api.get('/suppliers', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/suppliers/${id}`).then(r => r.data),
  create: (data: any) => api.post('/suppliers', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/suppliers/${id}`).then(r => r.data),
}

// ── Materials ─────────────────────────────────────────────────
export const materialService = {
  list: (params?: { search?: string; category?: string }) =>
    api.get('/materials', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/materials/${id}`).then(r => r.data),
  movements: (id: string) => api.get(`/materials/${id}/movements`).then(r => r.data),
  create: (data: any) => api.post('/materials', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data).then(r => r.data),
}

// ── Production ────────────────────────────────────────────────
export const productionService = {
  list: (params?: { status?: string; from?: string; to?: string }) =>
    api.get('/production', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/production/${id}`).then(r => r.data),
  create: (data: any) => api.post('/production', data).then(r => r.data),
  updateStatus: (id: string, data: any) =>
    api.put(`/production/${id}/status`, data).then(r => r.data),
  addQualityControl: (id: string, data: any) =>
    api.post(`/production/${id}/quality`, data).then(r => r.data),
}

// ── Weight ────────────────────────────────────────────────────
export const weightService = {
  list: (params?: { from?: string; to?: string; vehicleId?: string }) =>
    api.get('/weight', { params }).then(r => r.data),
  create: (data: any) => api.post('/weight', data).then(r => r.data),
}

// ── Financial ─────────────────────────────────────────────────
export const financialService = {
  dashboard: () => api.get('/financial/dashboard').then(r => r.data),
  listPayable: (params?: { status?: string }) =>
    api.get('/financial/payable', { params }).then(r => r.data),
  createPayable: (data: any) => api.post('/financial/payable', data).then(r => r.data),
  payPayable: (id: string, data: any) =>
    api.put(`/financial/payable/${id}/pay`, data).then(r => r.data),
  listReceivable: (params?: { status?: string }) =>
    api.get('/financial/receivable', { params }).then(r => r.data),
  createReceivable: (data: any) => api.post('/financial/receivable', data).then(r => r.data),
  receivePayment: (id: string, data: any) =>
    api.put(`/financial/receivable/${id}/receive`, data).then(r => r.data),
}

// ── NF-e ──────────────────────────────────────────────────────
export const nfeService = {
  list: (params?: { status?: string; clientId?: string; from?: string; to?: string }) =>
    api.get('/nfe', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/nfe/${id}`).then(r => r.data),
  create: (data: any) => api.post('/nfe', data).then(r => r.data),
  importXml: (xml: string) => api.post('/nfe/import-xml', { xml }).then(r => r.data),
  updateStatus: (id: string, data: any) => api.put(`/nfe/${id}/status`, data).then(r => r.data),
  downloadXml: (id: string) => api.get(`/nfe/${id}/xml`, { responseType: 'blob' }).then(r => r.data),
}

// ── Sales ─────────────────────────────────────────────────────
export const salesService = {
  listQuotes: (params?: { status?: string }) =>
    api.get('/quotes', { params }).then(r => r.data),
  createQuote: (data: any) => api.post('/quotes', data).then(r => r.data),
  updateQuoteStatus: (id: string, data: any) =>
    api.put(`/quotes/${id}/status`, data).then(r => r.data),
  convertQuote: (id: string) => api.post(`/quotes/${id}/convert`, {}).then(r => r.data),
  listOrders: (params?: { status?: string }) =>
    api.get('/sales-orders', { params }).then(r => r.data),
  createOrder: (data: any) => api.post('/sales-orders', data).then(r => r.data),
  updateOrderStatus: (id: string, data: any) =>
    api.put(`/sales-orders/${id}/status`, data).then(r => r.data),
}

// ── Purchase ──────────────────────────────────────────────────
export const purchaseService = {
  list: (params?: { status?: string }) =>
    api.get('/purchase-orders', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/purchase-orders/${id}`).then(r => r.data),
  create: (data: any) => api.post('/purchase-orders', data).then(r => r.data),
  receiveItems: (id: string, data: any) =>
    api.post(`/purchase-orders/${id}/receive`, data).then(r => r.data),
  cancel: (id: string) => api.put(`/purchase-orders/${id}/cancel`, {}).then(r => r.data),
}

// ── Vehicles ──────────────────────────────────────────────────
export const vehicleService = {
  list: (params?: { search?: string }) =>
    api.get('/vehicles', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/vehicles/${id}`).then(r => r.data),
  getByPlate: (plate: string) => api.get(`/vehicles/plate/${plate}`).then(r => r.data),
  create: (data: any) => api.post('/vehicles', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/vehicles/${id}`).then(r => r.data),
}

// ── Maintenance ───────────────────────────────────────────────
export const maintenanceService = {
  listEquipments: () => api.get('/equipments').then(r => r.data),
  createEquipment: (data: any) => api.post('/equipments', data).then(r => r.data),
  updateEquipment: (id: string, data: any) =>
    api.put(`/equipments/${id}`, data).then(r => r.data),
  listOrders: (params?: { status?: string }) =>
    api.get('/maintenance-orders', { params }).then(r => r.data),
  getOrderById: (id: string) => api.get(`/maintenance-orders/${id}`).then(r => r.data),
  createOrder: (data: any) => api.post('/maintenance-orders', data).then(r => r.data),
  updateOrderStatus: (id: string, data: any) =>
    api.put(`/maintenance-orders/${id}/status`, data).then(r => r.data),
}

// ── Products / Formulas ───────────────────────────────────────
export const productService = {
  listProducts: () => api.get('/products').then(r => r.data),
  listFormulas: () => api.get('/formulas').then(r => r.data),
  createProduct: (data: any) => api.post('/products', data).then(r => r.data),
  createFormula: (data: any) => api.post('/formulas', data).then(r => r.data),
}

// ── Users ─────────────────────────────────────────────────────
export const userService = {
  list: () => api.get('/users').then(r => r.data),
  create: (data: any) => api.post('/users', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
}
