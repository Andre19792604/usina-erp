import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Progress, Table, Badge, Space, Tag } from 'antd'
import {
  ArrowUpOutlined, ArrowDownOutlined, AlertOutlined,
  CarOutlined, WarningOutlined, WifiOutlined, DisconnectOutlined,
} from '@ant-design/icons'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import dayjs from 'dayjs'
import { useWebSocket } from '../hooks/useWebSocket'
import { weightService, materialService, financialService } from '../services/api'

const { Title, Text } = Typography

const productionData = [
  { day: 'Seg', ton: 320 }, { day: 'Ter', ton: 410 },
  { day: 'Qua', ton: 380 }, { day: 'Qui', ton: 520 },
  { day: 'Sex', ton: 490 }, { day: 'Sab', ton: 210 },
  { day: 'Dom', ton: 0 },
]

function KpiCard({ title, value, suffix, trend, trendValue, color }: any) {
  return (
    <Card style={{ border: '1px solid #1e3a5f', height: '100%' }}>
      <Statistic
        title={<Text style={{ color: '#64748b', fontSize: 13 }}>{title}</Text>}
        value={value}
        suffix={suffix}
        valueStyle={{ color, fontSize: 28, fontWeight: 700 }}
      />
      {trend && (
        <Space style={{ marginTop: 8 }}>
          {trend === 'up'
            ? <ArrowUpOutlined style={{ color: '#22c55e', fontSize: 12 }} />
            : <ArrowDownOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
          <Text style={{ color: trend === 'up' ? '#22c55e' : '#ef4444', fontSize: 12 }}>
            {trendValue} vs ontem
          </Text>
        </Space>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { scaleReading, mx3000Data, wsStatus } = useWebSocket()
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [stockAlerts, setStockAlerts] = useState<any[]>([])
  const [financial, setFinancial] = useState<any>(null)

  useEffect(() => {
    // Load recent tickets
    weightService.list({ from: dayjs().startOf('day').toISOString() })
      .then(d => setRecentTickets(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {})

    // Load materials with low stock
    materialService.list()
      .then(d => {
        const low = (Array.isArray(d) ? d : []).filter((m: any) => m.currentStock <= m.minimumStock)
        setStockAlerts(low.slice(0, 5))
      })
      .catch(() => {})

    // Load financial KPIs
    financialService.dashboard()
      .then(setFinancial)
      .catch(() => {})
  }, [])

  // MX3000 temperature items
  const mx3000Items = mx3000Data ? [
    { label: 'Temperatura Saída', value: mx3000Data.tempOutput, target: '140–160°C', min: 140, max: 160 },
    { label: 'Temperatura CAP', value: mx3000Data.tempCap, target: '155–175°C', min: 155, max: 175 },
    { label: 'Temperatura Drum', value: mx3000Data.tempDrum, target: '180–220°C', min: 180, max: 220 },
    { label: 'Temperatura Misturador', value: mx3000Data.tempMixer, target: '140–170°C', min: 140, max: 170 },
  ] : [
    { label: 'Temperatura Saída', value: null, target: '140–160°C', min: 140, max: 160 },
    { label: 'Temperatura CAP', value: null, target: '155–175°C', min: 155, max: 175 },
    { label: 'Temperatura Drum', value: null, target: '180–220°C', min: 180, max: 220 },
    { label: 'Temperatura Misturador', value: null, target: '140–170°C', min: 140, max: 170 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Dashboard</Title>
          <Text style={{ color: '#64748b' }}>Visão geral da operação em tempo real</Text>
        </div>
        <Space>
          <Badge status={wsStatus.scale ? 'success' : 'error'} />
          <Text style={{ color: wsStatus.scale ? '#22c55e' : '#ef4444', fontSize: 12 }}>
            {wsStatus.scale ? 'Balança' : 'Balança Offline'}
          </Text>
          <Badge status={wsStatus.mx3000 ? 'success' : 'error'} />
          <Text style={{ color: wsStatus.mx3000 ? '#22c55e' : '#ef4444', fontSize: 12 }}>
            {wsStatus.mx3000 ? 'MX3000' : 'MX3000 Offline'}
          </Text>
        </Space>
      </div>

      {/* KPIs principais */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Produção Hoje (MX3000)"
            value={mx3000Data ? (mx3000Data.totalProduced / 1000).toFixed(1) : '—'}
            suffix="ton"
            trend="up"
            trendValue="+12%"
            color="#f59e0b"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Lotes Produzidos"
            value={mx3000Data ? mx3000Data.batchCount : '—'}
            suffix=""
            trend="up"
            trendValue="+5"
            color="#60a5fa"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="A Receber"
            value={financial ? (financial.totalReceivable / 1000).toFixed(0) : '—'}
            suffix="k"
            trend="up"
            trendValue="+R$12k"
            color="#22c55e"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Balança — Peso Atual"
            value={scaleReading ? (scaleReading.weight * 1000).toLocaleString('pt-BR') : '—'}
            suffix="kg"
            color={scaleReading?.stable ? '#22c55e' : '#f59e0b'}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Gráfico de produção */}
        <Col xs={24} lg={16}>
          <Card
            title={<Text style={{ color: '#e2e8f0' }}>Produção da Semana (ton)</Text>}
            style={{ border: '1px solid #1e3a5f' }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="colorTon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="ton" stroke="#f59e0b" strokeWidth={2} fill="url(#colorTon)" name="Toneladas" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Status da usina MX3000 — tempo real */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                {wsStatus.mx3000
                  ? <WifiOutlined style={{ color: '#22c55e', fontSize: 12 }} />
                  : <DisconnectOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
                <Text style={{ color: '#e2e8f0' }}>MX3000 — Tempo Real</Text>
              </Space>
            }
            style={{ border: '1px solid #1e3a5f', height: '100%' }}
            extra={
              mx3000Data && (
                <Text style={{ color: '#475569', fontSize: 11 }}>
                  Lote: {(mx3000Data.batchWeight / 1000).toFixed(2)} t
                </Text>
              )
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size={14}>
              {mx3000Items.map((item) => {
                const inRange = item.value !== null &&
                  item.value >= item.min && item.value <= item.max
                const color = item.value === null ? '#475569' : inRange ? '#22c55e' : '#ef4444'
                const badgeStatus = item.value === null ? 'default' : inRange ? 'success' : 'error'
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</Text>
                      <Space>
                        <Badge status={badgeStatus as any} />
                        <Text style={{ color, fontWeight: 600, fontSize: 14 }}>
                          {item.value !== null ? `${item.value}°C` : '—'}
                        </Text>
                      </Space>
                    </div>
                    <Text style={{ color: '#475569', fontSize: 11 }}>Meta: {item.target}</Text>
                  </div>
                )
              })}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Últimas pesagens */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <CarOutlined style={{ color: '#60a5fa' }} />
                <Text style={{ color: '#e2e8f0' }}>Últimas Pesagens</Text>
                {scaleReading && (
                  <Tag color={scaleReading.stable ? 'success' : 'warning'} style={{ fontSize: 11 }}>
                    {(scaleReading.weight * 1000).toLocaleString('pt-BR')} kg {scaleReading.stable ? '✓' : '~'}
                  </Tag>
                )}
              </Space>
            }
            style={{ border: '1px solid #1e3a5f' }}
          >
            <Table
              dataSource={recentTickets}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Placa',
                  render: (_: any, r: any) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{r.vehicle?.plate ?? '—'}</Text>,
                },
                {
                  title: 'Líquido', dataIndex: 'netWeight',
                  render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{((v || 0) * 1000).toLocaleString('pt-BR')} kg</Text>,
                },
                {
                  title: 'Hora', dataIndex: 'createdAt',
                  render: (v: string) => <Text style={{ color: '#94a3b8' }}>{dayjs(v).format('HH:mm')}</Text>,
                },
                {
                  title: 'Tipo', dataIndex: 'movementType',
                  render: (v: string) => <Tag color={v === 'SAIDA' ? 'green' : 'blue'} style={{ fontSize: 11 }}>{v}</Tag>,
                },
              ]}
            />
          </Card>
        </Col>

        {/* Alertas de estoque */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ef4444' }} />
                <Text style={{ color: '#e2e8f0' }}>Alertas de Estoque</Text>
              </Space>
            }
            style={{ border: '1px solid #1e3a5f' }}
          >
            {stockAlerts.length === 0 ? (
              <Text style={{ color: '#475569' }}>Nenhum alerta de estoque.</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={20}>
                {stockAlerts.map((item: any) => {
                  const pct = item.minimumStock > 0
                    ? Math.min(100, Math.round((item.currentStock / item.minimumStock) * 100))
                    : 100
                  return (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Space>
                          <AlertOutlined style={{ color: '#ef4444', fontSize: 12 }} />
                          <Text style={{ color: '#e2e8f0', fontSize: 13 }}>{item.name}</Text>
                        </Space>
                        <Text style={{ color: '#ef4444', fontWeight: 600 }}>
                          {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                        </Text>
                      </div>
                      <Progress percent={pct} size="small" strokeColor="#ef4444" trailColor="#1e3a5f" showInfo={false} />
                      <Text style={{ color: '#475569', fontSize: 11 }}>
                        Mínimo: {item.minimumStock.toLocaleString('pt-BR')} {item.unit}
                      </Text>
                    </div>
                  )
                })}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
