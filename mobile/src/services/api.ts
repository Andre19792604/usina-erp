import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token')
    }
    return Promise.reject(err)
  }
)

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}

export const productionService = {
  list: (params?: { status?: string }) =>
    api.get('/production', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/production/${id}`).then(r => r.data),
  updateStatus: (id: string, data: any) =>
    api.put(`/production/${id}/status`, data).then(r => r.data),
}

export const weightService = {
  list: (params?: { from?: string; to?: string }) =>
    api.get('/weight', { params }).then(r => r.data),
  create: (data: any) => api.post('/weight', data).then(r => r.data),
}

export const materialService = {
  list: () => api.get('/materials').then(r => r.data),
}

export const financialService = {
  dashboard: () => api.get('/financial/dashboard').then(r => r.data),
}
