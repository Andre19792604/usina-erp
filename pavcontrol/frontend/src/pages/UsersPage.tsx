import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, Input, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { userService } from '../services/api'

const { Title, Text } = Typography

const roleColors: Record<string, string> = {
  ADMIN: 'red', GERENTE: 'blue', ENCARREGADO: 'green', OPERADOR: 'orange', MOTORISTA: 'purple', VIEWER: 'default',
}
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador', GERENTE: 'Gerente', ENCARREGADO: 'Encarregado', OPERADOR: 'Operador', MOTORISTA: 'Motorista', VIEWER: 'Visualizador',
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setUsers(await userService.list()) }
    catch { message.error('Erro ao carregar usuários') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => { setEditingId(r.id); form.setFieldsValue({ ...r, password: '' }); setModal(true) }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const data = { ...values }
      if (!data.password) delete data.password
      if (editingId) { await userService.update(editingId, data); message.success('Usuário atualizado') }
      else { await userService.create(data); message.success('Usuário criado') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Usuários</Title>
          <Text style={{ color: '#64748b' }}>{users.length} usuários cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Usuário</Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={users} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Nome', key: 'name',
            render: (_: any, r: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined style={{ color: '#10b981' }} />
                <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</Text>
              </div>
            ),
          },
          { title: 'E-mail', dataIndex: 'email', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
          { title: 'Perfil', dataIndex: 'role', render: (v: string) => <Tag color={roleColors[v]}>{roleLabels[v] || v}</Tag> },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Desativar usuário?" onConfirm={async () => { await userService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome</Text>} rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>{editingId ? 'Nova Senha (opcional)' : 'Senha'}</Text>}
                rules={editingId ? [] : [{ required: true }]}>
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="role" label={<Text style={{ color: '#94a3b8' }}>Perfil</Text>} rules={[{ required: true }]}>
                <Select options={Object.entries(roleLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label={<Text style={{ color: '#94a3b8' }}>Telefone</Text>}><Input /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
