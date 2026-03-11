import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, Input, DatePicker, Tabs, Badge, message, Spin,
} from 'antd'
import { PlusOutlined, ToolOutlined, WarningOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { maintenanceService } from '../services/api'

const { Title, Text } = Typography

const typeColors: Record<string, string> = { PREVENTIVE: 'blue', CORRECTIVE: 'orange', PREDICTIVE: 'purple' }
const typeLabels: Record<string, string> = { PREVENTIVE: 'Preventiva', CORRECTIVE: 'Corretiva', PREDICTIVE: 'Preditiva' }
const statusColors: Record<string, string> = { OPEN: 'blue', IN_PROGRESS: 'processing', COMPLETED: 'success', CANCELLED: 'error' }
const statusLabels: Record<string, string> = { OPEN: 'Aberta', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' }

export default function MaintenancePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [equipments, setEquipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const [ordersData, equipmentsData] = await Promise.all([
        maintenanceService.listOrders(),
        maintenanceService.listEquipments(),
      ])
      setOrders(ordersData)
      setEquipments(equipmentsData)
    } catch {
      message.error('Erro ao carregar dados de manutenção')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await maintenanceService.createOrder({
        type: values.type,
        equipmentId: values.equipment,
        description: values.desc,
        technicianName: values.tech,
        scheduledAt: values.scheduledAt?.toISOString(),
      })
      message.success('Ordem de serviço criada')
      setModal(false)
      form.resetFields()
      load()
    } catch (err: any) {
      if (err?.errorFields) return
      message.error('Erro ao criar OS')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await maintenanceService.updateOrderStatus(id, { status })
      message.success('Status atualizado')
      load()
    } catch {
      message.error('Erro ao atualizar status')
    }
  }

  const open = orders.filter((o: any) => o.status !== 'COMPLETED').length
  const totalCost = orders.reduce((a: number, o: any) => a + Number(o.cost || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Manutenção</Title>
          <Text style={{ color: '#64748b' }}>Ordens de serviço e controle de equipamentos</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true) }}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>Nova OS</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'OS Abertas', value: String(open), color: '#ef4444' },
          { label: 'Em Andamento', value: String(orders.filter((o: any) => o.status === 'IN_PROGRESS').length), color: '#f59e0b' },
          { label: 'Custo Total', value: `R$ ${totalCost.toLocaleString('pt-BR')}`, color: '#60a5fa' },
          { label: 'Equipamentos', value: String(equipments.length), color: '#22c55e' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
        <Tabs items={[
          {
            key: 'os',
            label: <Space><ToolOutlined /><Text style={{ color: '#e2e8f0' }}>Ordens de Serviço ({orders.length})</Text></Space>,
            children: (
              <Card style={{ border: '1px solid #1e3a5f' }}>
                <Table dataSource={orders} rowKey="id" size="small" columns={[
                  { title: 'Nº OS', dataIndex: 'number', render: (v: string) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                  { title: 'Equipamento', key: 'equip', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.equipment?.name || '—'}</Text> },
                  { title: 'Tipo', dataIndex: 'type', render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag> },
                  { title: 'Descrição', dataIndex: 'description', render: (v: string) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
                  { title: 'Técnico', dataIndex: 'technicianName', render: (v: string) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v || '—'}</Text> },
                  { title: 'Custo', dataIndex: 'cost', render: (v: number) => v ? <Text style={{ color: '#f59e0b' }}>R$ {Number(v).toLocaleString('pt-BR')}</Text> : <Text style={{ color: '#475569' }}>—</Text> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
                  {
                    title: '', key: 'action',
                    render: (_: any, r: any) => (
                      <Space>
                        {r.status === 'OPEN' && <Button size="small" ghost onClick={() => handleStatusChange(r.id, 'IN_PROGRESS')}>Iniciar</Button>}
                        {r.status === 'IN_PROGRESS' && (
                          <Button size="small" icon={<CheckCircleOutlined />}
                            style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost
                            onClick={() => handleStatusChange(r.id, 'COMPLETED')}>Concluir</Button>
                        )}
                      </Space>
                    ),
                  },
                ]} />
              </Card>
            ),
          },
          {
            key: 'equipment',
            label: <Space><WarningOutlined /><Text style={{ color: '#e2e8f0' }}>Equipamentos ({equipments.length})</Text></Space>,
            children: (
              <Card style={{ border: '1px solid #1e3a5f' }}>
                <Table dataSource={equipments} rowKey="id" size="small" columns={[
                  { title: 'Código', dataIndex: 'code', render: (v: string) => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v}</Text> },
                  { title: 'Equipamento', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                  { title: 'Categoria', dataIndex: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
                  {
                    title: 'Status', dataIndex: 'status',
                    render: (v: string) => {
                      const badgeStatus = v === 'ACTIVE' ? 'success' : v === 'MAINTENANCE' ? 'warning' : 'error'
                      const label = v === 'ACTIVE' ? 'Normal' : v === 'MAINTENANCE' ? 'Em Manutenção' : 'Inativo'
                      return <Badge status={badgeStatus} text={<Text style={{ color: '#94a3b8', fontSize: 12 }}>{label}</Text>} />
                    },
                  },
                  {
                    title: 'Última Manutenção', dataIndex: 'lastMaintenanceAt',
                    render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('pt-BR') : '—'}</Text>,
                  },
                  { title: '', key: 'action', render: (_: any, r: any) => <Button size="small" ghost onClick={() => { form.setFieldsValue({ equipment: r.id }); setModal(true) }}>Nova OS</Button> },
                ]} />
              </Card>
            ),
          },
        ]} />
      )}

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Nova Ordem de Serviço</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleCreate}
            style={{ background: '#f59e0b', border: 'none' }}>Abrir OS</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="equipment" label={<Text style={{ color: '#94a3b8' }}>Equipamento</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Select options={equipments.map((e: any) => ({ value: e.id, label: `${e.code} — ${e.name}` }))} />
          </Form.Item>
          <Form.Item name="desc" label={<Text style={{ color: '#94a3b8' }}>Descrição do Serviço</Text>} rules={[{ required: true, message: 'Campo obrigatório' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="tech" label={<Text style={{ color: '#94a3b8' }}>Técnico Responsável</Text>}>
                <Input placeholder="Nome do técnico" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduledAt" label={<Text style={{ color: '#94a3b8' }}>Data Programada</Text>}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
