import { Row, Col, Card, Table, Tag, Typography, Button, Tabs } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const { Title, Text } = Typography

const payable = [
  { key: 1, supplier: 'Petrobras', desc: 'CAP 50/70 — PC00000089', amount: 126000, due: '15/03/2026', status: 'OPEN' },
  { key: 2, supplier: 'Pedreira São João', desc: 'Brita e Pó de Pedra — PC00000090', amount: 18700, due: '20/03/2026', status: 'OPEN' },
  { key: 3, supplier: 'Posto Central', desc: 'Diesel — PC00000091', amount: 29500, due: '12/03/2026', status: 'OVERDUE' },
  { key: 4, supplier: 'Calcário Norte', desc: 'Cal Hidratada — PC00000088', amount: 6400, due: '05/03/2026', status: 'PAID' },
]

const receivable = [
  { key: 1, client: 'Prefeitura de SP', desc: 'OP00001230 — 400 ton CBUQ', amount: 112000, due: '20/03/2026', status: 'OPEN' },
  { key: 2, client: 'Construtora ABC', desc: 'OP00001229 — 300 ton CBUQ', amount: 84000, due: '15/03/2026', status: 'PARTIAL' },
  { key: 3, client: 'DER-SP', desc: 'OP00001228 — 200 ton PMF', amount: 48000, due: '01/03/2026', status: 'OVERDUE' },
  { key: 4, client: 'Empreiteira Sul', desc: 'OP00001227 — 150 ton CBUQ', amount: 42000, due: '28/02/2026', status: 'PAID' },
]

const cashFlowData = [
  { month: 'Out', receitas: 280000, despesas: 195000 },
  { month: 'Nov', receitas: 320000, despesas: 210000 },
  { month: 'Dez', receitas: 290000, despesas: 220000 },
  { month: 'Jan', receitas: 350000, despesas: 240000 },
  { month: 'Fev', receitas: 310000, despesas: 195000 },
  { month: 'Mar', receitas: 286000, despesas: 180000 },
]

const statusColors: Record<string, string> = {
  OPEN: 'blue', PARTIAL: 'orange', PAID: 'green', OVERDUE: 'red', CANCELLED: 'default',
}
const statusLabels: Record<string, string> = {
  OPEN: 'Em Aberto', PARTIAL: 'Parcial', PAID: 'Pago', OVERDUE: 'Vencido', CANCELLED: 'Cancelado',
}

const commonCols = (entity: string) => [
  { title: entity, dataIndex: entity === 'Fornecedor' ? 'supplier' : 'client', render: (v: string) => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
  { title: 'Descrição', dataIndex: 'desc', render: (v: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
  { title: 'Valor', dataIndex: 'amount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {v.toLocaleString('pt-BR')}</Text> },
  { title: 'Vencimento', dataIndex: 'due', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
  { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
  { title: '', key: 'action', render: (_: any, r: any) => r.status !== 'PAID' && <Button size="small" type="primary" ghost>Pagar</Button> },
]

export default function FinancialPage() {
  const totalPayable = payable.filter(p => p.status !== 'PAID').reduce((a, p) => a + p.amount, 0)
  const totalReceivable = receivable.filter(r => r.status !== 'PAID').reduce((a, r) => a + r.amount, 0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Financeiro</Title>
        <Text style={{ color: '#64748b' }}>Contas a pagar, receber e fluxo de caixa</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'A Receber', value: totalReceivable, color: '#22c55e', icon: <ArrowUpOutlined /> },
          { label: 'A Pagar', value: totalPayable, color: '#ef4444', icon: <ArrowDownOutlined /> },
          { label: 'Saldo Projetado', value: totalReceivable - totalPayable, color: '#f59e0b', icon: <DollarOutlined /> },
          { label: 'Vencidos', value: [...payable, ...receivable].filter(i => i.status === 'OVERDUE').length, color: '#f87171', icon: null, isCount: true },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: item.isCount ? 32 : 22, fontWeight: 700 }}>
                {item.isCount ? item.value : `R$ ${item.value.toLocaleString('pt-BR')}`}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Fluxo de Caixa — Últimos 6 Meses</Text>} style={{ border: '1px solid #1e3a5f' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Tabs
          items={[
            {
              key: 'payable',
              label: <Text style={{ color: '#e2e8f0' }}>Contas a Pagar</Text>,
              children: <Table dataSource={payable} columns={commonCols('Fornecedor')} size="small" />,
            },
            {
              key: 'receivable',
              label: <Text style={{ color: '#e2e8f0' }}>Contas a Receber</Text>,
              children: <Table dataSource={receivable} columns={commonCols('Cliente')} size="small" />,
            },
          ]}
        />
      </Card>
    </div>
  )
}
