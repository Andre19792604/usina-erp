import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Button, Form, Input, Select, InputNumber,
  Table, Tag, Typography, Divider, Badge, Alert, message,
} from 'antd'
import { CheckCircleOutlined, ReloadOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useWebSocket } from '../hooks/useWebSocket'
import { weightService } from '../services/api'

const { Title, Text } = Typography

interface Ticket {
  id: string
  ticketNumber: string
  grossWeight: number
  tareWeight: number
  netWeight: number
  movementType: string
  createdAt: string
  vehicle?: { plate: string; driverName?: string }
  salesOrder?: { number: string }
}

export default function WeightPage() {
  const [form] = Form.useForm()
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [saving, setSaving] = useState(false)
  const { scaleReading, wsStatus, simulate } = useWebSocket()

  const gross = Form.useWatch('grossWeight', form) || 0
  const tare = Form.useWatch('tare', form) || 0
  const net = gross - tare

  // Sync auto mode with live scale reading (scale sends tons → convert to kg for display)
  useEffect(() => {
    if (mode === 'auto' && scaleReading) {
      form.setFieldValue('grossWeight', Math.round(scaleReading.weight * 1000))
    }
  }, [scaleReading, mode, form])

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    try {
      const data = await weightService.list({ from: dayjs().startOf('day').toISOString() })
      setTickets(Array.isArray(data) ? data : [])
    } catch { /* silent */ }
  }

  async function handleSubmit(values: any) {
    const grossKg = values.grossWeight || 0
    const tareKg = values.tare || 0
    const netKg = grossKg - tareKg
    if (netKg <= 0) { message.error('Peso líquido inválido. Verifique a tara.'); return }
    setSaving(true)
    try {
      await weightService.create({
        plate: values.plate?.toUpperCase(),
        driverName: values.driver,
        grossWeight: grossKg / 1000,
        tareWeight: tareKg / 1000,
        netWeight: netKg / 1000,
        movementType: values.type || 'SAIDA',
      })
      message.success(`Pesagem registrada: ${(netKg / 1000).toFixed(3)} ton`)
      form.resetFields(['plate', 'driver', 'tare'])
      loadTickets()
    } catch {
      message.error('Erro ao registrar pesagem.')
    } finally {
      setSaving(false)
    }
  }

  const totalSaida = tickets
    .filter(t => t.movementType === 'SAIDA')
    .reduce((acc, t) => acc + (t.netWeight || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Balança / Pesagem</Title>
          <Text style={{ color: '#64748b' }}>Registro de pesagem de caminhões</Text>
        </div>
        <Badge
          status={wsStatus.scale ? 'success' : 'error'}
          text={
            <Text style={{ color: wsStatus.scale ? '#22c55e' : '#ef4444', fontSize: 12 }}>
              {wsStatus.scale ? 'Balança Online' : 'Balança Offline'}
            </Text>
          }
        />
      </div>

      <Row gutter={[16, 16]}>
        {/* Painel da balança */}
        <Col xs={24} lg={10}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            {/* Display da balança */}
            <div style={{
              background: '#0f172a', borderRadius: 8, padding: 16,
              textAlign: 'center', marginBottom: 16, border: '1px solid #1e3a5f',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {wsStatus.scale
                  ? <WifiOutlined style={{ color: '#22c55e', fontSize: 12 }} />
                  : <DisconnectOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
                <Text style={{ color: wsStatus.scale ? '#22c55e' : '#ef4444', fontSize: 11 }}>
                  {wsStatus.scale ? 'Conectada' : 'Desconectada'}
                </Text>
                {scaleReading && (
                  <Tag color={scaleReading.stable ? 'success' : 'warning'} style={{ margin: 0, fontSize: 10 }}>
                    {scaleReading.stable ? 'ESTÁVEL' : 'INSTÁVEL'}
                  </Tag>
                )}
              </div>

              <div style={{
                fontSize: 52, fontWeight: 800, color: '#f59e0b',
                fontFamily: 'monospace', margin: '8px 0 4px', letterSpacing: 2,
              }}>
                {scaleReading ? Math.round(scaleReading.weight * 1000).toLocaleString('pt-BR') : '---'}
              </div>
              <Text style={{ color: '#64748b' }}>kg (peso bruto)</Text>

              <Divider style={{ borderColor: '#1e3a5f', margin: '12px 0' }} />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => simulate('scale')}
                style={{ background: '#1e3a5f', border: 'none', color: '#e2e8f0' }}
              >
                Simular Leitura
              </Button>
            </div>

            {/* Modo */}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Modo de operação</Text>
              <Select
                value={mode}
                onChange={v => {
                  setMode(v)
                  if (v === 'manual') form.setFieldValue('grossWeight', undefined)
                }}
                style={{ width: '100%', marginTop: 4 }}
                options={[
                  { value: 'auto', label: '🔌 Automático — leitura direta da balança' },
                  { value: 'manual', label: '⌨️ Manual — operador digita o peso' },
                ]}
              />
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="grossWeight"
                    label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Peso Bruto (kg)</Text>}
                    rules={[{ required: true, message: 'Informe o peso bruto' }]}
                  >
                    <InputNumber style={{ width: '100%' }} disabled={mode === 'auto'} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tare" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Tara (kg)</Text>}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Peso líquido */}
              <div style={{
                background: net > 0 ? '#0d2a1f' : '#1e293b',
                border: `1px solid ${net > 0 ? '#22c55e' : '#334155'}`,
                borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 16,
              }}>
                <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>PESO LÍQUIDO</Text>
                <Text style={{ color: '#22c55e', fontSize: 36, fontWeight: 800, fontFamily: 'monospace' }}>
                  {net > 0 ? net.toLocaleString('pt-BR') : '---'}
                </Text>
                <Text style={{ color: '#64748b' }}> kg &nbsp;|&nbsp; </Text>
                <Text style={{ color: '#f59e0b', fontWeight: 600 }}>
                  {net > 0 ? (net / 1000).toFixed(3) : '0.000'} ton
                </Text>
              </div>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="plate"
                    label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Placa</Text>}
                    rules={[{ required: true, message: 'Informe a placa' }]}
                  >
                    <Input placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="type" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Tipo</Text>} initialValue="SAIDA">
                    <Select options={[
                      { value: 'SAIDA', label: 'Saída (carregado)' },
                      { value: 'ENTRADA', label: 'Entrada (material)' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="driver" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Motorista</Text>}>
                <Input placeholder="Nome do motorista" />
              </Form.Item>

              <Form.Item name="salesOrder" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Pedido (opcional)</Text>}>
                <Input placeholder="Nº do pedido de venda" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                loading={saving}
                block
                size="large"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', fontWeight: 600 }}
              >
                Registrar Pesagem
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Tickets do dia */}
        <Col xs={24} lg={14}>
          <Card
            title={<Text style={{ color: '#e2e8f0' }}>Tickets de Hoje — {dayjs().format('DD/MM/YYYY')}</Text>}
            style={{ border: '1px solid #1e3a5f' }}
          >
            <Alert
              message="Pesagem automática: ao salvar, o consumo de materiais é calculado automaticamente pelo traço da ordem de produção."
              type="info"
              showIcon
              style={{ marginBottom: 16, background: '#162032', border: '1px solid #1e3a5f' }}
            />
            <Table
              dataSource={tickets}
              rowKey="id"
              size="small"
              scroll={{ x: true }}
              pagination={{ pageSize: 10, size: 'small' }}
              columns={[
                { title: 'Ticket', dataIndex: 'ticketNumber', render: v => <Text style={{ color: '#60a5fa', fontSize: 12 }}>{v}</Text> },
                {
                  title: 'Placa',
                  render: (_: any, r: Ticket) => <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.vehicle?.plate ?? '—'}</Text>,
                },
                {
                  title: 'Líquido', dataIndex: 'netWeight',
                  render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>{((v || 0) * 1000).toLocaleString('pt-BR')} kg</Text>,
                },
                {
                  title: 'Pedido',
                  render: (_: any, r: Ticket) => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{r.salesOrder?.number ?? '—'}</Text>,
                },
                {
                  title: 'Hora', dataIndex: 'createdAt',
                  render: (v: string) => <Text style={{ color: '#94a3b8' }}>{dayjs(v).format('HH:mm')}</Text>,
                },
                {
                  title: 'Tipo', dataIndex: 'movementType',
                  render: (v: string) => <Tag color={v === 'SAIDA' ? 'green' : 'blue'}>{v}</Tag>,
                },
              ]}
            />
            <Divider style={{ borderColor: '#1e3a5f' }} />
            <Row gutter={16}>
              {[
                { label: 'Caminhões', value: tickets.length },
                { label: 'Total Saída', value: `${totalSaida.toFixed(3)} ton` },
              ].map(item => (
                <Col key={item.label} span={12}>
                  <div style={{ textAlign: 'center', background: '#0f172a', borderRadius: 8, padding: 12 }}>
                    <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>{item.label}</Text>
                    <Text style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
