import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, InputNumber, DatePicker, Input, Divider, Progress, message, Spin,
} from 'antd'
import { PlusOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons'
import { purchaseService, supplierService, materialService } from '../services/api'

const { Title, Text } = Typography

const statusColors: Record<string, string> = { DRAFT: 'default', SENT: 'processing', PARTIAL: 'orange', RECEIVED: 'success', CANCELLED: 'error' }
const statusLabels: Record<string, string> = { DRAFT: 'Rascunho', SENT: 'Enviado', PARTIAL: 'Parcial', RECEIVED: 'Recebido', CANCELLED: 'Cancelado' }

export default function PurchasePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [receiveModal, setReceiveModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const [receiveForm] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const [ordersData, suppliersData, materialsData] = await Promise.all([
        purchaseService.list(),
        supplierService.list(),
        materialService.list(),
      ])
      setOrders(ordersData)
      setSuppliers(suppliersData)
      setMaterials(materialsData)
    } catch {
      message.error('Erro ao carregar dados de compras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await purchaseService.create({
        supplierId: values.supplier,
        items: [{ materialId: values.material, quantity: values.qty, unitPrice: values.unitPrice }],
        expectedDate: values.expectedDate?.toISOString(),
        notes: values.notes,
      })
      message.success('Pedido de compra criado')
      setModal(false)
      form.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar pedido de compra')
    } finally {
      setSaving(false)
    }
  }

  const openReceive = (id: string) => {
    setSelectedId(id)
    receiveForm.resetFields()
    setReceiveModal(true)
  }

  const handleReceive = async () => {
    if (!selectedId) return
    try {
      const values = await receiveForm.validateFields()
      setSaving(true)
      await purchaseService.receiveItems(selectedId, {
        items: [{ receivedQty: values.receivedQty }],
        nfNumber: values.nfNumber,
        notes: values.notes,
      })
      message.success('Recebimento registrado')
      setReceiveModal(false)
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao registrar recebimento')
    } finally {
      setSaving(false)
    }
  }

  const totalMonth = orders.reduce((a: number, o: any) => a + Number(o.totalAmount || 0), 0)
  const pending = orders.filter((o: any) => !['RECEIVED', 'CANCELLED'].includes(o.status))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Compras</Title>
          <Text style={{ color: '#64748b' }}>Pedidos de compra e recebimento de materiais</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true) }}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            Novo Pedido
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Comprado no Período', value: `R$ ${totalMonth.toLocaleString('pt-BR')}`, color: '#f59e0b' },
          { label: 'Pedidos Pendentes', value: String(pending.length), color: '#60a5fa' },
          { label: 'Aguardando Entrega', value: String(orders.filter((o: any) => o.status === 'SENT').length), color: '#a78bfa' },
          { label: 'Recebidos', value: String(orders.filter((o: any) => o.status === 'RECEIVED').length), color: '#22c55e' },
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
        {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
          <Table dataSource={orders} rowKey="id" size="small"
            columns={[
              { title: 'Nº', dataIndex: 'number', render: (v: string) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
              { title: 'Fornecedor', key: 'supplier', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.supplier?.name || '—'}</Text> },
              {
                title: 'Itens', key: 'items',
                render: (_: any, r: any) => {
                  const items = r.items || []
                  return <Text style={{ color: '#94a3b8', fontSize: 12 }}>{items.map((i: any) => i.material?.name || i.materialId).join(', ') || '—'}</Text>
                },
              },
              {
                title: 'Recebimento', key: 'recv',
                render: (_: any, r: any) => {
                  const items = r.items || []
                  const total = items.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0)
                  const received = items.reduce((s: number, i: any) => s + Number(i.receivedQty || 0), 0)
                  const pct = total > 0 ? Math.round((received / total) * 100) : 0
                  return (
                    <Space direction="vertical" size={2} style={{ minWidth: 110 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>{received}/{total}</Text>
                      <Progress percent={pct} showInfo={false} size="small"
                        strokeColor={pct === 100 ? '#22c55e' : '#f59e0b'} trailColor="#1e3a5f" />
                    </Space>
                  )
                },
              },
              { title: 'Valor', dataIndex: 'totalAmount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {Number(v || 0).toLocaleString('pt-BR')}</Text> },
              { title: 'Previsão', dataIndex: 'expectedDate', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text> },
              { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
              {
                title: '', key: 'action',
                render: (_: any, r: any) => ['SENT', 'PARTIAL'].includes(r.status) && (
                  <Button size="small" icon={<InboxOutlined />} onClick={() => openReceive(r.id)}
                    style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost>Receber</Button>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Pedido de Compra</Text>}
        open={modal} onCancel={() => setModal(false)} width={560}
        footer={[
          <Button key="cancel" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleCreate}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar Pedido</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="supplier" label={<Text style={{ color: '#94a3b8' }}>Fornecedor</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select showSearch placeholder="Selecionar fornecedor"
              options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Divider style={{ borderColor: '#334155', margin: '4px 0 12px' }}>Itens</Divider>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="material" label={<Text style={{ color: '#94a3b8' }}>Material</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Select options={materials.map((m: any) => ({ value: m.id, label: `${m.code} — ${m.name}` }))} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="qty" label={<Text style={{ color: '#94a3b8' }}>Quantidade</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unitPrice" label={<Text style={{ color: '#94a3b8' }}>Preço Unit.</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} />
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

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Registrar Recebimento</Text>}
        open={receiveModal} onCancel={() => setReceiveModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setReceiveModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleReceive}
            style={{ background: '#22c55e', border: 'none' }}>Confirmar Recebimento</Button>,
        ]}
      >
        <Form form={receiveForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="receivedQty" label={<Text style={{ color: '#94a3b8' }}>Quantidade Recebida</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
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
