import { useState } from 'react'
import {
  Row, Col, Card, Button, Form, Input, Select, InputNumber,
  Table, Tag, Space, Typography, Divider, Badge, Alert,
} from 'antd'
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const tickets = [
  { key: 1, number: 'PES00000001', plate: 'ABC-1234', driver: 'João Silva', gross: 28400, tare: 13200, net: 15200, type: 'SAIDA', time: '08:32', order: 'OP00001234' },
  { key: 2, number: 'PES00000002', plate: 'DEF-5678', driver: 'Carlos Lima', gross: 27900, tare: 13000, net: 14900, type: 'SAIDA', time: '09:15', order: 'OP00001234' },
  { key: 3, number: 'PES00000003', plate: 'GHI-9012', driver: 'Pedro Souza', gross: 29100, tare: 13000, net: 16100, type: 'SAIDA', time: '10:01', order: 'OP00001235' },
  { key: 4, number: 'PES00000004', plate: 'JKL-3456', driver: 'Mario Costa', gross: 22750, tare: 9000, net: 13750, type: 'ENTRADA', time: '10:45', order: '-' },
]

export default function WeightPage() {
  const [form] = Form.useForm()
  const [scaleReading, setScaleReading] = useState<number | null>(28450)
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const gross = Form.useWatch('grossWeight', form) || 0
  const tare = Form.useWatch('tare', form) || 0
  const net = gross - tare

  function simulateScale() {
    const val = 20000 + Math.floor(Math.random() * 12000)
    setScaleReading(val)
    form.setFieldValue('grossWeight', val)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Balança / Pesagem</Title>
          <Text style={{ color: '#64748b' }}>Registro de pesagem de caminhões</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Painel da balança */}
        <Col xs={24} lg={10}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            {/* Status balança */}
            <div style={{
              background: '#0f172a', borderRadius: 8, padding: 16,
              textAlign: 'center', marginBottom: 16, border: '1px solid #1e3a5f',
            }}>
              <Badge status="success" text={<Text style={{ color: '#22c55e', fontSize: 12 }}>Balança Conectada</Text>} />
              <div style={{
                fontSize: 48, fontWeight: 800, color: '#f59e0b',
                fontFamily: 'monospace', margin: '8px 0 4px',
              }}>
                {scaleReading ? `${scaleReading.toLocaleString()}` : '---'}
              </div>
              <Text style={{ color: '#64748b' }}>kg (peso bruto)</Text>
              <Divider style={{ borderColor: '#1e3a5f', margin: '12px 0' }} />
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={simulateScale}
                  style={{ background: '#1e3a5f', border: 'none', color: '#e2e8f0' }}
                >
                  Atualizar Leitura
                </Button>
              </Space>
            </div>

            {/* Modo */}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Modo de operação</Text>
              <Select
                value={mode}
                onChange={setMode}
                style={{ width: '100%', marginTop: 4 }}
                options={[
                  { value: 'auto', label: '🔌 Automático — leitura direta da balança' },
                  { value: 'manual', label: '⌨️ Manual — operador digita o peso' },
                ]}
              />
            </div>

            <Form form={form} layout="vertical">
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="grossWeight" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Peso Bruto (kg)</Text>}>
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={mode === 'auto'}
                      value={mode === 'auto' ? scaleReading ?? undefined : undefined}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tare" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Tara (kg)</Text>}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Peso líquido calculado */}
              <div style={{
                background: net > 0 ? '#0d2a1f' : '#1e293b',
                border: `1px solid ${net > 0 ? '#22c55e' : '#334155'}`,
                borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 16,
              }}>
                <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>PESO LÍQUIDO</Text>
                <Text style={{ color: '#22c55e', fontSize: 36, fontWeight: 800, fontFamily: 'monospace' }}>
                  {net > 0 ? net.toLocaleString() : '---'}
                </Text>
                <Text style={{ color: '#64748b' }}> kg</Text>
              </div>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="plate" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Placa</Text>}>
                    <Input placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="type" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Tipo</Text>}>
                    <Select options={[{ value: 'SAIDA', label: 'Saída (carregado)' }, { value: 'ENTRADA', label: 'Entrada (material)' }]} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="driver" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Motorista</Text>}>
                <Input placeholder="Nome do motorista" />
              </Form.Item>

              <Form.Item name="salesOrder" label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>Pedido (opcional)</Text>}>
                <Select showSearch placeholder="Selecionar pedido" allowClear
                  options={[{ value: 'OP00001234', label: 'OP00001234 — Prefeitura SP' }, { value: 'OP00001235', label: 'OP00001235 — Construtora ABC' }]} />
              </Form.Item>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
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
              size="small"
              scroll={{ x: true }}
              columns={[
                { title: 'Ticket', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontSize: 12 }}>{v}</Text> },
                { title: 'Placa', dataIndex: 'plate', render: v => <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</Text> },
                { title: 'Líquido', dataIndex: 'net', render: v => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>{v.toLocaleString()} kg</Text> },
                { title: 'Pedido', dataIndex: 'order', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
                { title: 'Hora', dataIndex: 'time', render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
                {
                  title: 'Tipo',
                  dataIndex: 'type',
                  render: v => <Tag color={v === 'SAIDA' ? 'green' : 'blue'}>{v}</Tag>,
                },
              ]}
            />
            <Divider style={{ borderColor: '#1e3a5f' }} />
            <Row gutter={16}>
              {[
                { label: 'Caminhões', value: tickets.length },
                { label: 'Total Saída', value: `${(tickets.filter(t => t.type === 'SAIDA').reduce((a, t) => a + t.net, 0) / 1000).toFixed(1)} ton` },
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
