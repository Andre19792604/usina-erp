import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Tabs, Modal, Form, Select, InputNumber, DatePicker, Input, Divider,
} from 'antd'
import { PlusOutlined, FileTextOutlined, ShoppingCartOutlined, TruckOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const quotes = [
  { key: 1, number: 'ORC00000041', client: 'Prefeitura de SP', total: 140000, items: '500 ton CBUQ BC', created: '05/03/2026', valid: '05/04/2026', status: 'APPROVED' },
  { key: 2, number: 'ORC00000040', client: 'Construtora ABC', total: 84000, items: '300 ton CBUQ CR', created: '03/03/2026', valid: '03/04/2026', status: 'SENT' },
  { key: 3, number: 'ORC00000039', client: 'DER-SP', total: 56000, items: '200 ton PMF', created: '01/03/2026', valid: '01/04/2026', status: 'DRAFT' },
  { key: 4, number: 'ORC00000038', client: 'Empreiteira Sul', total: 42000, items: '150 ton CBUQ BC', created: '20/02/2026', valid: '20/03/2026', status: 'EXPIRED' },
]

const orders = [
  { key: 1, number: 'PV00000234', client: 'Prefeitura de SP', total: 140000, product: 'CBUQ Binder Course', qty: 500, delivered: 342, deliveryDate: '15/03/2026', status: 'IN_PRODUCTION' },
  { key: 2, number: 'PV00000233', client: 'Construtora ABC', total: 84000, product: 'CBUQ Capa Rolamento', qty: 300, delivered: 300, deliveryDate: '10/03/2026', status: 'COMPLETED' },
  { key: 3, number: 'PV00000232', client: 'DER-SP', total: 56000, product: 'PMF', qty: 200, delivered: 0, deliveryDate: '20/03/2026', status: 'OPEN' },
]

const quoteStatusColors: Record<string, string> = { DRAFT: 'default', SENT: 'processing', APPROVED: 'success', REJECTED: 'error', EXPIRED: 'warning' }
const quoteStatusLabels: Record<string, string> = { DRAFT: 'Rascunho', SENT: 'Enviado', APPROVED: 'Aprovado', REJECTED: 'Rejeitado', EXPIRED: 'Expirado' }
const orderStatusColors: Record<string, string> = { OPEN: 'blue', IN_PRODUCTION: 'processing', READY: 'cyan', DELIVERING: 'purple', COMPLETED: 'success', CANCELLED: 'error' }
const orderStatusLabels: Record<string, string> = { OPEN: 'Aberto', IN_PRODUCTION: 'Em Produção', READY: 'Pronto', DELIVERING: 'Em Entrega', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }

export default function SalesPage() {
  const [orderModal, setOrderModal] = useState(false)
  const [form] = Form.useForm()
  const totalOpen = orders.filter(o => o.status !== 'COMPLETED').reduce((a, o) => a + o.total, 0)
  const totalMonth = orders.reduce((a, o) => a + o.total, 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Vendas / Comercial</Title>
          <Text style={{ color: '#64748b' }}>Orçamentos, pedidos de venda e entregas</Text>
        </div>
        <Space>
          <Button icon={<FileTextOutlined />} style={{ background: '#162032', border: '1px solid #334155', color: '#e2e8f0' }}>Novo Orçamento</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOrderModal(true)}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>Novo Pedido</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Pedidos em Aberto', value: `R$ ${totalOpen.toLocaleString('pt-BR')}`, color: '#60a5fa' },
          { label: 'Faturado no Mês', value: `R$ ${totalMonth.toLocaleString('pt-BR')}`, color: '#22c55e' },
          { label: 'Pedidos Ativos', value: String(orders.filter(o => o.status !== 'COMPLETED').length), color: '#f59e0b' },
          { label: 'Orçamentos Aguardando', value: String(quotes.filter(q => q.status === 'SENT').length), color: '#94a3b8' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Tabs items={[
          {
            key: 'orders',
            label: <Space><ShoppingCartOutlined /><Text style={{ color: '#e2e8f0' }}>Pedidos</Text></Space>,
            children: (
              <Table dataSource={orders} size="small" columns={[
                { title: 'Nº Pedido', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                { title: 'Cliente', dataIndex: 'client', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Produto', dataIndex: 'product', render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
                {
                  title: 'Progresso', key: 'progress',
                  render: (_, r: any) => {
                    const pct = Math.round((r.delivered / r.qty) * 100)
                    return (
                      <Space direction="vertical" size={2} style={{ minWidth: 120 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>{r.delivered}/{r.qty} ton ({pct}%)</Text>
                        <div style={{ background: '#1e3a5f', borderRadius: 4, height: 4, width: '100%' }}>
                          <div style={{ background: pct === 100 ? '#22c55e' : '#f59e0b', width: `${pct}%`, height: '100%', borderRadius: 4 }} />
                        </div>
                      </Space>
                    )
                  },
                },
                { title: 'Valor', dataIndex: 'total', render: v => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {v.toLocaleString('pt-BR')}</Text> },
                { title: 'Entrega', dataIndex: 'deliveryDate', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                { title: 'Status', dataIndex: 'status', render: v => <Tag color={orderStatusColors[v]}>{orderStatusLabels[v]}</Tag> },
                { title: '', key: 'action', render: () => <Button size="small" icon={<TruckOutlined />} ghost>Detalhe</Button> },
              ]} />
            ),
          },
          {
            key: 'quotes',
            label: <Space><FileTextOutlined /><Text style={{ color: '#e2e8f0' }}>Orçamentos</Text></Space>,
            children: (
              <Table dataSource={quotes} size="small" columns={[
                { title: 'Nº', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                { title: 'Cliente', dataIndex: 'client', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Itens', dataIndex: 'items', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
                { title: 'Valor', dataIndex: 'total', render: v => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {v.toLocaleString('pt-BR')}</Text> },
                { title: 'Válido até', dataIndex: 'valid', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                { title: 'Status', dataIndex: 'status', render: v => <Tag color={quoteStatusColors[v]}>{quoteStatusLabels[v]}</Tag> },
                {
                  title: '', key: 'action',
                  render: (_, r: any) => r.status === 'APPROVED'
                    ? <Button size="small" style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost>Gerar Pedido</Button>
                    : r.status === 'DRAFT' ? <Button size="small" ghost>Enviar</Button> : null,
                },
              ]} />
            ),
          },
        ]} />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Novo Pedido de Venda</Text>}
        open={orderModal} onCancel={() => setOrderModal(false)} width={580}
        footer={[
          <Button key="cancel" onClick={() => setOrderModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar Pedido</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="client" label={<Text style={{ color: '#94a3b8' }}>Cliente</Text>} required>
                <Select showSearch placeholder="Selecionar cliente" options={[
                  { value: 'pref-sp', label: 'Prefeitura de SP' },
                  { value: 'abc', label: 'Construtora ABC' },
                  { value: 'der', label: 'DER-SP' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quote" label={<Text style={{ color: '#94a3b8' }}>Orçamento</Text>}>
                <Select placeholder="Vincular" allowClear options={[{ value: 'orc41', label: 'ORC00000041' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ borderColor: '#334155', margin: '4px 0 12px' }}>Itens do Pedido</Divider>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="product" label={<Text style={{ color: '#94a3b8' }}>Produto</Text>} required>
                <Select options={[
                  { value: 'cbuq-bc', label: 'CBUQ Binder Course' },
                  { value: 'cbuq-cr', label: 'CBUQ Capa de Rolamento' },
                  { value: 'pmf', label: 'PMF' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="qty" label={<Text style={{ color: '#94a3b8' }}>Qtd (ton)</Text>} required>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="price" label={<Text style={{ color: '#94a3b8' }}>R$/ton</Text>} required>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="deliveryDate" label={<Text style={{ color: '#94a3b8' }}>Data de Entrega</Text>}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label={<Text style={{ color: '#94a3b8' }}>Endereço de Entrega</Text>}>
                <Input placeholder="Rua, número, bairro" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
