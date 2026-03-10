import { useState } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const suppliers = [
  { key: 1, code: 'FOR001', name: 'Petrobras Distribuidora', cnpj: '34.274.233/0001-02', city: 'Rio de Janeiro/RJ', phone: '(21) 3224-1510', category: 'CAP', active: true },
  { key: 2, code: 'FOR002', name: 'Pedreira São João', cnpj: '23.456.789/0001-12', city: 'Mogi das Cruzes/SP', phone: '(11) 4737-1234', category: 'AGREGADOS', active: true },
  { key: 3, code: 'FOR003', name: 'Posto Central', cnpj: '45.678.901/0001-23', city: 'São Paulo/SP', phone: '(11) 3333-4444', category: 'COMBUSTIVEL', active: true },
  { key: 4, code: 'FOR004', name: 'Calcário Norte', cnpj: '56.789.012/0001-34', city: 'Campinas/SP', phone: '(19) 3333-5555', category: 'CAL', active: false },
]

const categoryColors: Record<string, string> = { CAP: 'volcano', AGREGADOS: 'geekblue', COMBUSTIVEL: 'purple', CAL: 'lime' }

export default function SuppliersPage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Fornecedores</Title>
          <Text style={{ color: '#64748b' }}>{suppliers.length} fornecedores cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Fornecedor
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar fornecedor..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={filtered} size="small" columns={[
          { title: 'Código', dataIndex: 'code', width: 90, render: v => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v}</Text> },
          { title: 'Nome / Razão Social', dataIndex: 'name', render: v => <Text style={{ color: '#e2e8f0', fontWeight: 500 }}>{v}</Text> },
          { title: 'CNPJ', dataIndex: 'cnpj', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          { title: 'Cidade/UF', dataIndex: 'city', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          { title: 'Categoria', dataIndex: 'category', render: v => <Tag color={categoryColors[v] || 'default'}>{v}</Tag> },
          { title: 'Status', dataIndex: 'active', render: v => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          { title: '', key: 'action', render: () => <Button size="small" icon={<EditOutlined />} ghost>Editar</Button> },
        ]} />
      </Card>
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Fornecedor</Text>} open={modal} onCancel={() => setModal(false)} width={580}
        footer={[<Button key="c" onClick={() => setModal(false)}>Cancelar</Button>, <Button key="s" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}><Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome / Razão Social</Text>} required><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="cnpj" label={<Text style={{ color: '#94a3b8' }}>CNPJ</Text>} required><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="phone" label={<Text style={{ color: '#94a3b8' }}>Telefone</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="city" label={<Text style={{ color: '#94a3b8' }}>Cidade/UF</Text>}><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
