import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Input, Modal, Form, Row, Col, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { serviceService } from '../services/api'

const { Title, Text } = Typography

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setServices(await serviceService.list()) }
    catch { message.error('Erro ao carregar serviços') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => { setEditingId(r.id); form.setFieldsValue(r); setModal(true) }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) { await serviceService.update(editingId, values); message.success('Serviço atualizado') }
      else { await serviceService.create(values); message.success('Serviço criado') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Serviços</Title>
          <Text style={{ color: '#64748b' }}>{services.length} serviços cadastrados</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Serviço</Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={services} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Código', dataIndex: 'code', render: (v: string) => <Text style={{ color: '#64748b', fontFamily: 'monospace' }}>{v}</Text> },
          { title: 'Nome', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</Text> },
          { title: 'Unidade', dataIndex: 'unit', render: (v: string) => <Text style={{ color: '#10b981' }}>{v}</Text> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Remover serviço?" onConfirm={async () => { await serviceService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </span>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome do Serviço</Text>} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label={<Text style={{ color: '#94a3b8' }}>Unidade</Text>}>
                <Select options={[
                  { value: 'TON', label: 'Tonelada (TON)' },
                  { value: 'M2', label: 'Metro² (M2)' },
                  { value: 'M3', label: 'Metro³ (M3)' },
                  { value: 'ML', label: 'Metro Linear (ML)' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
