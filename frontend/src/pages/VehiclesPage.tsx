import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, CarOutlined, DeleteOutlined } from '@ant-design/icons'
import { vehicleService } from '../services/api'

const { Title, Text } = Typography

const typeColors: Record<string, string> = { TRUCK: 'blue', TANKER: 'purple', PICKUP: 'green', MACHINE: 'orange', OTHER: 'default' }
const typeLabels: Record<string, string> = { TRUCK: 'Caminhão', TANKER: 'Tanque', PICKUP: 'Picape', MACHINE: 'Máquina', OTHER: 'Outro' }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await vehicleService.list({ search: search || undefined })
      setVehicles(data)
    } catch {
      message.error('Erro ao carregar veículos')
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
    form.setFieldsValue({ ...record, capacity: Number(record.capacity), tare: Number(record.tare) })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) {
        await vehicleService.update(editingId, values)
        message.success('Veículo atualizado')
      } else {
        await vehicleService.create(values)
        message.success('Veículo criado')
      }
      setModal(false)
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao salvar veículo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await vehicleService.remove(id)
      message.success('Veículo removido')
      load()
    } catch {
      message.error('Erro ao remover veículo')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Veículos</Title>
          <Text style={{ color: '#64748b' }}>{vehicles.length} veículos cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Veículo
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar placa ou marca..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={vehicles} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Placa', dataIndex: 'plate',
            render: (v: string) => (
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 4, padding: '2px 8px', display: 'inline-block' }}>
                <CarOutlined style={{ color: '#60a5fa', marginRight: 4 }} />
                <Text style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>{v}</Text>
              </div>
            ),
          },
          { title: 'Tipo', dataIndex: 'type', render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag> },
          { title: 'Marca/Modelo', key: 'brand', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.brand} {r.model}</Text> },
          { title: 'Ano', dataIndex: 'year', render: (v: number) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
          { title: 'Cap. (ton)', dataIndex: 'capacity', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{Number(v).toLocaleString()}</Text> },
          { title: 'Tara (kg)', dataIndex: 'tare', render: (v: number) => <Text style={{ color: '#94a3b8' }}>{Number(v).toLocaleString()}</Text> },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover veículo?" onConfirm={() => handleDelete(r.id)} okText="Sim" cancelText="Não">
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="plate" label={<Text style={{ color: '#94a3b8' }}>Placa</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Input style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="year" label={<Text style={{ color: '#94a3b8' }}>Ano</Text>}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="brand" label={<Text style={{ color: '#94a3b8' }}>Marca</Text>}><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="model" label={<Text style={{ color: '#94a3b8' }}>Modelo</Text>}><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="capacity" label={<Text style={{ color: '#94a3b8' }}>Cap. (ton)</Text>}>
                <InputNumber style={{ width: '100%' }} step={0.5} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tare" label={<Text style={{ color: '#94a3b8' }}>Tara (kg)</Text>}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
