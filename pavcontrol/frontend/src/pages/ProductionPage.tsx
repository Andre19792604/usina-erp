import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, InputNumber, Input, DatePicker, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { productionService, projectService, serviceService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusColors: Record<string, string> = { PENDENTE: 'default', EM_EXECUCAO: 'processing', CONCLUIDO: 'success' }
const statusLabels: Record<string, string> = { PENDENTE: 'Pendente', EM_EXECUCAO: 'Em Execução', CONCLUIDO: 'Concluído' }

export default function ProductionPage() {
  const [productions, setProductions] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await productionService.list()
      setProductions(data)
    } catch { message.error('Erro ao carregar produção') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    projectService.list().then(setProjects).catch(() => {})
    serviceService.list().then(setServices).catch(() => {})
  }, [])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await productionService.create({
        ...values,
        date: values.date?.toISOString() || new Date().toISOString(),
      })
      message.success('Produção registrada')
      setModal(false); form.resetFields(); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Produção Diária</Title>
          <Text style={{ color: '#64748b' }}>{productions.length} registros</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true) }}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
          Registrar Produção
        </Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={productions} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Data', dataIndex: 'date', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{dayjs(v).format('DD/MM/YYYY')}</Text> },
          { title: 'Obra', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.project?.name}</Text> },
          { title: 'Serviço', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.service?.name}</Text> },
          { title: 'Trecho', key: 'section', render: (_: any, r: any) => <Text style={{ color: '#64748b' }}>{r.sectionStart && r.sectionEnd ? `${r.sectionStart} → ${r.sectionEnd}` : '—'}</Text> },
          { title: 'Quantidade', dataIndex: 'quantity', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{Number(v).toLocaleString('pt-BR')}</Text> },
          { title: 'Temp.', dataIndex: 'temperature', render: (v: number) => <Text style={{ color: '#f59e0b' }}>{v ? `${v}°C` : '—'}</Text> },
          { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
          { title: 'Responsável', render: (_: any, r: any) => <Text style={{ color: '#64748b' }}>{r.user?.name}</Text> },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Registrar Produção</Text>}
        open={modal} onCancel={() => setModal(false)} width={640}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="date" label={<Text style={{ color: '#94a3b8' }}>Data</Text>}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="projectId" label={<Text style={{ color: '#94a3b8' }}>Obra</Text>} rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label"
                  options={projects.map(p => ({ value: p.id, label: p.name }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serviceId" label={<Text style={{ color: '#94a3b8' }}>Serviço</Text>} rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label"
                  options={services.map(s => ({ value: s.id, label: s.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name="sectionStart" label={<Text style={{ color: '#94a3b8' }}>Trecho Inicial</Text>}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="sectionEnd" label={<Text style={{ color: '#94a3b8' }}>Trecho Final</Text>}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantity" label={<Text style={{ color: '#94a3b8' }}>Quantidade</Text>} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.5} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="temperature" label={<Text style={{ color: '#94a3b8' }}>Temperatura</Text>}>
                <InputNumber style={{ width: '100%' }} suffix="°C" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="weather" label={<Text style={{ color: '#94a3b8' }}>Clima</Text>}>
                <Select options={[
                  { value: 'Sol', label: 'Sol' },
                  { value: 'Nublado', label: 'Nublado' },
                  { value: 'Chuva', label: 'Chuva' },
                  { value: 'Chuvisco', label: 'Chuvisco' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<Text style={{ color: '#94a3b8' }}>Status</Text>}>
                <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
