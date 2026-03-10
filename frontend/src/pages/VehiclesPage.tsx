import { useState } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, CarOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const vehicles = [
  { key: 1, plate: 'ABC-1234', type: 'TRUCK', brand: 'Volvo', model: 'FH 540', year: 2020, capacity: 15.0, tare: 13000, active: true },
  { key: 2, plate: 'DEF-5678', type: 'TRUCK', brand: 'Scania', model: 'R 450', year: 2019, capacity: 14.0, tare: 13000, active: true },
  { key: 3, plate: 'GHI-9012', type: 'TRUCK', brand: 'Mercedes', model: 'Actros 2651', year: 2021, capacity: 16.0, tare: 13500, active: true },
  { key: 4, plate: 'JKL-3456', type: 'TANKER', brand: 'Volvo', model: 'FH 460', year: 2018, capacity: 20.0, tare: 9000, active: true },
  { key: 5, plate: 'MNO-7890', type: 'PICKUP', brand: 'Toyota', model: 'Hilux', year: 2022, capacity: 1.0, tare: 2100, active: true },
]

const typeColors: Record<string, string> = { TRUCK: 'blue', TANKER: 'purple', PICKUP: 'green', MACHINE: 'orange', OTHER: 'default' }
const typeLabels: Record<string, string> = { TRUCK: 'Caminhão', TANKER: 'Tanque', PICKUP: 'Picape', MACHINE: 'Máquina', OTHER: 'Outro' }

export default function VehiclesPage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const filtered = vehicles.filter(v => v.plate.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Veículos</Title>
          <Text style={{ color: '#64748b' }}>{vehicles.length} veículos cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Veículo
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar placa ou marca..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={filtered} size="small" columns={[
          {
            title: 'Placa', dataIndex: 'plate',
            render: v => (
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 4, padding: '2px 8px', display: 'inline-block' }}>
                <CarOutlined style={{ color: '#60a5fa', marginRight: 4 }} />
                <Text style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>{v}</Text>
              </div>
            ),
          },
          { title: 'Tipo', dataIndex: 'type', render: v => <Tag color={typeColors[v]}>{typeLabels[v]}</Tag> },
          { title: 'Marca/Modelo', key: 'brand', render: (_, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.brand} {r.model}</Text> },
          { title: 'Ano', dataIndex: 'year', render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
          { title: 'Cap. (ton)', dataIndex: 'capacity', render: v => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{v}</Text> },
          { title: 'Tara (kg)', dataIndex: 'tare', render: v => <Text style={{ color: '#94a3b8' }}>{v.toLocaleString()}</Text> },
          { title: 'Status', dataIndex: 'active', render: v => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          { title: '', key: 'action', render: () => <Button size="small" icon={<EditOutlined />} ghost>Editar</Button> },
        ]} />
      </Card>
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Veículo</Text>} open={modal} onCancel={() => setModal(false)}
        footer={[<Button key="c" onClick={() => setModal(false)}>Cancelar</Button>, <Button key="s" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="plate" label={<Text style={{ color: '#94a3b8' }}>Placa</Text>} required><Input style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>} required>
              <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Form.Item></Col>
            <Col span={8}><Form.Item name="year" label={<Text style={{ color: '#94a3b8' }}>Ano</Text>}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="brand" label={<Text style={{ color: '#94a3b8' }}>Marca</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="model" label={<Text style={{ color: '#94a3b8' }}>Modelo</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="capacity" label={<Text style={{ color: '#94a3b8' }}>Cap. (ton)</Text>}><InputNumber style={{ width: '100%' }} step={0.5} /></Form.Item></Col>
          </Row>
          <Form.Item name="tare" label={<Text style={{ color: '#94a3b8' }}>Tara (kg)</Text>}><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
