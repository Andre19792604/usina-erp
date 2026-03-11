import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Button, Tabs, Modal, Form, Input, InputNumber, DatePicker, Select, message, Spin } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { financialService, clientService, supplierService } from '../services/api'

const { Title, Text } = Typography

const statusColors: Record<string, string> = { OPEN: 'blue', PARTIAL: 'orange', PAID: 'green', OVERDUE: 'red', CANCELLED: 'default' }
const statusLabels: Record<string, string> = { OPEN: 'Em Aberto', PARTIAL: 'Parcial', PAID: 'Pago', OVERDUE: 'Vencido', CANCELLED: 'Cancelado' }

export default function FinancialPage() {
  const [payable, setPayable] = useState<any[]>([])
  const [receivable, setReceivable] = useState<any[]>([])
  const [dashboard, setDashboard] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [payableModal, setPayableModal] = useState(false)
  const [receivableModal, setReceivableModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [payForm] = Form.useForm()
  const [recForm] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const [payData, recData, dashData, clientsData, suppliersData] = await Promise.all([
        financialService.listPayable(),
        financialService.listReceivable(),
        financialService.dashboard(),
        clientService.list(),
        supplierService.list(),
      ])
      setPayable(payData)
      setReceivable(recData)
      setDashboard(dashData)
      setClients(clientsData)
      setSuppliers(suppliersData)
    } catch {
      message.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handlePayPayable = async (id: string) => {
    try {
      await financialService.payPayable(id, { paidAt: new Date().toISOString() })
      message.success('Pagamento registrado')
      load()
    } catch {
      message.error('Erro ao registrar pagamento')
    }
  }

  const handleReceivePayment = async (id: string) => {
    try {
      await financialService.receivePayment(id, { receivedAt: new Date().toISOString() })
      message.success('Recebimento registrado')
      load()
    } catch {
      message.error('Erro ao registrar recebimento')
    }
  }

  const handleCreatePayable = async () => {
    try {
      const values = await payForm.validateFields()
      setSaving(true)
      await financialService.createPayable({
        ...values,
        dueDate: values.dueDate?.toISOString(),
        amount: Number(values.amount),
      })
      message.success('Conta a pagar criada')
      setPayableModal(false)
      payForm.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar conta a pagar')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateReceivable = async () => {
    try {
      const values = await recForm.validateFields()
      setSaving(true)
      await financialService.createReceivable({
        ...values,
        dueDate: values.dueDate?.toISOString(),
        amount: Number(values.amount),
      })
      message.success('Conta a receber criada')
      setReceivableModal(false)
      recForm.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar conta a receber')
    } finally {
      setSaving(false)
    }
  }

  const totalPayable = payable.filter(p => p.status !== 'PAID').reduce((a: number, p: any) => a + Number(p.amount || 0), 0)
  const totalReceivable = receivable.filter(r => r.status !== 'PAID').reduce((a: number, r: any) => a + Number(r.amount || 0), 0)
  const overdue = [...payable, ...receivable].filter(i => i.status === 'OVERDUE').length

  const cashFlowData = dashboard?.cashFlow || []

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Financeiro</Title>
          <Text style={{ color: '#64748b' }}>Contas a pagar, receber e fluxo de caixa</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'A Receber', value: `R$ ${totalReceivable.toLocaleString('pt-BR')}`, color: '#22c55e', icon: <ArrowUpOutlined /> },
          { label: 'A Pagar', value: `R$ ${totalPayable.toLocaleString('pt-BR')}`, color: '#ef4444', icon: <ArrowDownOutlined /> },
          { label: 'Saldo Projetado', value: `R$ ${(totalReceivable - totalPayable).toLocaleString('pt-BR')}`, color: '#f59e0b', icon: <DollarOutlined /> },
          { label: 'Vencidos', value: String(overdue), color: '#f87171', icon: null },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {cashFlowData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={<Text style={{ color: '#e2e8f0' }}>Fluxo de Caixa</Text>} style={{ border: '1px solid #1e3a5f' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v: any) => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Tabs items={[
          {
            key: 'payable',
            label: <Text style={{ color: '#e2e8f0' }}>Contas a Pagar ({payable.length})</Text>,
            children: (
              <>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button icon={<PlusOutlined />} size="small" onClick={() => { payForm.resetFields(); setPayableModal(true) }}
                    style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }}>Nova Conta</Button>
                </div>
                <Table dataSource={payable} rowKey="id" size="small" columns={[
                  { title: 'Fornecedor', key: 'supplier', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.supplier?.name || r.description}</Text> },
                  { title: 'Descrição', dataIndex: 'description', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                  { title: 'Valor', dataIndex: 'amount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {Number(v || 0).toLocaleString('pt-BR')}</Text> },
                  { title: 'Vencimento', dataIndex: 'dueDate', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
                  { title: '', key: 'action', render: (_: any, r: any) => r.status !== 'PAID' && <Button size="small" type="primary" ghost onClick={() => handlePayPayable(r.id)}>Pagar</Button> },
                ]} />
              </>
            ),
          },
          {
            key: 'receivable',
            label: <Text style={{ color: '#e2e8f0' }}>Contas a Receber ({receivable.length})</Text>,
            children: (
              <>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button icon={<PlusOutlined />} size="small" onClick={() => { recForm.resetFields(); setReceivableModal(true) }}
                    style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }}>Nova Conta</Button>
                </div>
                <Table dataSource={receivable} rowKey="id" size="small" columns={[
                  { title: 'Cliente', key: 'client', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.client?.name || r.description}</Text> },
                  { title: 'Descrição', dataIndex: 'description', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                  { title: 'Valor', dataIndex: 'amount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {Number(v || 0).toLocaleString('pt-BR')}</Text> },
                  { title: 'Vencimento', dataIndex: 'dueDate', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
                  { title: '', key: 'action', render: (_: any, r: any) => r.status !== 'PAID' && <Button size="small" type="primary" ghost onClick={() => handleReceivePayment(r.id)}>Receber</Button> },
                ]} />
              </>
            ),
          },
        ]} />
      </Card>

      {/* Modal: Nova Conta a Pagar */}
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Nova Conta a Pagar</Text>}
        open={payableModal} onCancel={() => setPayableModal(false)}
        footer={[
          <Button key="c" onClick={() => setPayableModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleCreatePayable}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={payForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="supplierId" label={<Text style={{ color: '#94a3b8' }}>Fornecedor</Text>}>
            <Select showSearch allowClear placeholder="Selecionar fornecedor"
              options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ color: '#94a3b8' }}>Descrição</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="amount" label={<Text style={{ color: '#94a3b8' }}>Valor (R$)</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label={<Text style={{ color: '#94a3b8' }}>Vencimento</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal: Nova Conta a Receber */}
      <Modal title={<Text style={{ color: '#e2e8f0' }}>Nova Conta a Receber</Text>}
        open={receivableModal} onCancel={() => setReceivableModal(false)}
        footer={[
          <Button key="c" onClick={() => setReceivableModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleCreateReceivable}
            style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
      >
        <Form form={recForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="clientId" label={<Text style={{ color: '#94a3b8' }}>Cliente</Text>}>
            <Select showSearch allowClear placeholder="Selecionar cliente"
              options={clients.map((c: any) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ color: '#94a3b8' }}>Descrição</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="amount" label={<Text style={{ color: '#94a3b8' }}>Valor (R$)</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label={<Text style={{ color: '#94a3b8' }}>Vencimento</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
