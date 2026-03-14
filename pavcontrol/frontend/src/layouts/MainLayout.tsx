import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout, Menu, Avatar, Dropdown, Space, Typography, Button,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined, ProjectOutlined, ToolOutlined,
  CarOutlined, UserOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
  ThunderboltOutlined, FileTextOutlined,
  SettingOutlined, TeamOutlined, AppstoreOutlined,
  ApiOutlined, ShoppingCartOutlined,
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
    key: '/obras',
    icon: <ProjectOutlined />,
    label: 'Obras',
  },
  {
    key: '/producao',
    icon: <AppstoreOutlined />,
    label: 'Produção Diária',
  },
  {
    key: 'frota',
    icon: <CarOutlined />,
    label: 'Frota',
    children: [
      { key: '/veiculos', icon: <CarOutlined />, label: 'Veículos' },
      { key: '/equipamentos', icon: <ToolOutlined />, label: 'Equipamentos' },
      { key: '/combustivel', icon: <ThunderboltOutlined />, label: 'Combustível' },
    ],
  },
  {
    key: '/relatorios',
    icon: <FileTextOutlined />,
    label: 'Relatórios',
  },
  {
    type: 'divider',
  },
  {
    key: 'usina',
    icon: <ApiOutlined />,
    label: 'Usina ERP',
    children: [
      { key: '/pedidos-material', icon: <ShoppingCartOutlined />, label: 'Pedidos de Material' },
      { key: '/usina-integracoes', icon: <ApiOutlined />, label: 'Integrações' },
    ],
  },
  {
    key: 'cadastros',
    icon: <SettingOutlined />,
    label: 'Cadastros',
    children: [
      { key: '/servicos', icon: <AppstoreOutlined />, label: 'Serviços' },
      { key: '/usuarios', icon: <TeamOutlined />, label: 'Usuários' },
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0, color: '#fff', fontWeight: 700,
          }}>
            P
          </div>
          {!collapsed && (
            <div>
              <Text strong style={{ color: '#10b981', fontSize: 14, display: 'block', lineHeight: '18px' }}>
                PAVCONTROL
              </Text>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Gestão de Obras</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['frota', 'usina', 'cadastros']}
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
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{ background: '#10b981', color: '#0f172a', fontWeight: 700 }}
                  size={32}
                >
                  {user?.name?.charAt(0) ?? 'U'}
                </Avatar>
                <div>
                  <Text style={{ color: '#e2e8f0', fontSize: 13, display: 'block', lineHeight: '16px' }}>
                    {user?.name ?? 'Usuário'}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>{user?.company ?? ''}</Text>
                </div>
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
