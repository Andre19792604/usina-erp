import { useState } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const clients = [
  { key: 1, code: 'CLI001', name: 'Prefeitura de São Paulo', cnpj: '46.395.000/0001-39', city: 'São Paulo/SP', phone: '(11) 3396-1000', email: 'licitacoes@prefsp.gov.br', active: true, credit: 500000 },
  { key: 2, code: 'CLI002', name: 'Construtora ABC Ltda', cnpj: '12.345.678/0001-90', city: 'Guarulhos/SP', phone: '(11) 2222-3333', email: 'compras@abc.com.br', active: true, credit: 200000 },
  { key: 3, code: 'CLI003', name: 'DER-SP', cnpj: '61.412.580/0001-03', city: 'São Paulo/SP', phone: '(11) 3311-1600', email: 'compras@der.sp.gov.br', active: true, credit: 1000000 },
  { key: 4, code: 'CLI004', name: 'Empreiteira Sul Ltda', cnpj: '98.765.432/0001-11', city: 'Santo André/SP', phone: '(11) 4444-5555', email: 'contato@sul.com.br', active: false, credit: 100000 },
]

export default function ClientsPage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search)
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Clientes</Title>
          <Text style={{ color: '#64748b' }}>{clients.length} clientes cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Cliente
        </Button>
      </div>
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#475569' }} />}
          placeholder="Buscar por nome ou CNPJ..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }}
        />
        <Table dataSource={filtered} size="small" columns={[
          { title: 'Código', dataIndex: 'code', width: 90, render: v => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v}</Text> },
          { title: 'Nome / Razão Social', dataIndex: 'name', render: v => <Text style={{ color: '#e2e8f0', fontWeight: 500 }}>{v}</Text> },
          { title: 'CNPJ/CPF', dataIndex: 'cnpj', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          { title: 'Cidade/UF', dataIndex: 'city', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
          { title: 'Limite de Crédito', dataIndex: 'credit', render: v => <Text style={{ color: '#f59e0b' }}>R$ {v.toLocaleString('pt-BR')}</Text> },
          { title: 'Status', dataIndex: 'active', render: v => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag> },
          {
            title: '', key: 'action',
            render: () => <Button size="small" icon={<EditOutlined />} ghost>Editar</Button>,
          },
        ]} />
      </Card>
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Cliente</Text>} open={modal} onCancel={() => setModal(false)} width={620}
        footer={[<Button key="c" onClick={() => setModal(false)}>Cancelar</Button>, <Button key="s" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}><Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome / Razão Social</Text>} required><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="cnpj" label={<Text style={{ color: '#94a3b8' }}>CNPJ / CPF</Text>} required><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="stateReg" label={<Text style={{ color: '#94a3b8' }}>Insc. Estadual</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phone" label={<Text style={{ color: '#94a3b8' }}>Telefone</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="address" label={<Text style={{ color: '#94a3b8' }}>Endereço</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="city" label={<Text style={{ color: '#94a3b8' }}>Cidade</Text>}><Input /></Form.Item></Col>
            <Col span={4}><Form.Item name="state" label={<Text style={{ color: '#94a3b8' }}>UF</Text>}><Input maxLength={2} /></Form.Item></Col>
          </Row>
          <Form.Item name="creditLimit" label={<Text style={{ color: '#94a3b8' }}>Limite de Crédito (R$)</Text>}>
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
