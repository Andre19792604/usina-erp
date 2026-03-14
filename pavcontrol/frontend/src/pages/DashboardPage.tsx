import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space } from 'antd'
import {
  ProjectOutlined, ToolOutlined, CarOutlined, ThunderboltOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import dayjs from 'dayjs'
import { dashboardService } from '../services/api'

const { Title, Text } = Typography

function KpiCard({ title, value, suffix, icon, color }: any) {
  return (
    <Card style={{ border: '1px solid #1e3a5f', height: '100%' }}>
      <Statistic
        title={<Text style={{ color: '#64748b', fontSize: 13 }}>{title}</Text>}
        value={value}
        suffix={suffix}
        prefix={icon}
        valueStyle={{ color, fontSize: 28, fontWeight: 700 }}
      />
    </Card>
  )
}

const weekData = [
  { day: 'Seg', ton: 180 }, { day: 'Ter', ton: 220 },
  { day: 'Qua', ton: 195 }, { day: 'Qui', ton: 310 },
  { day: 'Sex', ton: 280 }, { day: 'Sab', ton: 120 },
  { day: 'Dom', ton: 0 },
]

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    dashboardService.overview().then(setData).catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Dashboard</Title>
        <Text style={{ color: '#64748b' }}>Visão geral das operações</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title="Obras Ativas" value={data?.projectsActive ?? '—'} icon={<ProjectOutlined />} color="#10b981" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title="Produção Hoje" value={data?.totalProductionToday?.toFixed(1) ?? '—'} suffix="ton" icon={<ArrowUpOutlined />} color="#60a5fa" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title="Equipamentos Ativos" value={data?.equipmentActive ?? '—'} icon={<ToolOutlined />} color="#f59e0b" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title="Combustível Hoje" value={data?.totalFuelToday?.toFixed(0) ?? '—'} suffix="L" icon={<ThunderboltOutlined />} color="#ef4444" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Produção da Semana (ton)</Text>} style={{ border: '1px solid #1e3a5f' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="colorTon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="ton" stroke="#10b981" strokeWidth={2} fill="url(#colorTon)" name="Toneladas" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Veículos na Frota</Text>} style={{ border: '1px solid #1e3a5f', height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94a3b8' }}><CarOutlined /> Veículos</Text>
                <Text style={{ color: '#10b981', fontWeight: 600 }}>{data?.vehiclesActive ?? '—'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94a3b8' }}><ToolOutlined /> Equipamentos</Text>
                <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{data?.equipmentActive ?? '—'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94a3b8' }}><ThunderboltOutlined /> Custo Combustível Hoje</Text>
                <Text style={{ color: '#ef4444', fontWeight: 600 }}>
                  R$ {data?.totalFuelCostToday?.toLocaleString('pt-BR') ?? '—'}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title={<Text style={{ color: '#e2e8f0' }}>Últimas Produções</Text>}
        style={{ border: '1px solid #1e3a5f' }}
      >
        <Table
          dataSource={data?.recentProductions ?? []}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: 'Obra', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.project?.name}</Text> },
            { title: 'Serviço', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.service?.name}</Text> },
            { title: 'Qtd', dataIndex: 'quantity', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{Number(v).toLocaleString('pt-BR')}</Text> },
            { title: 'Responsável', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.user?.name}</Text> },
            { title: 'Data', dataIndex: 'date', render: (v: string) => <Text style={{ color: '#64748b' }}>{dayjs(v).format('DD/MM HH:mm')}</Text> },
            { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={v === 'CONCLUIDO' ? 'success' : v === 'EM_EXECUCAO' ? 'processing' : 'default'}>{v}</Tag> },
          ]}
        />
      </Card>
    </div>
  )
}
