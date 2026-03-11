import { useState, useEffect } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, Input, Avatar, Space, message } from 'antd'
import { PlusOutlined, EditOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import { userService } from '../services/api'

const { Title, Text } = Typography

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
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await userService.list()
      setUsers(data)
    } catch {
      message.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditingId(null)
    form.resetFields()
    setModal(true)
  }

  const openEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue({ name: record.name, email: record.email, role: record.role })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) {
        await userService.update(editingId, { name: values.name, role: values.role })
        message.success('Usuário atualizado')
      } else {
        await userService.create(values)
        message.success('Usuário criado')
      }
      setModal(false)
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Usuários do Sistema</Title>
          <Text style={{ color: '#64748b' }}>{users.length} usuários cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Usuário
        </Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={users} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Usuário', key: 'user',
            render: (_: any, r: any) => (
              <Space>
                <Avatar style={{ background: '#3b82f6', color: '#fff' }} size={32}>{r.name?.charAt(0)}</Avatar>
                <div>
                  <Text style={{ color: '#e2e8f0', fontWeight: 500, display: 'block' }}>{r.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{r.email}</Text>
                </div>
              </Space>
            ),
          },
          { title: 'Perfil', dataIndex: 'role', render: (v: string) => <Tag color={roleColors[v]}>{roleLabels[v] || v}</Tag> },
          {
            title: 'Criado em', dataIndex: 'createdAt',
            render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>
              {v ? new Date(v).toLocaleDateString('pt-BR') : '—'}
            </Text>,
          },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Button size="small" icon={<LockOutlined />} ghost>Senha</Button>
              </Space>
            ),
          },
        ]} />
      </Card>

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

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome Completo</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Input prefix={<UserOutlined style={{ color: '#475569' }} />} />
          </Form.Item>
          <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>} rules={[{ required: true, type: 'email', message: 'E-mail inválido' }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="role" label={<Text style={{ color: '#94a3b8' }}>Perfil de Acesso</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select options={Object.entries(roleLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          {!editingId && (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>Senha</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#475569' }} />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="confirmPassword" label={<Text style={{ color: '#94a3b8' }}>Confirmar Senha</Text>}
                  rules={[{ required: true }, ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve()
                      return Promise.reject(new Error('Senhas não conferem'))
                    },
                  })]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#475569' }} />} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    </div>
  )
}
