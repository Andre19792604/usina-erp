import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Badge, Avatar, Dropdown, Space, Typography, Button,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined, ExperimentOutlined, ScissorOutlined,
  ShoppingCartOutlined, DollarOutlined, TeamOutlined,
  ToolOutlined, CarOutlined, UserOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, AlertOutlined,
  InboxOutlined, ShopOutlined, BellOutlined, FileTextOutlined,
  ApartmentOutlined, BarChartOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Sider, Header, Content } = Layout
const { Text } = Typography

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'operacao',
    icon: <ApartmentOutlined />,
    label: 'Operação',
    children: [
      { key: '/producao', icon: <ExperimentOutlined />, label: 'Produção' },
      { key: '/balanca', icon: <BarChartOutlined />, label: 'Balança / Pesagem' },
      { key: '/perdas', icon: <AlertOutlined />, label: 'Perdas Operacionais' },
      { key: '/laboratorio', icon: <FileTextOutlined />, label: 'Controle Tecnológico' },
    ],
  },
  {
    key: 'estoque',
    icon: <InboxOutlined />,
    label: 'Estoque',
    children: [
      { key: '/estoque', icon: <InboxOutlined />, label: 'Estoque da Usina' },
      { key: '/estoque-clientes', icon: <ShopOutlined />, label: 'Estoque de Clientes' },
    ],
  },
  {
    key: 'comercial',
    icon: <ShoppingCartOutlined />,
    label: 'Comercial',
    children: [
      { key: '/vendas', icon: <ShoppingCartOutlined />, label: 'Vendas / Pedidos' },
      { key: '/compras', icon: <ScissorOutlined />, label: 'Compras' },
    ],
  },
  {
    key: '/financeiro',
    icon: <DollarOutlined />,
    label: 'Financeiro',
  },
  {
    key: '/manutencao',
    icon: <ToolOutlined />,
    label: 'Manutenção',
  },
  {
    type: 'divider',
  },
  {
    key: 'cadastros',
    icon: <TeamOutlined />,
    label: 'Cadastros',
    children: [
      { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
      { key: '/fornecedores', icon: <ShopOutlined />, label: 'Fornecedores' },
      { key: '/materiais', icon: <InboxOutlined />, label: 'Materiais' },
      { key: '/veiculos', icon: <CarOutlined />, label: 'Veículos' },
      { key: '/usuarios', icon: <UserOutlined />, label: 'Usuários' },
    ],
  },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil' },
    { type: 'divider' },
    {
      key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true,
      onClick: () => { logout(); navigate('/login') },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #1e3a5f',
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid #1e3a5f',
          gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            🏭
          </div>
          {!collapsed && (
            <div>
              <Text strong style={{ color: '#f59e0b', fontSize: 14, display: 'block', lineHeight: '18px' }}>
                USINA ERP
              </Text>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Gestão de Asfalto</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['operacao', 'estoque', 'comercial', 'cadastros']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid #1e3a5f',
          height: 64,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#94a3b8', fontSize: 16 }}
          />

          <Space size={16}>
            {/* MX3000 status */}
            <Space style={{
              background: '#162032', border: '1px solid #1e3a5f',
              borderRadius: 8, padding: '4px 12px',
            }}>
              <Badge status="success" />
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>MX3000 Online</Text>
              <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>148°C</Text>
            </Space>

            {/* Balança status */}
            <Space style={{
              background: '#162032', border: '1px solid #1e3a5f',
              borderRadius: 8, padding: '4px 12px',
            }}>
              <Badge status="success" />
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Balança</Text>
              <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>Conectada</Text>
            </Space>

            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: '#94a3b8', fontSize: 18 }}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
                  size={32}
                >
                  {user?.name?.charAt(0) ?? 'U'}
                </Avatar>
                {!collapsed && (
                  <div>
                    <Text style={{ color: '#e2e8f0', fontSize: 13, display: 'block', lineHeight: '16px' }}>
                      {user?.name ?? 'Usuário'}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 11 }}>{user?.role ?? ''}</Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
