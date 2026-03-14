import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'

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

// ── Dashboard ────────────────────────────────────────────────
export const dashboardService = {
  overview: () => api.get('/dashboard').then(r => r.data),
}

// ── Companies ────────────────────────────────────────────────
export const companyService = {
  list: () => api.get('/companies').then(r => r.data),
  myCurrent: () => api.get('/companies/me').then(r => r.data),
  create: (data: any) => api.post('/companies', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/companies/${id}`, data).then(r => r.data),
}

// ── Users ────────────────────────────────────────────────────
export const userService = {
  list: () => api.get('/users').then(r => r.data),
  create: (data: any) => api.post('/users', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
}

// ── Projects (Obras) ────────────────────────────────────────
export const projectService = {
  list: (params?: { search?: string; status?: string }) =>
    api.get('/projects', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data: any) => api.post('/projects', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`).then(r => r.data),
}

// ── Services (Biblioteca de Serviços) ────────────────────────
export const serviceService = {
  list: () => api.get('/services').then(r => r.data),
  create: (data: any) => api.post('/services', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/services/${id}`).then(r => r.data),
}

// ── Production ──────────────────────────────────────────────
export const productionService = {
  list: (params?: { projectId?: string; status?: string; from?: string; to?: string }) =>
    api.get('/production', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/production/${id}`).then(r => r.data),
  create: (data: any) => api.post('/production', data).then(r => r.data),
  updateStatus: (id: string, data: any) =>
    api.put(`/production/${id}/status`, data).then(r => r.data),
}

// ── Equipment ───────────────────────────────────────────────
export const equipmentService = {
  list: (params?: { search?: string }) =>
    api.get('/equipment', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/equipment/${id}`).then(r => r.data),
  create: (data: any) => api.post('/equipment', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/equipment/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/equipment/${id}`).then(r => r.data),
  listLogs: (equipmentId: string) =>
    api.get(`/equipment/${equipmentId}/logs`).then(r => r.data),
  createLog: (equipmentId: string, data: any) =>
    api.post(`/equipment/${equipmentId}/logs`, data).then(r => r.data),
  updateLog: (equipmentId: string, logId: string, data: any) =>
    api.put(`/equipment/${equipmentId}/logs/${logId}`, data).then(r => r.data),
}

// ── Vehicles ────────────────────────────────────────────────
export const vehicleService = {
  list: (params?: { search?: string }) =>
    api.get('/vehicles', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/vehicles/${id}`).then(r => r.data),
  create: (data: any) => api.post('/vehicles', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/vehicles/${id}`).then(r => r.data),
  listLogs: (vehicleId: string) =>
    api.get(`/vehicles/${vehicleId}/logs`).then(r => r.data),
  createLog: (vehicleId: string, data: any) =>
    api.post(`/vehicles/${vehicleId}/logs`, data).then(r => r.data),
  updateLog: (vehicleId: string, logId: string, data: any) =>
    api.put(`/vehicles/${vehicleId}/logs/${logId}`, data).then(r => r.data),
}

// ── Fuel ────────────────────────────────────────────────────
export const fuelService = {
  list: (params?: { vehicleId?: string; from?: string; to?: string }) =>
    api.get('/fuel', { params }).then(r => r.data),
  summary: (params?: { from?: string; to?: string }) =>
    api.get('/fuel/summary', { params }).then(r => r.data),
  create: (data: any) => api.post('/fuel', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/fuel/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/fuel/${id}`).then(r => r.data),
}

// ── Reports ─────────────────────────────────────────────────
export const reportService = {
  list: (params?: { projectId?: string; from?: string; to?: string }) =>
    api.get('/reports', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/reports/${id}`).then(r => r.data),
  create: (data: any) => api.post('/reports', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/reports/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/reports/${id}`).then(r => r.data),
}

// ── Maintenance ─────────────────────────────────────────────
export const maintenanceService = {
  list: (params?: { status?: string }) =>
    api.get('/maintenance', { params }).then(r => r.data),
  create: (data: any) => api.post('/maintenance', data).then(r => r.data),
  updateStatus: (id: string, data: any) =>
    api.put(`/maintenance/${id}/status`, data).then(r => r.data),
}

// ── Usina Integration ───────────────────────────────────────
export const usinaService = {
  list: () => api.get('/usina').then(r => r.data),
  create: (data: any) => api.post('/usina', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/usina/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/usina/${id}`).then(r => r.data),
  testConnection: (id: string) => api.post(`/usina/${id}/test`).then(r => r.data),
  fetchCatalog: (id: string) => api.get(`/usina/${id}/catalog`).then(r => r.data),
}

// ── Material Orders ─────────────────────────────────────────
export const materialOrderService = {
  list: () => api.get('/material-orders').then(r => r.data),
  getById: (id: string) => api.get(`/material-orders/${id}`).then(r => r.data),
  create: (data: any) => api.post('/material-orders', data).then(r => r.data),
  send: (id: string) => api.post(`/material-orders/${id}/send`).then(r => r.data),
  sync: (id: string) => api.post(`/material-orders/${id}/sync`).then(r => r.data),
}
