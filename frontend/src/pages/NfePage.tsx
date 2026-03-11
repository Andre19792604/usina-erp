import { useState, useEffect, useRef } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Button, Space, Modal,
  Form, Input, InputNumber, Select, Divider, Tooltip,
  message, Statistic,
} from 'antd'
import {
  PlusOutlined, UploadOutlined, DownloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { nfeService, clientService } from '../services/api'

const { Title, Text } = Typography

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDENTE: { color: 'warning', label: 'Pendente' },
  EMITIDA: { color: 'success', label: 'Emitida' },
  CANCELADA: { color: 'error', label: 'Cancelada' },
  DENEGADA: { color: 'error', label: 'Denegada' },
  INUTILIZADA: { color: 'default', label: 'Inutilizada' },
}

export default function NfePage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const [cancelForm] = Form.useForm()
  const [xmlText, setXmlText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [inv, cl] = await Promise.all([nfeService.list(), clientService.list()])
      setInvoices(Array.isArray(inv) ? inv : [])
      setClients(Array.isArray(cl) ? cl : [])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(values: any) {
    setSaving(true)
    try {
      await nfeService.create(values)
      message.success('NF-e criada com sucesso.')
      setModalOpen(false)
      form.resetFields()
      loadData()
    } catch {
      message.error('Erro ao criar NF-e.')
    } finally {
      setSaving(false)
    }
  }

  async function handleImport() {
    if (!xmlText.trim()) { message.error('Cole o XML da NF-e.'); return }
    setSaving(true)
    try {
      const res = await nfeService.importXml(xmlText)
      message.success(`NF-e ${res.parsed?.nfeNumber} importada com sucesso.`)
      setImportOpen(false)
      setXmlText('')
      loadData()
    } catch {
      message.error('Erro ao importar XML.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFileRead(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setXmlText(text)
  }

  async function handleCancel(values: any) {
    if (!selected) return
    setSaving(true)
    try {
      await nfeService.updateStatus(selected.id, { status: 'CANCELADA', cancelReason: values.reason })
      message.success('NF-e cancelada.')
      setCancelOpen(false)
      setSelected(null)
      cancelForm.resetFields()
      loadData()
    } catch {
      message.error('Erro ao cancelar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEmit(id: string) {
    try {
      await nfeService.updateStatus(id, { status: 'EMITIDA', protocol: `PROT${Date.now()}` })
      message.success('NF-e marcada como emitida.')
      loadData()
    } catch {
      message.error('Erro ao emitir NF-e.')
    }
  }

  async function handleDownloadXml(id: string, number: string) {
    try {
      const blob = await nfeService.downloadXml(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NF-e_${number}.xml`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      message.error('XML não disponível para esta NF-e.')
    }
  }

  const totals = {
    total: invoices.length,
    emitidas: invoices.filter(i => i.status === 'EMITIDA').length,
    pendentes: invoices.filter(i => i.status === 'PENDENTE').length,
    canceladas: invoices.filter(i => i.status === 'CANCELADA').length,
    valorTotal: invoices
      .filter(i => i.status === 'EMITIDA')
      .reduce((acc, i) => acc + Number(i.totalNfe || 0), 0),
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>NF-e — Nota Fiscal Eletrônica</Title>
          <Text style={{ color: '#64748b' }}>Gestão de notas fiscais de saída e entrada</Text>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setImportOpen(true)}
            style={{ background: '#1e3a5f', border: 'none', color: '#e2e8f0' }}
          >
            Importar XML
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
          >
            Nova NF-e
          </Button>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total', value: totals.total, color: '#60a5fa' },
          { label: 'Emitidas', value: totals.emitidas, color: '#22c55e' },
          { label: 'Pendentes', value: totals.pendentes, color: '#f59e0b' },
          { label: 'Canceladas', value: totals.canceladas, color: '#ef4444' },
        ].map(k => (
          <Col key={k.label} xs={12} lg={4}>
            <Card style={{ border: '1px solid #1e3a5f', textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12, display: 'block' }}>{k.label}</Text>
              <Text style={{ color: k.color, fontSize: 26, fontWeight: 700 }}>{k.value}</Text>
            </Card>
          </Col>
        ))}
        <Col xs={24} lg={8}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 12 }}>Valor Total Emitido</Text>}
              value={totals.valorTotal}
              prefix="R$"
              precision={2}
              valueStyle={{ color: '#22c55e', fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          columns={[
            {
              title: 'Número', dataIndex: 'number',
              render: v => <Text style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 600 }}>{v}</Text>,
            },
            {
              title: 'Série', dataIndex: 'serie',
              render: v => <Text style={{ color: '#94a3b8' }}>{v}</Text>,
            },
            {
              title: 'Cliente',
              render: (_: any, r: any) => <Text style={{ color: '#e2e8f0' }}>{r.client?.name ?? '—'}</Text>,
            },
            {
              title: 'Natureza', dataIndex: 'nature',
              render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v}</Text>,
            },
            {
              title: 'Data Emissão', dataIndex: 'issueDate',
              render: v => <Text style={{ color: '#94a3b8', fontSize: 12 }}>{v ? dayjs(v).format('DD/MM/YYYY') : '—'}</Text>,
            },
            {
              title: 'Valor Total', dataIndex: 'totalNfe',
              render: v => (
                <Text style={{ color: '#f59e0b', fontWeight: 700 }}>
                  {Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
              ),
            },
            {
              title: 'Chave Acesso', dataIndex: 'chave',
              render: v => v
                ? <Tooltip title={v}><Text style={{ color: '#475569', fontSize: 10 }}>{v.slice(0, 20)}…</Text></Tooltip>
                : <Text style={{ color: '#334155' }}>—</Text>,
            },
            {
              title: 'Status', dataIndex: 'status',
              render: (v: string) => {
                const cfg = STATUS_CONFIG[v] || { color: 'default', label: v }
                return <Tag color={cfg.color}>{cfg.label}</Tag>
              },
            },
            {
              title: 'Ações',
              key: 'actions',
              fixed: 'right',
              render: (_: any, r: any) => (
                <Space>
                  {r.status === 'PENDENTE' && (
                    <Tooltip title="Marcar como Emitida">
                      <Button
                        size="small" icon={<CheckCircleOutlined />}
                        style={{ color: '#22c55e', borderColor: '#22c55e' }} ghost
                        onClick={() => handleEmit(r.id)}
                      />
                    </Tooltip>
                  )}
                  {r.status === 'EMITIDA' && (
                    <Tooltip title="Cancelar NF-e">
                      <Button
                        size="small" icon={<CloseCircleOutlined />}
                        style={{ color: '#ef4444', borderColor: '#ef4444' }} ghost
                        onClick={() => { setSelected(r); setCancelOpen(true) }}
                      />
                    </Tooltip>
                  )}
                  {r.xmlContent && (
                    <Tooltip title="Baixar XML">
                      <Button
                        size="small" icon={<DownloadOutlined />}
                        style={{ color: '#60a5fa', borderColor: '#60a5fa' }} ghost
                        onClick={() => handleDownloadXml(r.id, r.number)}
                      />
                    </Tooltip>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal: Nova NF-e */}
      <Modal
        title={<Text style={{ color: '#e2e8f0' }}>Nova NF-e</Text>}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        width={640}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancelar</Button>,
          <Button key="save" type="primary" loading={saving}
            style={{ background: '#f59e0b', border: 'none' }}
            onClick={() => form.submit()}>
            Salvar NF-e
          </Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="clientId" label={<Text style={{ color: '#94a3b8' }}>Cliente</Text>}
                rules={[{ required: true, message: 'Selecione o cliente' }]}>
                <Select
                  showSearch
                  placeholder="Buscar cliente..."
                  filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serie" label={<Text style={{ color: '#94a3b8' }}>Série</Text>} initialValue="001">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="nature" label={<Text style={{ color: '#94a3b8' }}>Natureza da Operação</Text>} initialValue="Venda de Mercadoria">
            <Input />
          </Form.Item>

          <Divider style={{ borderColor: '#334155' }}>Valores</Divider>

          <Row gutter={12}>
            {[
              { name: 'totalProducts', label: 'Valor Produtos' },
              { name: 'totalIcms', label: 'ICMS' },
              { name: 'totalIpi', label: 'IPI' },
              { name: 'totalPis', label: 'PIS' },
              { name: 'totalCofins', label: 'COFINS' },
              { name: 'totalNfe', label: 'Total NF-e', required: true },
            ].map(f => (
              <Col span={8} key={f.name}>
                <Form.Item
                  name={f.name}
                  label={<Text style={{ color: '#94a3b8', fontSize: 12 }}>{f.label}</Text>}
                  rules={f.required ? [{ required: true, message: 'Obrigatório' }] : []}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={2}
                    formatter={v => `R$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    min={0}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item name="notes" label={<Text style={{ color: '#94a3b8' }}>Observações</Text>}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Importar XML */}
      <Modal
        title={<Space><UploadOutlined style={{ color: '#60a5fa' }} /><Text style={{ color: '#e2e8f0' }}>Importar XML NF-e</Text></Space>}
        open={importOpen}
        onCancel={() => { setImportOpen(false); setXmlText('') }}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setImportOpen(false)}>Cancelar</Button>,
          <Button key="import" type="primary" loading={saving}
            style={{ background: '#f59e0b', border: 'none' }}
            onClick={handleImport}>
            Importar
          </Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => fileRef.current?.click()}
              style={{ background: '#1e3a5f', border: 'none', color: '#e2e8f0', marginRight: 8 }}
            >
              Selecionar arquivo XML
            </Button>
            <input ref={fileRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleFileRead} />
            <Text style={{ color: '#64748b', fontSize: 12 }}>ou cole o conteúdo abaixo</Text>
          </div>
          <Input.TextArea
            rows={14}
            value={xmlText}
            onChange={e => setXmlText(e.target.value)}
            placeholder='<?xml version="1.0" encoding="UTF-8"?><nfeProc ...'
            style={{ fontFamily: 'monospace', fontSize: 11, background: '#0f172a', color: '#22c55e', border: '1px solid #1e3a5f' }}
          />
          {xmlText && (
            <Text style={{ color: '#64748b', fontSize: 11, marginTop: 8, display: 'block' }}>
              {xmlText.length.toLocaleString('pt-BR')} caracteres carregados
            </Text>
          )}
        </div>
      </Modal>

      {/* Modal: Cancelar NF-e */}
      <Modal
        title={<Text style={{ color: '#ef4444' }}>Cancelar NF-e #{selected?.number}</Text>}
        open={cancelOpen}
        onCancel={() => { setCancelOpen(false); setSelected(null); cancelForm.resetFields() }}
        footer={[
          <Button key="back" onClick={() => setCancelOpen(false)}>Voltar</Button>,
          <Button key="confirm" danger loading={saving} onClick={() => cancelForm.submit()}>
            Confirmar Cancelamento
          </Button>,
        ]}
        style={{ background: '#1e293b' }}
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleCancel} style={{ marginTop: 16 }}>
          <Form.Item
            name="reason"
            label={<Text style={{ color: '#94a3b8' }}>Motivo do Cancelamento</Text>}
            rules={[{ required: true, message: 'Informe o motivo (mínimo 15 caracteres)' }, { min: 15, message: 'Mínimo 15 caracteres' }]}
          >
            <Input.TextArea rows={3} placeholder="Descreva o motivo do cancelamento..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
