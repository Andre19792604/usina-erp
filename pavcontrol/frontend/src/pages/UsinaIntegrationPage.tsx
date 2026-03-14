import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Typography, Modal, Form, Input, message, Table, Tag, Space, Popconfirm, Badge } from 'antd'
import { PlusOutlined, ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { usinaService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function UsinaIntegrationPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setIntegrations(await usinaService.list()) }
    catch { message.error('Erro ao carregar integrações') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditingId(null); form.resetFields(); setModal(true) }
  const openEdit = (r: any) => { setEditingId(r.id); form.setFieldsValue(r); setModal(true) }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingId) { await usinaService.update(editingId, values); message.success('Integração atualizada') }
      else { await usinaService.create(values); message.success('Integração criada') }
      setModal(false); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    try {
      const result = await usinaService.testConnection(id)
      if (result.success) {
        message.success(`Conexão OK! ${result.productsCount} produtos encontrados`)
      } else {
        message.error(`Falha: ${result.error}`)
      }
      load()
    } catch { message.error('Erro ao testar conexão') }
    finally { setTesting(null) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>
            <ApiOutlined style={{ color: '#10b981', marginRight: 8 }} />
            Integrações com Usinas
          </Title>
          <Text style={{ color: '#64748b' }}>Conecte-se a usinas de asfalto para solicitar material</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Nova Integração</Button>
      </div>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={integrations} rowKey="id" loading={loading} size="small" columns={[
          {
            title: 'Usina', key: 'name',
            render: (_: any, r: any) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge status={r.active ? 'success' : 'error'} />
                  <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</Text>
                </div>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{r.baseUrl}</Text>
              </div>
            ),
          },
          { title: 'API Key', dataIndex: 'apiKey', render: (v: string) => <Text style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>{v ? `${v.slice(0, 15)}...` : '—'}</Text> },
          { title: 'Último Sync', dataIndex: 'lastSyncAt', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v ? dayjs(v).format('DD/MM HH:mm') : 'Nunca'}</Text> },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Ativa' : 'Inativa'}</Tag> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => (
              <Space>
                <Button size="small" icon={<CheckCircleOutlined />} loading={testing === r.id}
                  onClick={() => handleTest(r.id)} style={{ color: '#10b981', borderColor: '#10b981' }}>Testar</Button>
                <Button size="small" icon={<EditOutlined />} ghost onClick={() => openEdit(r)}>Editar</Button>
                <Popconfirm title="Desativar integração?" onConfirm={async () => { await usinaService.remove(r.id); load() }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </Space>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>{editingId ? 'Editar Integração' : 'Nova Integração'}</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome da Usina</Text>} rules={[{ required: true }]}>
            <Input placeholder="Ex: Usina ABC Asfalto" />
          </Form.Item>
          <Form.Item name="baseUrl" label={<Text style={{ color: '#94a3b8' }}>URL da API</Text>} rules={[{ required: true }]}>
            <Input placeholder="http://usina.com:3001/api" />
          </Form.Item>
          <Form.Item name="apiKey" label={<Text style={{ color: '#94a3b8' }}>API Key</Text>} rules={[{ required: true }]}>
            <Input.Password placeholder="usina_xxxxxxxx..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
