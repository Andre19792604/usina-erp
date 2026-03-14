import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, DatePicker, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ProjectOutlined } from '@ant-design/icons'
import { projectService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusColors: Record<string, string> = {
  PLANEJAMENTO: 'default', EM_ANDAMENTO: 'processing', PAUSADO: 'warning', CONCLUIDO: 'success', CANCELADO: 'error',
}
const statusLabels: Record<string, string> = {
  PLANEJAMENTO: 'Planejamento', EM_ANDAMENTO: 'Em Andamento', PAUSADO: 'Pausado', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.list({ search: search || undefined })
      setProjects(data)
    } catch { message.error('Erro ao carregar obras') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => {
    setEditingId(r.id)
    form.setFieldsValue({
      ...r,
      startDate: r.startDate ? dayjs(r.startDate) : null,
      endDate: r.endDate ? dayjs(r.endDate) : null,
      totalArea: r.totalArea ? Number(r.totalArea) : null,
    })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      }
      if (editingId) { await projectService.update(editingId, data); message.success('Obra atualizada') }
      else { await projectService.create(data); message.success('Obra criada') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar obra') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try { await projectService.remove(id); message.success('Obra removida'); load() }
    catch { message.error('Erro ao remover obra') }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Obras</Title>
          <Text style={{ color: '#64748b' }}>{projects.length} obras cadastradas</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
          Nova Obra
        </Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar obra, código ou cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={projects} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Obra', key: 'name',
            render: (_: any, r: any) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ProjectOutlined style={{ color: '#10b981' }} />
                  <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</Text>
                </div>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{r.code}</Text>
              </div>
            ),
          },
          { title: 'Cliente', dataIndex: 'client', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v || '—'}</Text> },
          { title: 'Cidade', key: 'city', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.city ? `${r.city}/${r.state}` : '—'}</Text> },
          { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
          { title: 'Área (m²)', dataIndex: 'totalArea', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{v ? Number(v).toLocaleString('pt-BR') : '—'}</Text> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover obra?" onConfirm={() => handleDelete(r.id)} okText="Sim" cancelText="Não">
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Obra' : 'Nova Obra'}</Text>}
        open={modal} onCancel={() => setModal(false)} width={640}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome da Obra</Text>} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label={<Text style={{ color: '#94a3b8' }}>Status</Text>}>
                <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="client" label={<Text style={{ color: '#94a3b8' }}>Cliente</Text>}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label={<Text style={{ color: '#94a3b8' }}>Endereço</Text>}><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="city" label={<Text style={{ color: '#94a3b8' }}>Cidade</Text>}><Input /></Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="state" label={<Text style={{ color: '#94a3b8' }}>UF</Text>}><Input maxLength={2} /></Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="startDate" label={<Text style={{ color: '#94a3b8' }}>Início</Text>}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="endDate" label={<Text style={{ color: '#94a3b8' }}>Previsão Fim</Text>}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="totalArea" label={<Text style={{ color: '#94a3b8' }}>Área Total (m²)</Text>}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ color: '#94a3b8' }}>Descrição</Text>}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
