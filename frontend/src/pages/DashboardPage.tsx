import { Row, Col, Card, Statistic, Typography, Progress, Table, Badge, Space, Tag } from 'antd'
import {
  ArrowUpOutlined, ArrowDownOutlined, AlertOutlined,
  CarOutlined, WarningOutlined,
} from '@ant-design/icons'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const { Title, Text } = Typography

const productionData = [
  { day: 'Seg', ton: 320 }, { day: 'Ter', ton: 410 },
  { day: 'Qua', ton: 380 }, { day: 'Qui', ton: 520 },
  { day: 'Sex', ton: 490 }, { day: 'Sab', ton: 210 },
  { day: 'Dom', ton: 0 },
]

const recentTickets = [
  { key: 1, placa: 'ABC-1234', motorista: 'João Silva', liquido: '15.240 kg', hora: '08:32', status: 'SAIDA' },
  { key: 2, placa: 'DEF-5678', motorista: 'Carlos Lima', liquido: '14.890 kg', hora: '09:15', status: 'SAIDA' },
  { key: 3, placa: 'GHI-9012', motorista: 'Pedro Souza', liquido: '16.100 kg', hora: '10:01', status: 'SAIDA' },
  { key: 4, placa: 'JKL-3456', motorista: 'Mario Costa', liquido: '13.750 kg', hora: '10:45', status: 'ENTRADA' },
]

const stockAlerts = [
  { material: 'CAP 50/70', atual: 45, minimo: 50, unit: 'ton' },
  { material: 'Cal Hidratada', atual: 12, minimo: 20, unit: 'ton' },
  { material: 'Diesel', atual: 3200, minimo: 5000, unit: 'L' },
]

function KpiCard({ title, value, suffix, prefix, trend, trendValue, color }: any) {
  return (
    <Card style={{ border: '1px solid #1e3a5f', height: '100%' }}>
      <Statistic
        title={<Text style={{ color: '#64748b', fontSize: 13 }}>{title}</Text>}
        value={value}
        suffix={suffix}
        prefix={prefix}
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
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Dashboard</Title>
        <Text style={{ color: '#64748b' }}>Visão geral da operação em tempo real</Text>
      </div>

      {/* KPIs principais */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Produção Hoje"
            value={892}
            suffix="ton"
            trend="up"
            trendValue="+12%"
            color="#f59e0b"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Caminhões Carregados"
            value={58}
            suffix=""
            trend="up"
            trendValue="+5"
            color="#60a5fa"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Perdas Operacionais"
            value={4.2}
            suffix="ton"
            trend="down"
            trendValue="-0.8 ton"
            color="#ef4444"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Eficiência da Usina"
            value={94.3}
            suffix="%"
            trend="up"
            trendValue="+1.2%"
            color="#22c55e"
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
                <Area
                  type="monotone" dataKey="ton" stroke="#f59e0b" strokeWidth={2}
                  fill="url(#colorTon)" name="Toneladas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Status da usina */}
        <Col xs={24} lg={8}>
          <Card
            title={<Text style={{ color: '#e2e8f0' }}>Status da Usina (MX3000)</Text>}
            style={{ border: '1px solid #1e3a5f', height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {[
                { label: 'Temperatura Saída', value: '148°C', status: 'normal', target: '140-160°C' },
                { label: 'Temperatura CAP', value: '162°C', status: 'normal', target: '155-175°C' },
                { label: 'Temperatura Drum', value: '195°C', status: 'warning', target: '180-200°C' },
                { label: 'Traços/hora', value: '24', status: 'normal', target: '≥ 20' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</Text>
                    <Space>
                      <Badge
                        status={item.status === 'normal' ? 'success' : 'warning'}
                      />
                      <Text style={{
                        color: item.status === 'normal' ? '#22c55e' : '#f59e0b',
                        fontWeight: 600, fontSize: 14,
                      }}>
                        {item.value}
                      </Text>
                    </Space>
                  </div>
                  <Text style={{ color: '#475569', fontSize: 11 }}>Meta: {item.target}</Text>
                </div>
              ))}
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
              </Space>
            }
            style={{ border: '1px solid #1e3a5f' }}
          >
            <Table
              dataSource={recentTickets}
              size="small"
              pagination={false}
              columns={[
                { title: 'Placa', dataIndex: 'placa', render: (v) => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                { title: 'Motorista', dataIndex: 'motorista', render: (v) => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Líquido', dataIndex: 'liquido', render: (v) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{v}</Text> },
                { title: 'Hora', dataIndex: 'hora', render: (v) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
                {
                  title: 'Tipo',
                  dataIndex: 'status',
                  render: (v) => (
                    <Tag color={v === 'SAIDA' ? 'green' : 'blue'} style={{ fontSize: 11 }}>{v}</Tag>
                  ),
                },
              ]}
              style={{ color: '#e2e8f0' }}
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
            <Space direction="vertical" style={{ width: '100%' }} size={20}>
              {stockAlerts.map((item) => {
                const pct = Math.round((item.atual / item.minimo) * 100)
                return (
                  <div key={item.material}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Space>
                        <AlertOutlined style={{ color: '#ef4444', fontSize: 12 }} />
                        <Text style={{ color: '#e2e8f0', fontSize: 13 }}>{item.material}</Text>
                      </Space>
                      <Text style={{ color: '#ef4444', fontWeight: 600 }}>
                        {item.atual.toLocaleString()} {item.unit}
                      </Text>
                    </div>
                    <Progress
                      percent={pct}
                      size="small"
                      strokeColor="#ef4444"
                      trailColor="#1e3a5f"
                      showInfo={false}
                    />
                    <Text style={{ color: '#475569', fontSize: 11 }}>
                      Mínimo: {item.minimo.toLocaleString()} {item.unit}
                    </Text>
                  </div>
                )
              })}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
