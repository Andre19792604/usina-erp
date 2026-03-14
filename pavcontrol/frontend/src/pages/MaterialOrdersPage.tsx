import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, InputNumber, DatePicker, Input, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, SendOutlined, SyncOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { materialOrderService, usinaService, projectService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusColors: Record<string, string> = {
  RASCUNHO: 'default', ENVIADO: 'processing', ACEITO: 'blue',
  EM_PRODUCAO: 'orange', PRONTO: 'cyan', ENTREGANDO: 'purple',
  ENTREGUE: 'success', CANCELADO: 'error',
}
const statusLabels: Record<string, string> = {
  RASCUNHO: 'Rascunho', ENVIADO: 'Enviado', ACEITO: 'Aceito',
  EM_PRODUCAO: 'Em Produção', PRONTO: 'Pronto', ENTREGANDO: 'Entregando',
  ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
}

export default function MaterialOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [catalog, setCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [selectedUsina, setSelectedUsina] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setOrders(await materialOrderService.list()) }
    catch { message.error('Erro ao carregar pedidos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    usinaService.list().then(setIntegrations).catch(() => {})
    projectService.list().then(setProjects).catch(() => {})
  }, [])

  const loadCatalog = async (usinaId: string) => {
    setSelectedUsina(usinaId)
    try {
      const data = await usinaService.fetchCatalog(usinaId)
      setCatalog(data)
    } catch { message.error('Erro ao carregar catálogo da usina') }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const items = (values.items || []).map((item: any) => {
        const product = catalog.find(p => p.id === item.usinaProductId)
        return {
          usinaProductId: item.usinaProductId,
          productName: product?.name || '',
          productType: product?.type || '',
          quantity: item.quantity,
          unitPrice: product?.unitPrice ? Number(product.unitPrice) : null,
          total: product?.unitPrice ? Number(product.unitPrice) * item.quantity : null,
        }
      })
      await materialOrderService.create({
        ...values,
        items,
        deliveryDate: values.deliveryDate?.toISOString(),
      })
      message.success('Pedido criado')
      setModal(false); form.resetFields(); setCatalog([]); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleSend = async (id: string) => {
    try {
      const result = await materialOrderService.send(id)
      message.success(`Pedido enviado! Número na usina: ${result.usinaOrderNumber}`)
      load()
    } catch (err: any) { message.error(err.response?.data?.error || 'Erro ao enviar pedido') }
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      const result = await materialOrderService.sync(id)
      message.success(`Status sincronizado: ${statusLabels[result.pavcontrolStatus] || result.pavcontrolStatus}`)
      load()
    } catch (err: any) { message.error(err.response?.data?.error || 'Erro ao sincronizar') }
    finally { setSyncing(null) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>
            <ShoppingCartOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
            Pedidos de Material
          </Title>
          <Text style={{ color: '#64748b' }}>Solicite asfalto e materiais das usinas conectadas</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCatalog([]); setSelectedUsina(null); setModal(true) }}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
          disabled={integrations.filter(i => i.active).length === 0}>
          Novo Pedido
        </Button>
      </div>

      {integrations.filter(i => i.active).length === 0 && (
        <Card style={{ border: '1px solid #f59e0b', marginBottom: 16, background: '#1a1500' }}>
          <Text style={{ color: '#f59e0b' }}>Configure uma integração com a usina primeiro em "Integrações com Usinas".</Text>
        </Card>
      )}

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={orders} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Código', dataIndex: 'code', render: (v: string) => <Text style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>{v}</Text> },
          { title: 'Usina', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.usinaIntegration?.name}</Text> },
          { title: 'Obra', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.project?.name}</Text> },
          { title: 'Nº Usina', dataIndex: 'usinaOrderNumber', render: (v: string) => <Text style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{v || '—'}</Text> },
          { title: 'Itens', render: (_: any, r: any) => <Text style={{ color: '#94a3b8' }}>{r.items?.length || 0} produtos</Text> },
          { title: 'Total', dataIndex: 'totalAmount', render: (v: number) => <Text style={{ color: '#f59e0b', fontWeight: 600 }}>{v ? `R$ ${Number(v).toLocaleString('pt-BR')}` : '—'}</Text> },
          { title: 'Status', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
          { title: 'Data', dataIndex: 'createdAt', render: (v: string) => <Text style={{ color: '#64748b' }}>{dayjs(v).format('DD/MM HH:mm')}</Text> },
          {
            title: '', key: 'action', width: 200,
            render: (_: any, r: any) => (
              <Space>
                {r.status === 'RASCUNHO' && (
                  <Popconfirm title="Enviar pedido para a usina?" onConfirm={() => handleSend(r.id)}>
                    <Button size="small" icon={<SendOutlined />} style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>Enviar</Button>
                  </Popconfirm>
                )}
                {r.usinaOrderId && r.status !== 'ENTREGUE' && r.status !== 'CANCELADO' && (
                  <Button size="small" icon={<SyncOutlined />} loading={syncing === r.id}
                    onClick={() => handleSync(r.id)} ghost>Sincronizar</Button>
                )}
              </Space>
            ),
          },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Pedido de Material</Text>}
        open={modal} onCancel={() => setModal(false)} width={700}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave}
            style={{ background: '#f59e0b', border: 'none' }} disabled={catalog.length === 0}>Criar Pedido</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="usinaIntegrationId" label={<Text style={{ color: '#94a3b8' }}>Usina</Text>} rules={[{ required: true }]}>
                <Select placeholder="Selecione a usina" onChange={loadCatalog}
                  options={integrations.filter(i => i.active).map(i => ({ value: i.id, label: i.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="projectId" label={<Text style={{ color: '#94a3b8' }}>Obra</Text>} rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label"
                  options={projects.map(p => ({ value: p.id, label: p.name }))} />
              </Form.Item>
            </Col>
          </Row>

          {catalog.length > 0 && (
            <Card size="small" style={{ border: '1px solid #1e3a5f', marginBottom: 16 }}>
              <Text style={{ color: '#10b981', fontWeight: 600 }}>Catálogo da Usina — {catalog.length} produtos disponíveis</Text>
            </Card>
          )}

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row gutter={12} key={key} style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      <Form.Item {...rest} name={[name, 'usinaProductId']} rules={[{ required: true, message: 'Produto obrigatório' }]}>
                        <Select placeholder="Produto" showSearch optionFilterProp="label"
                          options={catalog.map(p => ({ value: p.id, label: `${p.name} (${p.type}) — R$ ${Number(p.unitPrice).toFixed(2)}/ton` }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'quantity']} rules={[{ required: true, message: 'Quantidade' }]}>
                        <InputNumber placeholder="Quantidade (ton)" style={{ width: '100%' }} step={0.5} min={0.1} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button danger onClick={() => remove(name)} style={{ width: '100%' }}>Remover</Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}
                  disabled={catalog.length === 0} style={{ marginBottom: 16 }}>
                  Adicionar Produto
                </Button>
              </>
            )}
          </Form.List>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="deliveryDate" label={<Text style={{ color: '#94a3b8' }}>Data Entrega</Text>}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="deliveryAddress" label={<Text style={{ color: '#94a3b8' }}>Endereço de Entrega</Text>}>
                <Input />
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
