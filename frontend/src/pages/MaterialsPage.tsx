import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons'
import { materialService } from '../services/api'

const { Title, Text } = Typography

const catColors: Record<string, string> = {
  CAP: 'volcano', AGREGADO_GRAU: 'geekblue', PO_PEDRA: 'cyan',
  PEDRISCO: 'blue', CAL: 'lime', OLEO_BPF: 'purple', DIESEL: 'orange',
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await materialService.list({ search: search || undefined })
      setMaterials(data)
    } catch {
      message.error('Erro ao carregar materiais')
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
    form.setFieldsValue({
      ...record,
      minStock: Number(record.minStock),
      unitCost: Number(record.unitCost),
    })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) {
        await materialService.update(editingId, values)
        message.success('Material atualizado')
      } else {
        await materialService.create(values)
        message.success('Material criado')
      }
      setModal(false)
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao salvar material')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Materiais / Insumos</Title>
          <Text style={{ color: '#64748b' }}>{materials.length} materiais cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Material
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar material..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={materials} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Código', dataIndex: 'code', width: 110, render: (v: string) => <Text style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>{v}</Text> },
          { title: 'Nome', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
          { title: 'Categoria', dataIndex: 'category', render: (v: string) => <Tag color={catColors[v] || 'default'} style={{ fontSize: 11 }}>{v?.replace(/_/g, ' ')}</Tag> },
          { title: 'Unid.', dataIndex: 'unit', render: (v: string) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          {
            title: 'Estoque Atual', key: 'stock',
            render: (_: any, r: any) => {
              const current = Number(r.currentStock || 0)
              const min = Number(r.minStock || 0)
              const isLow = current < min
              return (
                <Text style={{ color: isLow ? '#ef4444' : '#22c55e', fontWeight: isLow ? 700 : 400 }}>
                  {isLow && <WarningOutlined style={{ marginRight: 4 }} />}
                  {current.toLocaleString()} {r.unit?.toLowerCase()}
                </Text>
              )
            },
          },
          { title: 'Estoque Mín.', dataIndex: 'minStock', render: (v: number, r: any) => <Text style={{ color: '#64748b', fontSize: 12 }}>{Number(v).toLocaleString()} {r.unit?.toLowerCase()}</Text> },
          { title: 'Custo Unitário', dataIndex: 'unitCost', render: (v: number) => <Text style={{ color: '#f59e0b' }}>R$ {Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text> },
          { title: '', key: 'action', render: (_: any, r: any) => <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button> },
        ]} />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Material' : 'Novo Material'}</Text>}
        open={modal} onCancel={() => setModal(false)} width={560}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label={<Text style={{ color: '#94a3b8' }}>Unidade</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Select options={[
                  { value: 'TON', label: 'Tonelada' },
                  { value: 'LITRO', label: 'Litro' },
                  { value: 'KG', label: 'Kg' },
                  { value: 'UN', label: 'Unidade' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="category" label={<Text style={{ color: '#94a3b8' }}>Categoria</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select options={Object.keys(catColors).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="minStock" label={<Text style={{ color: '#94a3b8' }}>Estoque Mínimo</Text>}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unitCost" label={<Text style={{ color: '#94a3b8' }}>Custo Unitário (R$)</Text>}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
