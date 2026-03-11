import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Tabs, Modal, Form, Select, InputNumber, DatePicker, Input, Divider, message, Spin,
} from 'antd'
import { PlusOutlined, FileTextOutlined, ShoppingCartOutlined, TruckOutlined, ReloadOutlined } from '@ant-design/icons'
import { salesService, clientService, productService } from '../services/api'

const { Title, Text } = Typography

const quoteStatusColors: Record<string, string> = { DRAFT: 'default', SENT: 'processing', APPROVED: 'success', REJECTED: 'error', EXPIRED: 'warning' }
const quoteStatusLabels: Record<string, string> = { DRAFT: 'Rascunho', SENT: 'Enviado', APPROVED: 'Aprovado', REJECTED: 'Rejeitado', EXPIRED: 'Expirado' }
const orderStatusColors: Record<string, string> = { OPEN: 'blue', IN_PRODUCTION: 'processing', READY: 'cyan', DELIVERING: 'purple', COMPLETED: 'success', CANCELLED: 'error' }
const orderStatusLabels: Record<string, string> = { OPEN: 'Aberto', IN_PRODUCTION: 'Em Produção', READY: 'Pronto', DELIVERING: 'Em Entrega', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }

export default function SalesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orderModal, setOrderModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const [ordersData, quotesData, clientsData, productsData] = await Promise.all([
        salesService.listOrders(),
        salesService.listQuotes(),
        clientService.list(),
        productService.listProducts(),
      ])
      setOrders(ordersData)
      setQuotes(quotesData)
      setClients(clientsData)
      setProducts(productsData)
    } catch {
      message.error('Erro ao carregar dados de vendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await salesService.createOrder({
        clientId: values.client,
        items: [{ productId: values.product, quantity: values.qty, unitPrice: values.price }],
        deliveryDate: values.deliveryDate?.toISOString(),
        deliveryAddress: values.address,
        notes: values.notes,
      })
      message.success('Pedido criado')
      setOrderModal(false)
      form.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar pedido')
    } finally {
      setSaving(false)
    }
  }

  const handleConvertQuote = async (id: string) => {
    try {
      await salesService.convertQuote(id)
      message.success('Orçamento convertido em pedido')
      load()
    } catch {
      message.error('Erro ao converter orçamento')
    }
  }

  const totalOpen = orders.filter((o: any) => o.status !== 'COMPLETED').reduce((a: number, o: any) => a + Number(o.totalAmount || 0), 0)
  const totalMonth = orders.reduce((a: number, o: any) => a + Number(o.totalAmount || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Vendas / Comercial</Title>
          <Text style={{ color: '#64748b' }}>Orçamentos, pedidos de venda e entregas</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setOrderModal(true) }}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>Novo Pedido</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Pedidos em Aberto', value: `R$ ${totalOpen.toLocaleString('pt-BR')}`, color: '#60a5fa' },
          { label: 'Faturado no Período', value: `R$ ${totalMonth.toLocaleString('pt-BR')}`, color: '#22c55e' },
          { label: 'Pedidos Ativos', value: String(orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length), color: '#f59e0b' },
          { label: 'Orçamentos Aguardando', value: String(quotes.filter((q: any) => q.status === 'SENT').length), color: '#94a3b8' },
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
        {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
          <Tabs items={[
            {
              key: 'orders',
              label: <Space><ShoppingCartOutlined /><Text style={{ color: '#e2e8f0' }}>Pedidos ({orders.length})</Text></Space>,
              children: (
                <Table dataSource={orders} rowKey="id" size="small" columns={[
                  { title: 'Nº Pedido', dataIndex: 'number', render: (v: string) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                  { title: 'Cliente', key: 'client', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.client?.name || '—'}</Text> },
                  { title: 'Valor', dataIndex: 'totalAmount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {Number(v || 0).toLocaleString('pt-BR')}</Text> },
                  { title: 'Entrega', dataIndex: 'deliveryDate', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={orderStatusColors[v]}>{orderStatusLabels[v] || v}</Tag> },
                  { title: '', key: 'action', render: () => <Button size="small" icon={<TruckOutlined />} ghost>Detalhe</Button> },
                ]} />
              ),
            },
            {
              key: 'quotes',
              label: <Space><FileTextOutlined /><Text style={{ color: '#e2e8f0' }}>Orçamentos ({quotes.length})</Text></Space>,
              children: (
                <Table dataSource={quotes} rowKey="id" size="small" columns={[
                  { title: 'Nº', dataIndex: 'number', render: (v: string) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                  { title: 'Cliente', key: 'client', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.client?.name || '—'}</Text> },
                  { title: 'Valor', dataIndex: 'totalAmount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {Number(v || 0).toLocaleString('pt-BR')}</Text> },
                  { title: 'Válido até', dataIndex: 'validUntil', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={quoteStatusColors[v]}>{quoteStatusLabels[v] || v}</Tag> },
                  {
                    title: '', key: 'action',
                    render: (_: any, r: any) => r.status === 'APPROVED'
                      ? <Button size="small" style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost onClick={() => handleConvertQuote(r.id)}>Gerar Pedido</Button>
                      : null,
                  },
                ]} />
              ),
            },
          ]} />
        )}
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Pedido de Venda</Text>}
        open={orderModal} onCancel={() => setOrderModal(false)} width={580}
        footer={[
          <Button key="cancel" onClick={() => setOrderModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleCreateOrder}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar Pedido</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="client" label={<Text style={{ color: '#94a3b8' }}>Cliente</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select showSearch placeholder="Selecionar cliente"
              options={clients.map((c: any) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Divider style={{ borderColor: '#334155', margin: '4px 0 12px' }}>Itens do Pedido</Divider>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="product" label={<Text style={{ color: '#94a3b8' }}>Produto</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Select options={products.map((p: any) => ({ value: p.id, label: p.name }))} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="qty" label={<Text style={{ color: '#94a3b8' }}>Qtd (ton)</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="price" label={<Text style={{ color: '#94a3b8' }}>R$/ton</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
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
