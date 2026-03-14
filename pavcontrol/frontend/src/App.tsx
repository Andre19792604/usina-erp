import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProductionPage from './pages/ProductionPage'
import VehiclesPage from './pages/VehiclesPage'
import EquipmentPage from './pages/EquipmentPage'
import FuelPage from './pages/FuelPage'
import ReportsPage from './pages/ReportsPage'
import ServicesPage from './pages/ServicesPage'
import UsersPage from './pages/UsersPage'
import UsinaIntegrationPage from './pages/UsinaIntegrationPage'
import MaterialOrdersPage from './pages/MaterialOrdersPage'

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="obras" element={<ProjectsPage />} />
        <Route path="producao" element={<ProductionPage />} />
        <Route path="veiculos" element={<VehiclesPage />} />
        <Route path="equipamentos" element={<EquipmentPage />} />
        <Route path="combustivel" element={<FuelPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="servicos" element={<ServicesPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="usina-integracoes" element={<UsinaIntegrationPage />} />
        <Route path="pedidos-material" element={<MaterialOrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
