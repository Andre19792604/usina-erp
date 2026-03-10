import { useState } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, Input, Avatar, Space } from 'antd'
import { PlusOutlined, EditOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const users = [
  { key: 1, name: 'Administrador', email: 'admin@usina.com', role: 'ADMIN', active: true, createdAt: '01/01/2026' },
  { key: 2, name: 'João Gerente', email: 'joao@usina.com', role: 'GERENTE', active: true, createdAt: '01/02/2026' },
  { key: 3, name: 'Ana Operadora', email: 'ana@usina.com', role: 'OPERADOR', active: true, createdAt: '01/02/2026' },
  { key: 4, name: 'Carlos Balança', email: 'carlos@usina.com', role: 'BALANCA', active: true, createdAt: '01/02/2026' },
  { key: 5, name: 'Maria Financeiro', email: 'maria@usina.com', role: 'FINANCEIRO', active: true, createdAt: '15/02/2026' },
  { key: 6, name: 'Pedro Vendas', email: 'pedro@usina.com', role: 'VENDAS', active: false, createdAt: '15/02/2026' },
]

const roleColors: Record<string, string> = {
  ADMIN: 'red', GERENTE: 'gold', OPERADOR: 'blue', BALANCA: 'cyan',
  FINANCEIRO: 'green', VENDAS: 'purple', COMPRAS: 'orange', MANUTENCAO: 'geekblue', VIEWER: 'default',
}
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador', GERENTE: 'Gerente', OPERADOR: 'Operador',
  BALANCA: 'Balança', FINANCEIRO: 'Financeiro', VENDAS: 'Vendas',
  COMPRAS: 'Compras', MANUTENCAO: 'Manutenção', VIEWER: 'Visualizador',
}

export default function UsersPage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Usuários do Sistema</Title>
          <Text style={{ color: '#64748b' }}>{users.length} usuários cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Usuário
        </Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={users} size="small" columns={[
          {
            title: 'Usuário', key: 'user',
            render: (_, r: any) => (
              <Space>
                <Avatar style={{ background: roleColors[r.role] === 'red' ? '#ef4444' : '#3b82f6', color: '#fff' }} size={32}>
                  {r.name.charAt(0)}
                </Avatar>
                <div>
                  <Text style={{ color: '#e2e8f0', fontWeight: 500, display: 'block' }}>{r.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{r.email}</Text>
                </div>
              </Space>
            ),
          },
          {
            title: 'Perfil', dataIndex: 'role',
            render: v => <Tag color={roleColors[v]}>{roleLabels[v]}</Tag>,
          },
          { title: 'Criado em', dataIndex: 'createdAt', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
          { title: 'Status', dataIndex: 'active', render: v => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: () => (
              <Space>
                <Button size="small" icon={<EditOutlined />} ghost>Editar</Button>
                <Button size="small" icon={<LockOutlined />} ghost>Senha</Button>
              </Space>
            ),
          },
        ]} />
      </Card>

      {/* Legenda de perfis */}
      <Card title={<Text style={{ color: '#e2e8f0' }}>Perfis de Acesso</Text>} style={{ border: '1px solid #1e3a5f', marginTop: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(roleLabels).map(([k, v]) => (
            <Tag key={k} color={roleColors[k]} style={{ margin: 0 }}>{v}</Tag>
          ))}
        </div>
        <Text style={{ color: '#475569', fontSize: 12, marginTop: 8, display: 'block' }}>
          Admin tem acesso total. Cada perfil acessa apenas os módulos pertinentes à sua função.
        </Text>
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Usuário</Text>} open={modal} onCancel={() => setModal(false)}
        footer={[<Button key="c" onClick={() => setModal(false)}>Cancelar</Button>, <Button key="s" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome Completo</Text>} required>
            <Input prefix={<UserOutlined style={{ color: '#475569' }} />} />
          </Form.Item>
          <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>} required>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="role" label={<Text style={{ color: '#94a3b8' }}>Perfil de Acesso</Text>} required>
            <Select options={Object.entries(roleLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>Senha</Text>} required>
                <Input.Password prefix={<LockOutlined style={{ color: '#475569' }} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="confirmPassword" label={<Text style={{ color: '#94a3b8' }}>Confirmar Senha</Text>} required>
                <Input.Password prefix={<LockOutlined style={{ color: '#475569' }} />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
