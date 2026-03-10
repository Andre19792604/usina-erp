import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, InputNumber, DatePicker, Input, Divider, Progress,
} from 'antd'
import { PlusOutlined, InboxOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const orders = [
  { key: 1, number: 'PC00000091', supplier: 'Petrobras', material: 'CAP 50/70', qty: 30, received: 30, unit: 'ton', total: 126000, expectedDate: '08/03/2026', status: 'RECEIVED' },
  { key: 2, number: 'PC00000090', supplier: 'Pedreira São João', material: 'Brita 0 + Pó de Pedra', qty: 400, received: 200, unit: 'ton', total: 18700, expectedDate: '12/03/2026', status: 'PARTIAL' },
  { key: 3, number: 'PC00000089', supplier: 'Posto Central', material: 'Diesel', qty: 10000, received: 0, unit: 'L', total: 59000, expectedDate: '15/03/2026', status: 'SENT' },
  { key: 4, number: 'PC00000088', supplier: 'Calcário Norte', material: 'Cal Hidratada', qty: 20, received: 0, unit: 'ton', total: 6400, expectedDate: '20/03/2026', status: 'DRAFT' },
]

const statusColors: Record<string, string> = { DRAFT: 'default', SENT: 'processing', PARTIAL: 'orange', RECEIVED: 'success', CANCELLED: 'error' }
const statusLabels: Record<string, string> = { DRAFT: 'Rascunho', SENT: 'Enviado', PARTIAL: 'Parcial', RECEIVED: 'Recebido', CANCELLED: 'Cancelado' }

export default function PurchasePage() {
  const [modal, setModal] = useState(false)
  const [receiveModal, setReceiveModal] = useState(false)
  const [form] = Form.useForm()

  const totalMonth = orders.reduce((a, o) => a + o.total, 0)
  const pending = orders.filter(o => !['RECEIVED', 'CANCELLED'].includes(o.status))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Compras</Title>
          <Text style={{ color: '#64748b' }}>Pedidos de compra e recebimento de materiais</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Novo Pedido
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Comprado no Mês', value: `R$ ${totalMonth.toLocaleString('pt-BR')}`, color: '#f59e0b' },
          { label: 'Pedidos Pendentes', value: String(pending.length), color: '#60a5fa' },
          { label: 'Aguardando Entrega', value: String(orders.filter(o => o.status === 'SENT').length), color: '#a78bfa' },
          { label: 'Recebidos no Mês', value: String(orders.filter(o => o.status === 'RECEIVED').length), color: '#22c55e' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<Text style={{ color: '#e2e8f0' }}>Pedidos de Compra</Text>} style={{ border: '1px solid #1e3a5f' }}>
        <Table
          dataSource={orders} size="small"
          columns={[
            { title: 'Nº', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
            { title: 'Fornecedor', dataIndex: 'supplier', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
            { title: 'Material', dataIndex: 'material', render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
            {
              title: 'Recebimento', key: 'recv',
              render: (_, r: any) => {
                const pct = Math.round((r.received / r.qty) * 100)
                return (
                  <Space direction="vertical" size={2} style={{ minWidth: 110 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>{r.received}/{r.qty} {r.unit}</Text>
                    <Progress percent={pct} showInfo={false} size="small"
                      strokeColor={pct === 100 ? '#22c55e' : '#f59e0b'} trailColor="#1e3a5f" />
                  </Space>
                )
              },
            },
            { title: 'Valor', dataIndex: 'total', render: v => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {v.toLocaleString('pt-BR')}</Text> },
            { title: 'Previsão', dataIndex: 'expectedDate', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
            { title: 'Status', dataIndex: 'status', render: v => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
            {
              title: '', key: 'action',
              render: (_, r: any) => (
                <Space>
                  {['SENT', 'PARTIAL'].includes(r.status) && (
                    <Button size="small" icon={<InboxOutlined />} onClick={() => setReceiveModal(true)}
                      style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost>Receber</Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal novo pedido */}
      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Novo Pedido de Compra</Text>}
        open={modal} onCancel={() => setModal(false)} width={560}
        footer={[
          <Button key="cancel" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar Pedido</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="supplier" label={<Text style={{ color: '#94a3b8' }}>Fornecedor</Text>} required>
            <Select showSearch placeholder="Selecionar fornecedor" options={[
              { value: 'petrobras', label: 'Petrobras' },
              { value: 'pedreira', label: 'Pedreira São João' },
              { value: 'posto', label: 'Posto Central' },
            ]} />
          </Form.Item>
          <Divider style={{ borderColor: '#334155', margin: '4px 0 12px' }}>Itens</Divider>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="material" label={<Text style={{ color: '#94a3b8' }}>Material</Text>} required>
                <Select options={[
                  { value: 'cap-50', label: 'CAP 50/70' },
                  { value: 'brita0', label: 'Brita 0' },
                  { value: 'diesel', label: 'Diesel' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="qty" label={<Text style={{ color: '#94a3b8' }}>Quantidade</Text>} required>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unitPrice" label={<Text style={{ color: '#94a3b8' }}>Preço Unit.</Text>} required>
                <InputNumber style={{ width: '100%' }} prefix="R$" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expectedDate" label={<Text style={{ color: '#94a3b8' }}>Data Prevista de Entrega</Text>}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal recebimento */}
      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Registrar Recebimento</Text>}
        open={receiveModal} onCancel={() => setReceiveModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setReceiveModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#22c55e', border: 'none' }}>Confirmar Recebimento</Button>,
        ]}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="receivedQty" label={<Text style={{ color: '#94a3b8' }}>Quantidade Recebida</Text>} required>
            <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} />
          </Form.Item>
          <Form.Item name="nfNumber" label={<Text style={{ color: '#94a3b8' }}>Número NF</Text>}>
            <Input placeholder="Ex: 4521" />
          </Form.Item>
          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
