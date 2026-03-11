import React from "react"
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductionPage from './pages/ProductionPage'
import WeightPage from './pages/WeightPage'
import StockPage from './pages/StockPage'
import ClientStockPage from './pages/ClientStockPage'
import SalesPage from './pages/SalesPage'
import PurchasePage from './pages/PurchasePage'
import FinancialPage from './pages/FinancialPage'
import LossPage from './pages/LossPage'
import LabTestPage from './pages/LabTestPage'
import MaintenancePage from './pages/MaintenancePage'
import ClientsPage from './pages/ClientsPage'
import SuppliersPage from './pages/SuppliersPage'
import MaterialsPage from './pages/MaterialsPage'
import VehiclesPage from './pages/VehiclesPage'
import UsersPage from './pages/UsersPage'
import NfePage from './pages/NfePage'

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
        <Route path="producao" element={<ProductionPage />} />
        <Route path="balanca" element={<WeightPage />} />
        <Route path="estoque" element={<StockPage />} />
        <Route path="estoque-clientes" element={<ClientStockPage />} />
        <Route path="perdas" element={<LossPage />} />
        <Route path="laboratorio" element={<LabTestPage />} />
        <Route path="vendas" element={<SalesPage />} />
        <Route path="compras" element={<PurchasePage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="nfe" element={<NfePage />} />
        <Route path="manutencao" element={<MaintenancePage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="fornecedores" element={<SuppliersPage />} />
        <Route path="materiais" element={<MaterialsPage />} />
        <Route path="veiculos" element={<VehiclesPage />} />
        <Route path="usuarios" element={<UsersPage />} />
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
