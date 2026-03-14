import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Modal, Form, Row, Col, Select, Input, DatePicker, message, Popconfirm } from 'antd'
import { PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { reportService, projectService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setReports(await reportService.list()) }
    catch { message.error('Erro ao carregar relatórios') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { projectService.list().then(setProjects).catch(() => {}) }, [])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => {
    setEditingId(r.id)
    form.setFieldsValue({ ...r, date: r.date ? dayjs(r.date) : null })
    setModal(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const data = { ...values, date: values.date?.toISOString() }
      if (editingId) { await reportService.update(editingId, data); message.success('Relatório atualizado') }
      else { await reportService.create(data); message.success('Relatório criado') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Relatórios Diários</Title>
          <Text style={{ color: '#64748b' }}>{reports.length} relatórios</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Relatório</Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={reports} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Data', dataIndex: 'date', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{dayjs(v).format('DD/MM/YYYY')}</Text> },
          {
            title: 'Obra', render: (_: any, r: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#10b981' }} />
                <Text style={{ color: '#e2e8f0' }}>{r.project?.name}</Text>
              </div>
            ),
          },
          { title: 'Clima', dataIndex: 'weather', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v || '—'}</Text> },
          { title: 'Resumo', dataIndex: 'summary', render: (v: string) => <Text style={{ color: '#64748b' }} ellipsis={{ tooltip: true }}>{v || '—'}</Text> },
          { title: 'Autor', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.user?.name}</Text> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover relatório?" onConfirm={async () => { await reportService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Relatório' : 'Novo Relatório'}</Text>}
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
              <Form.Item name="weather" label={<Text style={{ color: '#94a3b8' }}>Clima</Text>}>
                <Select options={[
                  { value: 'Sol', label: 'Sol' },
                  { value: 'Nublado', label: 'Nublado' },
                  { value: 'Chuva', label: 'Chuva' },
                  { value: 'Chuvisco', label: 'Chuvisco' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="summary" label={<Text style={{ color: '#94a3b8' }}>Resumo do Dia</Text>}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="incidents" label={<Text style={{ color: '#94a3b8' }}>Ocorrências</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="observations" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
