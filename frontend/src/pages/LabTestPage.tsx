import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space,
  Modal, Form, Select, Input, InputNumber, Divider, Tooltip,
} from 'antd'
import { PlusOutlined, FilePdfOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { generateLabPDF } from '../utils/generateLabPDF'

const { Title, Text } = Typography

const tests = [
  {
    key: 1, number: 'LAB00000041', order: 'OP00001234', product: 'CBUQ BC',
    date: '10/03/2026', tech: 'Ana Souza',
    temp: 148, cap: 5.2, density: 2.38, vv: 4.1, vam: 16.2, rbv: 74.7, stability: 900, fluency: 3.2,
    approved: true,
  },
  {
    key: 2, number: 'LAB00000040', order: 'OP00001233', product: 'CBUQ CR',
    date: '09/03/2026', tech: 'Ana Souza',
    temp: 152, cap: 5.5, density: 2.35, vv: 5.8, vam: 17.1, rbv: 66.1, stability: 780, fluency: 3.8,
    approved: false,
  },
  {
    key: 3, number: 'LAB00000039', order: 'OP00001232', product: 'PMF',
    date: '08/03/2026', tech: 'Carlos Tech',
    temp: 140, cap: 4.8, density: 2.41, vv: 3.9, vam: 15.8, rbv: 75.3, stability: 950, fluency: 2.9,
    approved: true,
  },
]

// Limites normativos DNIT ES 031/2006 (CBUQ)
const limits = {
  vvMin: 3, vvMax: 5,
  vamMin: 15,
  rbvMin: 65, rbvMax: 75,
  stabilityMin: 500,
  fluencyMin: 2, fluencyMax: 4.5,
}

function CheckValue({ value, min, max }: { value: number; min?: number; max?: number }) {
  const ok = (min === undefined || value >= min) && (max === undefined || value <= max)
  return (
    <Space>
      <Text style={{ color: ok ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{value}</Text>
      {ok
        ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 12 }} />
        : <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
    </Space>
  )
}

export default function LabTestPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Controle Tecnológico — Laboratório</Title>
          <Text style={{ color: '#64748b' }}>Ensaios Marshall e controle de qualidade da massa asfáltica</Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
          >
            Novo Ensaio
          </Button>
        </Space>
      </div>

      {/* Resumo */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Ensaios no Mês', value: '41', color: '#60a5fa' },
          { label: 'Aprovados', value: '38', color: '#22c55e' },
          { label: 'Reprovados', value: '3', color: '#ef4444' },
          { label: 'Taxa de Aprovação', value: '92.7%', color: '#f59e0b' },
        ].map(item => (
          <Col key={item.label} xs={12} lg={6}>
            <Card style={{ border: '1px solid #1e3a5f', textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 26, fontWeight: 700 }}>{item.value}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Limites normativos referência */}
      <Card
        title={<Text style={{ color: '#e2e8f0' }}>Parâmetros Normativos — DNIT ES 031/2006 (CBUQ)</Text>}
        style={{ border: '1px solid #1e3a5f', marginBottom: 16 }}
        size="small"
      >
        <Row gutter={24}>
          {[
            { param: 'VV (%)', range: `${limits.vvMin} – ${limits.vvMax}` },
            { param: 'VAM (%)', range: `≥ ${limits.vamMin}` },
            { param: 'RBV (%)', range: `${limits.rbvMin} – ${limits.rbvMax}` },
            { param: 'Estab. (kgf)', range: `≥ ${limits.stabilityMin}` },
            { param: 'Fluência (mm)', range: `${limits.fluencyMin} – ${limits.fluencyMax}` },
          ].map(p => (
            <Col key={p.param}>
              <Text style={{ color: '#64748b', fontSize: 11, display: 'block' }}>{p.param}</Text>
              <Text style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>{p.range}</Text>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title={<Text style={{ color: '#e2e8f0' }}>Ensaios Realizados</Text>} style={{ border: '1px solid #1e3a5f' }}>
        <Table
          dataSource={tests}
          scroll={{ x: true }}
          columns={[
            { title: 'Nº', dataIndex: 'number', render: v => <Text style={{ color: '#60a5fa', fontSize: 12 }}>{v}</Text> },
            { title: 'Ordem', dataIndex: 'order', render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text> },
            { title: 'Produto', dataIndex: 'product', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
            { title: 'Data', dataIndex: 'date', render: v => <Text style={{ color: '#64748b', fontSize: 12 }}>{v}</Text> },
            { title: 'Temp.', dataIndex: 'temp', render: v => <Text style={{ color: '#f59e0b' }}>{v}°C</Text> },
            { title: '% CAP', dataIndex: 'cap', render: v => <CheckValue value={v} min={4.5} max={6} /> },
            { title: 'VV (%)', dataIndex: 'vv', render: v => <CheckValue value={v} min={limits.vvMin} max={limits.vvMax} /> },
            { title: 'VAM (%)', dataIndex: 'vam', render: v => <CheckValue value={v} min={limits.vamMin} /> },
            { title: 'RBV (%)', dataIndex: 'rbv', render: v => <CheckValue value={v} min={limits.rbvMin} max={limits.rbvMax} /> },
            { title: 'Estab.', dataIndex: 'stability', render: v => <CheckValue value={v} min={limits.stabilityMin} /> },
            { title: 'Fluência', dataIndex: 'fluency', render: v => <CheckValue value={v} min={limits.fluencyMin} max={limits.fluencyMax} /> },
            {
              title: 'Resultado',
              dataIndex: 'approved',
              render: v => v
                ? <Tag color="success" icon={<CheckCircleOutlined />}>APROVADO</Tag>
                : <Tag color="error" icon={<CloseCircleOutlined />}>REPROVADO</Tag>,
            },
            {
              title: 'PDF',
              key: 'pdf',
              render: (_: any, record: any) => (
                <Tooltip title="Gerar relatório PDF">
                  <Button
                    size="small"
                    icon={<FilePdfOutlined />}
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    ghost
                    onClick={() => generateLabPDF(record)}
                  >
                    PDF
                  </Button>
                </Tooltip>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Novo Ensaio Marshall</Text>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={620}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancelar</Button>,
          <Button key="save" type="primary" style={{ background: '#f59e0b', border: 'none' }}>Salvar Ensaio</Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="order" label={<Text style={{ color: '#94a3b8' }}>Ordem de Produção</Text>}>
                <Select options={[{ value: 'op1234', label: 'OP00001234' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tech" label={<Text style={{ color: '#94a3b8' }}>Laboratorista</Text>}>
                <Input placeholder="Nome" />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ borderColor: '#334155' }}>Parâmetros Marshall</Divider>
          <Row gutter={12}>
            {[
              { name: 'temperature', label: 'Temperatura (°C)' },
              { name: 'capContent', label: '% CAP' },
              { name: 'density', label: 'Densidade (g/cm³)' },
              { name: 'vv', label: 'VV (%)' },
              { name: 'vam', label: 'VAM (%)' },
              { name: 'rbv', label: 'RBV (%)' },
              { name: 'stability', label: 'Estabilidade (kgf)' },
              { name: 'fluency', label: 'Fluência (mm)' },
            ].map(f => (
              <Col span={12} key={f.name}>
                <Form.Item name={f.name} label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>{f.label}</Text>}>
                  <InputNumber style={{ width: '100%' }} step={0.1} />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
