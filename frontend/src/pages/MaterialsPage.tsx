import { useState } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const materials = [
  { key: 1, code: 'CAP-50/70', name: 'CAP 50/70', category: 'CAP', unit: 'TON', minStock: 50, currentStock: 45.2, unitCost: 4200, active: true },
  { key: 2, code: 'CAP-30/45', name: 'CAP 30/45', category: 'CAP', unit: 'TON', minStock: 30, currentStock: 82.0, unitCost: 4350, active: true },
  { key: 3, code: 'BRIT-0', name: 'Brita 0 (4,75–9,5mm)', category: 'AGREGADO_GRAU', unit: 'TON', minStock: 200, currentStock: 342.5, unitCost: 85, active: true },
  { key: 4, code: 'BRIT-1', name: 'Brita 1 (9,5–19mm)', category: 'AGREGADO_GRAU', unit: 'TON', minStock: 200, currentStock: 210.0, unitCost: 80, active: true },
  { key: 5, code: 'PO-PEDRA', name: 'Pó de Pedra', category: 'PO_PEDRA', unit: 'TON', minStock: 150, currentStock: 195.0, unitCost: 55, active: true },
  { key: 6, code: 'PEDRISCO', name: 'Pedrisco', category: 'PEDRISCO', unit: 'TON', minStock: 100, currentStock: 88.0, unitCost: 72, active: true },
  { key: 7, code: 'CAL-HID', name: 'Cal Hidratada', category: 'CAL', unit: 'TON', minStock: 20, currentStock: 12.0, unitCost: 320, active: true },
  { key: 8, code: 'OLEO-BPF', name: 'Óleo BPF', category: 'OLEO_BPF', unit: 'LITRO', minStock: 3000, currentStock: 4200, unitCost: 3.8, active: true },
  { key: 9, code: 'DIESEL', name: 'Diesel', category: 'DIESEL', unit: 'LITRO', minStock: 5000, currentStock: 3200, unitCost: 5.9, active: true },
]

const catColors: Record<string, string> = { CAP: 'volcano', AGREGADO_GRAU: 'geekblue', PO_PEDRA: 'cyan', PEDRISCO: 'blue', CAL: 'lime', OLEO_BPF: 'purple', DIESEL: 'orange' }

export default function MaterialsPage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.includes(search.toUpperCase()))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Materiais / Insumos</Title>
          <Text style={{ color: '#64748b' }}>{materials.length} materiais cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Material
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar material..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={filtered} size="small" columns={[
          { title: 'Código', dataIndex: 'code', width: 110, render: v => <Text style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>{v}</Text> },
          { title: 'Nome', dataIndex: 'name', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
          { title: 'Categoria', dataIndex: 'category', render: v => <Tag color={catColors[v] || 'default'} style={{ fontSize: 11 }}>{v.replace(/_/g, ' ')}</Tag> },
          { title: 'Unid.', dataIndex: 'unit', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          {
            title: 'Estoque Atual', key: 'stock',
            render: (_, r: any) => {
              const isLow = r.currentStock < r.minStock
              return (
                <Text style={{ color: isLow ? '#ef4444' : '#22c55e', fontWeight: isLow ? 700 : 400 }}>
                  {isLow && <WarningOutlined style={{ marginRight: 4 }} />}
                  {r.currentStock.toLocaleString()} {r.unit.toLowerCase()}
                </Text>
              )
            },
          },
          { title: 'Estoque Mín.', dataIndex: 'minStock', render: (v, r: any) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v.toLocaleString()} {r.unit.toLowerCase()}</Text> },
          { title: 'Custo Unitário', dataIndex: 'unitCost', render: v => <Text style={{ color: '#f59e0b' }}>R$ {v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text> },
          { title: '', key: 'action', render: () => <Button size="small" icon={<EditOutlined />} ghost>Editar</Button> },
        ]} />
      </Card>
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Material</Text>} open={modal} onCancel={() => setModal(false)} width={560}
        footer={[<Button key="c" onClick={() => setModal(false)}>Cancelar</Button>, <Button key="s" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}><Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome</Text>} required><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="unit" label={<Text style={{ color: '#94a3b8' }}>Unidade</Text>} required>
              <Select options={[{ value: 'TON', label: 'Tonelada' }, { value: 'LITRO', label: 'Litro' }, { value: 'KG', label: 'Kg' }]} />
            </Form.Item></Col>
          </Row>
          <Form.Item name="category" label={<Text style={{ color: '#94a3b8' }}>Categoria</Text>} required>
            <Select options={Object.keys(catColors).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="minStock" label={<Text style={{ color: '#94a3b8' }}>Estoque Mínimo</Text>}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="unitCost" label={<Text style={{ color: '#94a3b8' }}>Custo Unitário (R$)</Text>}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
