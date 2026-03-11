import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { supplierService } from '../services/api'

const { Title, Text } = Typography

const categoryColors: Record<string, string> = {
  CAP: 'volcano', AGREGADOS: 'geekblue', COMBUSTIVEL: 'purple',
  CAL: 'lime', OUTROS: 'default',
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await supplierService.list({ search: search || undefined })
      setSuppliers(data)
    } catch {
      message.error('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditingId(null)
    form.resetFields()
    setModal(true)
  }

  const openEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) {
        await supplierService.update(editingId, values)
        message.success('Fornecedor atualizado')
      } else {
        await supplierService.create(values)
        message.success('Fornecedor criado')
      }
      setModal(false)
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao salvar fornecedor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await supplierService.remove(id)
      message.success('Fornecedor removido')
      load()
    } catch {
      message.error('Erro ao remover fornecedor')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Fornecedores</Title>
          <Text style={{ color: '#64748b' }}>{suppliers.length} fornecedores cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Fornecedor
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar fornecedor..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table
          dataSource={suppliers} rowKey="id" loading={loading} size="small"
          columns={[
            { title: 'Código', dataIndex: 'code', width: 90, render: (v: string) => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v}</Text> },
            { title: 'Nome / Razão Social', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0', fontWeight: 500 }}>{v}</Text> },
            { title: 'CNPJ', dataIndex: 'cnpj', render: (v: string) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
            { title: 'Cidade/UF', key: 'city', render: (_: any, r: any) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{r.city ? `${r.city}/${r.state}` : '—'}</Text> },
            { title: 'Categoria', dataIndex: 'category', render: (v: string) => v ? <Tag color={categoryColors[v] || 'default'}>{v}</Tag> : '—' },
            { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
            {
              title: '', key: 'action',
              render: (_: any, r: any) => (
                <span style={{ display: 'flex', gap: 8 }}>
                  <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                  <Popconfirm title="Remover fornecedor?" onConfirm={() => handleDelete(r.id)} okText="Sim" cancelText="Não">
                    <Button size="small" icon={<DeleteOutlined />} danger ghost />
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</Text>}
        open={modal} onCancel={() => setModal(false)} width={580}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome / Razão Social</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cnpj" label={<Text style={{ color: '#94a3b8' }}>CNPJ</Text>}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="phone" label={<Text style={{ color: '#94a3b8' }}>Telefone</Text>}><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>}><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label={<Text style={{ color: '#94a3b8' }}>Categoria</Text>}>
                <Select options={Object.keys(categoryColors).map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="city" label={<Text style={{ color: '#94a3b8' }}>Cidade</Text>}><Input /></Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="state" label={<Text style={{ color: '#94a3b8' }}>UF</Text>}><Input maxLength={2} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="address" label={<Text style={{ color: '#94a3b8' }}>Endereço</Text>}><Input /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
