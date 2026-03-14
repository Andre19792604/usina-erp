import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, CarOutlined, DeleteOutlined } from '@ant-design/icons'
import { vehicleService } from '../services/api'

const { Title, Text } = Typography

const typeColors: Record<string, string> = { CAMINHAO: 'blue', CARRETA: 'purple', PICKUP: 'green', MAQUINA: 'orange', OUTRO: 'default' }
const typeLabels: Record<string, string> = { CAMINHAO: 'Caminhão', CARRETA: 'Carreta', PICKUP: 'Pickup', MAQUINA: 'Máquina', OUTRO: 'Outro' }
const fuelLabels: Record<string, string> = { DIESEL: 'Diesel', GASOLINA: 'Gasolina', ETANOL: 'Etanol', GNV: 'GNV' }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setVehicles(await vehicleService.list({ search: search || undefined })) }
    catch { message.error('Erro ao carregar veículos') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => {
    setEditingId(r.id)
    form.setFieldsValue({ ...r, capacity: r.capacity ? Number(r.capacity) : null })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) { await vehicleService.update(editingId, values); message.success('Veículo atualizado') }
      else { await vehicleService.create(values); message.success('Veículo criado') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Veículos</Title>
          <Text style={{ color: '#64748b' }}>{vehicles.length} veículos cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Veículo</Button>
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
                <CarOutlined style={{ color: '#10b981', marginRight: 4 }} />
                <Text style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>{v}</Text>
              </div>
            ),
          },
          { title: 'Tipo', dataIndex: 'type', render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag> },
          { title: 'Marca/Modelo', key: 'brand', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.brand} {r.model}</Text> },
          { title: 'Ano', dataIndex: 'year', render: (v: number) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
          { title: 'Cap. (ton)', dataIndex: 'capacity', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v ? Number(v).toLocaleString() : '—'}</Text> },
          { title: 'Combustível', dataIndex: 'fuelType', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{fuelLabels[v] || v}</Text> },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover veículo?" onConfirm={async () => { await vehicleService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="plate" label={<Text style={{ color: '#94a3b8' }}>Placa</Text>} rules={[{ required: true }]}>
                <Input style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>} rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fuelType" label={<Text style={{ color: '#94a3b8' }}>Combustível</Text>}>
                <Select options={Object.entries(fuelLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="brand" label={<Text style={{ color: '#94a3b8' }}>Marca</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="model" label={<Text style={{ color: '#94a3b8' }}>Modelo</Text>}><Input /></Form.Item></Col>
            <Col span={4}><Form.Item name="year" label={<Text style={{ color: '#94a3b8' }}>Ano</Text>}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={4}><Form.Item name="capacity" label={<Text style={{ color: '#94a3b8' }}>Cap.(ton)</Text>}><InputNumber style={{ width: '100%' }} step={0.5} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
