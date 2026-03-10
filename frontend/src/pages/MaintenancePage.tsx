import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, Input, DatePicker, Tabs, Badge,
} from 'antd'
import { PlusOutlined, ToolOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const orders = [
  { key: 1, number: 'OS00000041', equipment: 'Tambor Secador', type: 'CORRECTIVE', status: 'IN_PROGRESS', desc: 'Substituição de rolamento dianteiro', tech: 'José Mecânico', opened: '09/03/2026', cost: 3200 },
  { key: 2, number: 'OS00000040', equipment: 'Correia Transportadora', type: 'CORRECTIVE', status: 'COMPLETED', desc: 'Troca de correia tensora', tech: 'José Mecânico', opened: '07/03/2026', cost: 1800 },
  { key: 3, number: 'OS00000039', equipment: 'Usina (Geral)', type: 'PREVENTIVE', status: 'OPEN', desc: 'Lubrificação preventiva mensal', tech: 'João Manut.', opened: '10/03/2026', cost: null },
  { key: 4, number: 'OS00000038', equipment: 'Balança Rodoviária', type: 'PREVENTIVE', status: 'COMPLETED', desc: 'Calibração semestral', tech: 'Técnico externo', opened: '01/03/2026', cost: 850 },
  { key: 5, number: 'OS00000037', equipment: 'Veículo ABC-1234', type: 'CORRECTIVE', status: 'OPEN', desc: 'Troca de óleo e filtros', tech: 'Pedro Auto', opened: '08/03/2026', cost: 450 },
]

const equipments = [
  { key: 1, code: 'EQ001', name: 'Tambor Secador', category: 'USINA', status: 'warning', lastMaint: '09/03/2026' },
  { key: 2, code: 'EQ002', name: 'Misturador (Pugmill)', category: 'USINA', status: 'success', lastMaint: '01/02/2026' },
  { key: 3, code: 'EQ003', name: 'Correia Transportadora', category: 'USINA', status: 'success', lastMaint: '07/03/2026' },
  { key: 4, code: 'EQ004', name: 'Balança Rodoviária', category: 'BALANCA', status: 'success', lastMaint: '01/03/2026' },
  { key: 5, code: 'VEI001', name: 'Truck ABC-1234', category: 'VEICULO', status: 'processing', lastMaint: '08/03/2026' },
]

const typeColors: Record<string, string> = { PREVENTIVE: 'blue', CORRECTIVE: 'orange', PREDICTIVE: 'purple' }
const typeLabels: Record<string, string> = { PREVENTIVE: 'Preventiva', CORRECTIVE: 'Corretiva', PREDICTIVE: 'Preditiva' }
const statusColors: Record<string, string> = { OPEN: 'blue', IN_PROGRESS: 'processing', COMPLETED: 'success', CANCELLED: 'error' }
const statusLabels: Record<string, string> = { OPEN: 'Aberta', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' }

export default function MaintenancePage() {
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const open = orders.filter(o => o.status !== 'COMPLETED').length
  const totalCost = orders.reduce((a, o) => a + (o.cost || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Manutenção</Title>
          <Text style={{ color: '#64748b' }}>Ordens de serviço e controle de equipamentos</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
          Nova OS
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'OS Abertas', value: String(open), color: '#ef4444' },
          { label: 'Em Andamento', value: String(orders.filter(o => o.status === 'IN_PROGRESS').length), color: '#f59e0b' },
          { label: 'Custo no Mês', value: `R$ ${totalCost.toLocaleString('pt-BR')}`, color: '#60a5fa' },
          { label: 'Equipamentos Ativos', value: String(equipments.length), color: '#22c55e' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs items={[
        {
          key: 'os',
          label: <Space><ToolOutlined /><Text style={{ color: '#e2e8f0' }}>Ordens de Serviço</Text></Space>,
          children: (
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Table dataSource={orders} size="small" columns={[
                { title: 'Nº OS', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
                { title: 'Equipamento', dataIndex: 'equipment', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Tipo', dataIndex: 'type', render: v => <Tag color={typeColors[v]}>{typeLabels[v]}</Tag> },
                { title: 'Descrição', dataIndex: 'desc', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
                { title: 'Técnico', dataIndex: 'tech', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
                { title: 'Abertura', dataIndex: 'opened', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                { title: 'Custo', dataIndex: 'cost', render: v => v ? <Text style={{ color: '#f59e0b' }}>R$ {v.toLocaleString('pt-BR')}</Text> : <Text style={{ color: '#475569' }}>—</Text> },
                { title: 'Status', dataIndex: 'status', render: v => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
                {
                  title: '', key: 'action',
                  render: (_, r: any) => r.status !== 'COMPLETED' && (
                    <Button size="small" icon={<CheckCircleOutlined />}
                      style={{ borderColor: '#22c55e', color: '#22c55e' }} ghost>Concluir</Button>
                  ),
                },
              ]} />
            </Card>
          ),
        },
        {
          key: 'equipment',
          label: <Space><WarningOutlined /><Text style={{ color: '#e2e8f0' }}>Equipamentos</Text></Space>,
          children: (
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Table dataSource={equipments} size="small" columns={[
                { title: 'Código', dataIndex: 'code', render: v => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v}</Text> },
                { title: 'Equipamento', dataIndex: 'name', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Categoria', dataIndex: 'category', render: v => <Tag color="blue">{v}</Tag> },
                {
                  title: 'Status', dataIndex: 'status',
                  render: v => <Badge status={v as any} text={<Text style={{ color: '#94a3b8', fontSize: 12 }}>{
                    v === 'success' ? 'Normal' : v === 'warning' ? 'Atenção' : 'Em Manutenção'
                  }</Text>} />,
                },
                { title: 'Última Manutenção', dataIndex: 'lastMaint', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
                {
                  title: '', key: 'action',
                  render: () => <Button size="small" ghost>Nova OS</Button>,
                },
              ]} />
            </Card>
          ),
        },
      ]} />

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Nova Ordem de Serviço</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Abrir OS</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>} required>
            <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="equipment" label={<Text style={{ color: '#94a3b8' }}>Equipamento / Veículo</Text>} required>
            <Select options={equipments.map(e => ({ value: e.key, label: `${e.code} — ${e.name}` }))} />
          </Form.Item>
          <Form.Item name="desc" label={<Text style={{ color: '#94a3b8' }}>Descrição do Serviço</Text>} required>
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
