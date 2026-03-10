import { useState } from 'react'
import {
  Row, Col, Card, Button, Table, Space, Typography,
  Progress, Modal, Form, Select, DatePicker, InputNumber, Badge,
} from 'antd'
import { PlusOutlined, PlayCircleOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const orders = [
  {
    key: 1, number: 'OP00001234', product: 'CBUQ Binder Course', formula: 'Traço BC-01',
    planned: 500, produced: 342, status: 'IN_PROGRESS', scheduled: '10/03/2026',
    client: 'Prefeitura SP', temp: 148,
  },
  {
    key: 2, number: 'OP00001235', product: 'CBUQ Capa Rolamento', formula: 'Traço CR-02',
    planned: 300, produced: 300, status: 'COMPLETED', scheduled: '10/03/2026',
    client: 'Construtora ABC', temp: 152,
  },
  {
    key: 3, number: 'OP00001236', product: 'PMF', formula: 'Traço PMF-01',
    planned: 200, produced: 0, status: 'PLANNED', scheduled: '11/03/2026',
    client: 'DER-SP', temp: null,
  },
]

const statusConfig: Record<string, { color: string; label: string }> = {
  PLANNED: { color: 'default', label: 'Planejado' },
  IN_PROGRESS: { color: 'processing', label: 'Em Produção' },
  COMPLETED: { color: 'success', label: 'Concluído' },
  PAUSED: { color: 'warning', label: 'Pausado' },
  CANCELLED: { color: 'error', label: 'Cancelado' },
}

export default function ProductionPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Produção</Title>
          <Text style={{ color: '#64748b' }}>Ordens de produção e controle de usina</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
        >
          Nova Ordem
        </Button>
      </div>

      {/* KPIs de produção */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Produção Hoje', value: '892 ton', color: '#f59e0b' },
          { label: 'Ordens Ativas', value: '2', color: '#60a5fa' },
          { label: 'Meta do Dia', value: '1.000 ton', color: '#94a3b8' },
          { label: 'Atingido', value: '89,2%', color: '#22c55e' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f', textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 26, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabela de ordens */}
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table
          dataSource={orders}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Nº Ordem',
              dataIndex: 'number',
              render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text>,
            },
            {
              title: 'Produto',
              dataIndex: 'product',
              render: (v, r: any) => (
                <div>
                  <Text style={{ color: '#e2e8f0' }}>{v}</Text>
                  <br />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{r.formula}</Text>
                </div>
              ),
            },
            {
              title: 'Cliente',
              dataIndex: 'client',
              render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text>,
            },
            {
              title: 'Progresso',
              key: 'progress',
              render: (_, r: any) => {
                const pct = Math.round((r.produced / r.planned) * 100)
                return (
                  <div style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{r.produced}/{r.planned} ton</Text>
                      <Text style={{ color: '#f59e0b', fontSize: 12 }}>{pct}%</Text>
                    </div>
                    <Progress
                      percent={pct} showInfo={false} size="small"
                      strokeColor={pct === 100 ? '#22c55e' : '#f59e0b'}
                      trailColor="#1e3a5f"
                    />
                  </div>
                )
              },
            },
            {
              title: 'Temp.',
              dataIndex: 'temp',
              render: v => v
                ? <Text style={{ color: v > 160 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{v}°C</Text>
                : <Text style={{ color: '#475569' }}>—</Text>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: v => {
                const cfg = statusConfig[v] || { color: 'default', label: v }
                return <Badge status={cfg.color as any} text={<Text style={{ color: '#e2e8f0', fontSize: 12 }}>{cfg.label}</Text>} />
              },
            },
            {
              title: 'Data',
              dataIndex: 'scheduled',
              render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text>,
            },
            {
              title: 'Ações',
              key: 'actions',
              render: (_, r: any) => (
                <Space>
                  {r.status === 'PLANNED' && (
                    <Button size="small" icon={<PlayCircleOutlined />} type="primary" ghost>Iniciar</Button>
                  )}
                  {r.status === 'IN_PROGRESS' && (
                    <>
                      <Button size="small" icon={<PauseCircleOutlined />} ghost>Pausar</Button>
                      <Button size="small" icon={<CheckCircleOutlined />} style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost>Concluir</Button>
                    </>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal nova ordem */}
      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Nova Ordem de Produção</Text>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar</Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="product" label={<Text style={{ color: '#94a3b8' }}>Produto</Text>} required>
            <Select placeholder="Selecionar produto" options={[
              { value: 'cbuq-bc', label: 'CBUQ Binder Course' },
              { value: 'cbuq-cr', label: 'CBUQ Capa de Rolamento' },
              { value: 'pmf', label: 'PMF' },
            ]} />
          </Form.Item>
          <Form.Item name="formula" label={<Text style={{ color: '#94a3b8' }}>Traço / Fórmula</Text>} required>
            <Select placeholder="Selecionar traço" options={[
              { value: 'bc-01', label: 'Traço BC-01 (CAP 50/70)' },
              { value: 'cr-02', label: 'Traço CR-02 (CAP 30/45)' },
            ]} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="plannedQty" label={<Text style={{ color: '#94a3b8' }}>Qtd. Planejada (ton)</Text>} required>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduledDate" label={<Text style={{ color: '#94a3b8' }}>Data</Text>} required>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="salesOrder" label={<Text style={{ color: '#94a3b8' }}>Pedido de Venda (opcional)</Text>}>
            <Select placeholder="Selecionar pedido" allowClear options={[
              { value: 'op1234', label: 'OP00001234 — Prefeitura SP' },
              { value: 'op1235', label: 'OP00001235 — Construtora ABC' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
