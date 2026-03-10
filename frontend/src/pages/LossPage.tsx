import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, InputNumber, Input, Statistic, Alert,
} from 'antd'
import { PlusOutlined, AlertOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const losses = [
  { key: 1, date: '10/03/2026', order: 'OP00001234', qty: 2.4, reason: 'TEMPERATURA', temp: 165, desc: 'Temperatura acima do limite — massa descartada', materials: [{ name: 'CAP 50/70', qty: 0.12 }, { name: 'Brita 0', qty: 1.44 }] },
  { key: 2, date: '10/03/2026', order: 'OP00001234', qty: 1.8, reason: 'TEMPERATURA', temp: 172, desc: 'Superaquecimento no tambor — descarte preventivo', materials: [{ name: 'CAP 50/70', qty: 0.09 }, { name: 'Brita 1', qty: 1.08 }] },
  { key: 3, date: '09/03/2026', order: 'OP00001233', qty: 3.2, reason: 'EQUIPAMENTO', temp: null, desc: 'Falha na correia transportadora', materials: [{ name: 'CAP 30/45', qty: 0.16 }, { name: 'Pó de pedra', qty: 0.96 }] },
]

const reasonColors: Record<string, string> = {
  TEMPERATURA: 'red',
  UMIDADE: 'blue',
  CONTAMINACAO: 'orange',
  EQUIPAMENTO: 'purple',
  OUTRO: 'default',
}

const reasonLabels: Record<string, string> = {
  TEMPERATURA: 'Temperatura',
  UMIDADE: 'Umidade',
  CONTAMINACAO: 'Contaminação',
  EQUIPAMENTO: 'Equipamento',
  OUTRO: 'Outro',
}

export default function LossPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Registro de Perdas Operacionais</Title>
          <Text style={{ color: '#64748b' }}>Descartes por temperatura, umidade, contaminação ou equipamento</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: '#ef4444', border: 'none' }}
        >
          Registrar Perda
        </Button>
      </div>

      <Alert
        icon={<AlertOutlined />}
        message="Ao registrar uma perda, o sistema calcula automaticamente o consumo de materiais com base no traço da ordem de produção e atualiza o estoque da usina."
        type="warning"
        showIcon
        style={{ marginBottom: 16, background: '#2a1f0d', border: '1px solid #92400e' }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Perdas Hoje', value: 4.2, suffix: 'ton', color: '#ef4444' },
          { label: 'Perdas no Mês', value: 42.8, suffix: 'ton', color: '#f59e0b' },
          { label: 'Custo das Perdas (Mês)', value: 'R$ 8.540', suffix: '', color: '#ef4444' },
          { label: 'Ocorrências Hoje', value: 2, suffix: '', color: '#f59e0b' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Statistic
                title={<Text style={{ color: '#64748b', fontSize: 12 }}>{item.label}</Text>}
                value={typeof item.value === 'number' ? item.value : undefined}
                formatter={item.value === 'R$ 8.540' ? () => 'R$ 8.540' : undefined}
                suffix={item.suffix}
                valueStyle={{ color: item.color, fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<Text style={{ color: '#e2e8f0' }}>Histórico de Perdas</Text>} style={{ border: '1px solid #1e3a5f' }}>
        <Table
          dataSource={losses}
          columns={[
            { title: 'Data', dataIndex: 'date', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
            { title: 'Ordem', dataIndex: 'order', render: v => <Text style={{ color: '#60a5fa', fontWeight: 600 }}>{v}</Text> },
            { title: 'Qtd. Descartada', dataIndex: 'qty', render: v => <Text style={{ color: '#ef4444', fontWeight: 700 }}>{v} ton</Text> },
            {
              title: 'Motivo',
              dataIndex: 'reason',
              render: v => <Tag color={reasonColors[v]}>{reasonLabels[v]}</Tag>,
            },
            {
              title: 'Temperatura',
              dataIndex: 'temp',
              render: v => v
                ? <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{v}°C</Text>
                : <Text style={{ color: '#475569' }}>—</Text>,
            },
            { title: 'Descrição', dataIndex: 'desc', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
            {
              title: 'Consumo de Materiais',
              dataIndex: 'materials',
              render: (mats: any[]) => (
                <Space direction="vertical" size={2}>
                  {mats.map(m => (
                    <Text key={m.name} style={{ color: '#64748b', fontSize: 11 }}>
                      {m.name}: <span style={{ color: '#ef4444' }}>{m.qty} ton</span>
                    </Text>
                  ))}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Registrar Perda Operacional</Text>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancelar</Button>,
          <Button key="save" danger type="primary">Registrar Perda</Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="productionOrder" label={<Text style={{ color: '#94a3b8' }}>Ordem de Produção</Text>} required>
            <Select options={[
              { value: 'op1234', label: 'OP00001234 — CBUQ Binder Course' },
              { value: 'op1235', label: 'OP00001235 — CBUQ Capa Rolamento' },
            ]} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="qty" label={<Text style={{ color: '#94a3b8' }}>Quantidade Descartada (ton)</Text>} required>
                <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="temperature" label={<Text style={{ color: '#94a3b8' }}>Temperatura (°C)</Text>}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="reason" label={<Text style={{ color: '#94a3b8' }}>Motivo</Text>} required>
            <Select options={Object.entries(reasonLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ color: '#94a3b8' }}>Descrição</Text>}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Alert
            message="O sistema calculará automaticamente o consumo de materiais com base no traço da ordem selecionada."
            type="info"
            showIcon
            style={{ background: '#162032', border: '1px solid #1e3a5f' }}
          />
        </Form>
      </Modal>
    </div>
  )
}
