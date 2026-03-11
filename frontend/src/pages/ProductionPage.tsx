import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Button, Table, Space, Typography,
  Progress, Modal, Form, Select, DatePicker, InputNumber, Badge, message, Spin,
} from 'antd'
import { PlusOutlined, PlayCircleOutlined, CheckCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { productionService, productService } from '../services/api'

const { Title, Text } = Typography

const statusConfig: Record<string, { color: string; label: string }> = {
  PLANNED: { color: 'default', label: 'Planejado' },
  IN_PROGRESS: { color: 'processing', label: 'Em Produção' },
  COMPLETED: { color: 'success', label: 'Concluído' },
  PAUSED: { color: 'warning', label: 'Pausado' },
  CANCELLED: { color: 'error', label: 'Cancelado' },
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [formulas, setFormulas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const [ordersData, productsData, formulasData] = await Promise.all([
        productionService.list(),
        productService.listProducts(),
        productService.listFormulas(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
      setFormulas(formulasData)
    } catch {
      message.error('Erro ao carregar dados de produção')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await productionService.updateStatus(id, { status })
      message.success('Status atualizado')
      load()
    } catch {
      message.error('Erro ao atualizar status')
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const payload: any = {
        productId: values.product,
        formulaId: values.formula,
        plannedQty: values.plannedQty,
        scheduledDate: values.scheduledDate?.toISOString(),
        salesOrderId: values.salesOrder || undefined,
      }
      await productionService.create(payload)
      message.success('Ordem de produção criada')
      setModalOpen(false)
      form.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar ordem de produção')
    } finally {
      setSaving(false)
    }
  }

  const today = orders.filter((o: any) => {
    const d = new Date(o.scheduledDate || o.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const totalProduced = today.reduce((sum: number, o: any) => sum + Number(o.producedQty || 0), 0)
  const active = orders.filter((o: any) => ['IN_PROGRESS', 'PAUSED'].includes(o.status)).length

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Produção</Title>
          <Text style={{ color: '#64748b' }}>Ordens de produção e controle de usina</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            Nova Ordem
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Produção Hoje', value: `${totalProduced.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ton`, color: '#f59e0b' },
          { label: 'Ordens Ativas', value: String(active), color: '#60a5fa' },
          { label: 'Total de Ordens', value: String(orders.length), color: '#94a3b8' },
          { label: 'Concluídas', value: String(orders.filter((o: any) => o.status === 'COMPLETED').length), color: '#22c55e' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f', textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 26, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
          <Table dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} columns={[
            {
              title: 'Nº Ordem', dataIndex: 'number',
              render: (v: string) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text>,
            },
            {
              title: 'Produto', key: 'product',
              render: (_: any, r: any) => (
                <div>
                  <Text style={{ color: '#e2e8f0' }}>{r.product?.name || r.productId}</Text>
                  <br />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{r.formula?.name || ''}</Text>
                </div>
              ),
            },
            {
              title: 'Cliente', key: 'client',
              render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.salesOrder?.client?.name || '—'}</Text>,
            },
            {
              title: 'Progresso', key: 'progress',
              render: (_: any, r: any) => {
                const planned = Number(r.plannedQty || 0)
                const produced = Number(r.producedQty || 0)
                const pct = planned > 0 ? Math.round((produced / planned) * 100) : 0
                return (
                  <div style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{produced}/{planned} ton</Text>
                      <Text style={{ color: '#f59e0b', fontSize: 12 }}>{pct}%</Text>
                    </div>
                    <Progress percent={pct} showInfo={false} size="small"
                      strokeColor={pct === 100 ? '#22c55e' : '#f59e0b'} trailColor="#1e3a5f" />
                  </div>
                )
              },
            },
            {
              title: 'Status', dataIndex: 'status',
              render: (v: string) => {
                const cfg = statusConfig[v] || { color: 'default', label: v }
                return <Badge status={cfg.color as any} text={<Text style={{ color: '#e2e8f0', fontSize: 12 }}>{cfg.label}</Text>} />
              },
            },
            {
              title: 'Data', dataIndex: 'scheduledDate',
              render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>
                {v ? new Date(v).toLocaleDateString('pt-BR') : '—'}
              </Text>,
            },
            {
              title: 'Ações', key: 'actions',
              render: (_: any, r: any) => (
                <Space>
                  {r.status === 'PLANNED' && (
                    <Button size="small" icon={<PlayCircleOutlined />} type="primary" ghost
                      onClick={() => handleStatusChange(r.id, 'IN_PROGRESS')}>Iniciar</Button>
                  )}
                  {r.status === 'IN_PROGRESS' && (
                    <>
                      <Button size="small" icon={<PauseCircleOutlined />} ghost
                        onClick={() => handleStatusChange(r.id, 'PAUSED')}>Pausar</Button>
                      <Button size="small" icon={<CheckCircleOutlined />}
                        style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost
                        onClick={() => handleStatusChange(r.id, 'COMPLETED')}>Concluir</Button>
                    </>
                  )}
                  {r.status === 'PAUSED' && (
                    <Button size="small" icon={<PlayCircleOutlined />} type="primary" ghost
                      onClick={() => handleStatusChange(r.id, 'IN_PROGRESS')}>Retomar</Button>
                  )}
                </Space>
              ),
            },
          ]} />
        )}
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Nova Ordem de Produção</Text>}
        open={modalOpen} onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleCreate}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="product" label={<Text style={{ color: '#94a3b8' }}>Produto</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select placeholder="Selecionar produto"
              options={products.map((p: any) => ({ value: p.id, label: p.name }))} />
          </Form.Item>
          <Form.Item name="formula" label={<Text style={{ color: '#94a3b8' }}>Traço / Fórmula</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select placeholder="Selecionar traço"
              options={formulas.map((f: any) => ({ value: f.id, label: `${f.name} (${f.product?.name || ''})` }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="plannedQty" label={<Text style={{ color: '#94a3b8' }}>Qtd. Planejada (ton)</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduledDate" label={<Text style={{ color: '#94a3b8' }}>Data</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
