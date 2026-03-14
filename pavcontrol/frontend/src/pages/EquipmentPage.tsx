import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Input, Modal, Form, Row, Col, Select, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, ToolOutlined, DeleteOutlined } from '@ant-design/icons'
import { equipmentService } from '../services/api'

const { Title, Text } = Typography

const statusColors: Record<string, string> = { DISPONIVEL: 'success', EM_OPERACAO: 'processing', MANUTENCAO: 'warning', INATIVO: 'default' }
const statusLabels: Record<string, string> = { DISPONIVEL: 'Disponível', EM_OPERACAO: 'Em Operação', MANUTENCAO: 'Manutenção', INATIVO: 'Inativo' }

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setEquipment(await equipmentService.list({ search: search || undefined })) }
    catch { message.error('Erro ao carregar equipamentos') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => { setEditingId(r.id); form.setFieldsValue(r); setModal(true) }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) { await equipmentService.update(editingId, values); message.success('Equipamento atualizado') }
      else { await equipmentService.create(values); message.success('Equipamento criado') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Equipamentos</Title>
          <Text style={{ color: '#64748b' }}>{equipment.length} equipamentos cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Equipamento</Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Input prefix={<SearchOutlined style={{ color: '#475569' }} />} placeholder="Buscar equipamento..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 360, background: '#0f172a', border: '1px solid #334155' }} />
        <Table dataSource={equipment} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Equipamento', key: 'name',
            render: (_: any, r: any) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ToolOutlined style={{ color: '#f59e0b' }} />
                  <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</Text>
                </div>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{r.code}</Text>
              </div>
            ),
          },
          { title: 'Marca/Modelo', key: 'brand', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{[r.brand, r.model].filter(Boolean).join(' ') || '—'}</Text> },
          { title: 'Ano', dataIndex: 'year', render: (v: number) => <Text style={{ color: '#94a3b8' }}>{v || '—'}</Text> },
          { title: 'Nº Série', dataIndex: 'serialNumber', render: (v: string) => <Text style={{ color: '#64748b', fontFamily: 'monospace' }}>{v || '—'}</Text> },
          { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover equipamento?" onConfirm={async () => { await equipmentService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome</Text>} rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<Text style={{ color: '#94a3b8' }}>Status</Text>}>
                <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="brand" label={<Text style={{ color: '#94a3b8' }}>Marca</Text>}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="model" label={<Text style={{ color: '#94a3b8' }}>Modelo</Text>}><Input /></Form.Item></Col>
            <Col span={4}><Form.Item name="year" label={<Text style={{ color: '#94a3b8' }}>Ano</Text>}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="serialNumber" label={<Text style={{ color: '#94a3b8' }}>Número de Série</Text>}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
