import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Typography, Table, Tag, Modal, Form, Input, Select, message, Popconfirm, Space, Alert } from 'antd'
import { PlusOutlined, ApiOutlined, CopyOutlined, StopOutlined } from '@ant-design/icons'
import { integrationService, clientService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export default function IntegrationPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setKeys(await integrationService.listKeys()) }
    catch { message.error('Erro ao carregar chaves') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { clientService.list().then(setClients).catch(() => {}) }, [])

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const result = await integrationService.createKey(values)
      setNewKey(result.apiKey)
      message.success('Chave criada com sucesso')
      form.resetFields()
      load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao criar chave') }
    finally { setSaving(false) }
  }

  const handleRevoke = async (id: string) => {
    try { await integrationService.revokeKey(id); message.success('Chave revogada'); load() }
    catch { message.error('Erro ao revogar') }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    message.success('API key copiada!')
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>
            <ApiOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
            Integrações API
          </Title>
          <Text style={{ color: '#64748b' }}>Gerencie chaves de API para sistemas externos (PavControl)</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNewKey(null); setModal(true) }}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>Nova Chave API</Button>
      </div>

      {newKey && (
        <Alert
          type="success"
          message="Chave API criada!"
          description={
            <div>
              <Paragraph style={{ color: '#e2e8f0', marginBottom: 8 }}>
                Copie esta chave agora. Ela não será exibida novamente por completo.
              </Paragraph>
              <Space>
                <Text code copyable style={{ fontSize: 12 }}>{newKey}</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={() => copyKey(newKey)}>Copiar</Button>
              </Space>
            </div>
          }
          closable
          onClose={() => setNewKey(null)}
          style={{ marginBottom: 16, background: '#0a2a15', border: '1px solid #22c55e' }}
        />
      )}

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={keys} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Nome', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</Text> },
          { title: 'Cliente Vinculado', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.client?.name || 'Nenhum'}</Text> },
          { title: 'API Key', dataIndex: 'apiKey', render: (v: string) => (
            <Space>
              <Text style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>{v.slice(0, 20)}...</Text>
              <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyKey(v)} style={{ color: '#64748b' }} />
            </Space>
          )},
          { title: 'Último Uso', dataIndex: 'lastUsedAt', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v ? dayjs(v).format('DD/MM HH:mm') : 'Nunca'}</Text> },
          { title: 'Status', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'success' : 'error'}>{v ? 'Ativa' : 'Revogada'}</Tag> },
          { title: 'Criada', dataIndex: 'createdAt', render: (v: string) => <Text style={{ color: '#64748b' }}>{dayjs(v).format('DD/MM/YYYY')}</Text> },
          {
            title: '', key: 'action',
            render: (_: any, r: any) => r.active ? (
              <Popconfirm title="Revogar esta chave?" onConfirm={() => handleRevoke(r.id)}>
                <Button size="small" icon={<StopOutlined />} danger ghost>Revogar</Button>
              </Popconfirm>
            ) : null,
          },
        ]} />
      </Card>

      <Card style={{ border: '1px solid #1e3a5f', marginTop: 16 }}>
        <Title level={5} style={{ color: '#e2e8f0' }}>Endpoints Disponíveis</Title>
        <Text style={{ color: '#64748b', fontSize: 13 }}>Sistemas externos autenticados com API key podem acessar:</Text>
        <div style={{ marginTop: 12 }}>
          <Table size="small" pagination={false} dataSource={[
            { method: 'GET', endpoint: '/api/integration/catalog', desc: 'Catálogo de produtos disponíveis' },
            { method: 'POST', endpoint: '/api/integration/orders', desc: 'Criar pedido de material' },
            { method: 'GET', endpoint: '/api/integration/orders', desc: 'Listar pedidos do cliente' },
            { method: 'GET', endpoint: '/api/integration/orders/:id', desc: 'Detalhes do pedido + pesagens' },
          ]} rowKey="endpoint" columns={[
            { title: 'Método', dataIndex: 'method', render: (v: string) => <Tag color={v === 'GET' ? 'blue' : 'green'}>{v}</Tag>, width: 80 },
            { title: 'Endpoint', dataIndex: 'endpoint', render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
            { title: 'Descrição', dataIndex: 'desc', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{v}</Text> },
          ]} />
        </div>
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Nova Chave API</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleCreate} style={{ background: '#f59e0b', border: 'none' }}>Gerar Chave</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>Nome do Sistema/Empresa</Text>} rules={[{ required: true }]}>
            <Input placeholder="Ex: PavControl - Construtora ABC" />
          </Form.Item>
          <Form.Item name="clientId" label={<Text style={{ color: '#94a3b8' }}>Vincular a Cliente (opcional)</Text>}>
            <Select allowClear showSearch optionFilterProp="label" placeholder="Selecione um cliente"
              options={clients.map((c: any) => ({ value: c.id, label: `${c.name} — ${c.cnpjCpf}` }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
