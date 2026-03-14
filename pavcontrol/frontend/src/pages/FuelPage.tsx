import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Typography, Tag, Modal, Form, Row, Col, Select, InputNumber, Input, DatePicker, message, Statistic } from 'antd'
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { fuelService, vehicleService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const fuelColors: Record<string, string> = { DIESEL: 'blue', GASOLINA: 'green', ETANOL: 'purple', GNV: 'orange' }

export default function FuelPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setLoading(true); setLogs(await fuelService.list()) }
    catch { message.error('Erro ao carregar abastecimentos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { vehicleService.list().then(setVehicles).catch(() => {}) }, [])

  const totalLiters = logs.reduce((s, l) => s + Number(l.liters), 0)
  const totalCost = logs.reduce((s, l) => s + Number(l.totalCost || 0), 0)

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await fuelService.create({ ...values, date: values.date?.toISOString() })
      message.success('Abastecimento registrado')
      setModal(false); form.resetFields(); load()
    } catch (err: any) { if (err?.errorFields) return; message.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Combustível</Title>
          <Text style={{ color: '#64748b' }}>{logs.length} abastecimentos</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true) }}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>Novo Abastecimento</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            <Statistic title={<Text style={{ color: '#64748b' }}>Total Litros</Text>} value={totalLiters.toFixed(1)} suffix="L"
              valueStyle={{ color: '#10b981', fontWeight: 700 }} prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            <Statistic title={<Text style={{ color: '#64748b' }}>Custo Total</Text>} value={totalCost.toFixed(2)} prefix="R$"
              valueStyle={{ color: '#ef4444', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ border: '1px solid #1e3a5f' }}>
            <Statistic title={<Text style={{ color: '#64748b' }}>Registros</Text>} value={logs.length}
              valueStyle={{ color: '#60a5fa', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ border: '1px solid #1e3a5f' }}>
        <Table dataSource={logs} rowKey="id" loading={loading} size="small" columns={[
          { title: 'Data', dataIndex: 'date', render: (v: string) => <Text style={{ color: '#94a3b8' }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</Text> },
          { title: 'Veículo', render: (_: any, r: any) => <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.vehicle?.plate}</Text> },
          { title: 'Tipo', dataIndex: 'fuelType', render: (v: string) => <Tag color={fuelColors[v]}>{v}</Tag> },
          { title: 'Litros', dataIndex: 'liters', render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600 }}>{Number(v).toLocaleString('pt-BR')} L</Text> },
          { title: 'R$/L', dataIndex: 'pricePerLiter', render: (v: number) => <Text style={{ color: '#94a3b8' }}>{v ? `R$ ${Number(v).toFixed(2)}` : '—'}</Text> },
          { title: 'Total', dataIndex: 'totalCost', render: (v: number) => <Text style={{ color: '#ef4444', fontWeight: 600 }}>{v ? `R$ ${Number(v).toLocaleString('pt-BR')}` : '—'}</Text> },
          { title: 'KM', dataIndex: 'kmAtFuel', render: (v: number) => <Text style={{ color: '#64748b' }}>{v ? Number(v).toLocaleString() : '—'}</Text> },
        ]} />
      </Card>

      <Modal title={<Text style={{ color: '#e2e8f0' }}>Novo Abastecimento</Text>}
        open={modal} onCancel={() => setModal(false)}
        footer={[
          <Button key="c" onClick={() => setModal(false)}>Cancelar</Button>,
          <Button key="s" type="primary" loading={saving} onClick={handleSave} style={{ background: '#10b981', border: 'none' }}>Salvar</Button>,
        ]}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="vehicleId" label={<Text style={{ color: '#94a3b8' }}>Veículo</Text>} rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label"
                  options={vehicles.map(v => ({ value: v.id, label: `${v.plate} - ${v.brand || ''} ${v.model || ''}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label={<Text style={{ color: '#94a3b8' }}>Data</Text>}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="fuelType" label={<Text style={{ color: '#94a3b8' }}>Tipo</Text>}>
                <Select options={[
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'GASOLINA', label: 'Gasolina' },
                  { value: 'ETANOL', label: 'Etanol' },
                  { value: 'GNV', label: 'GNV' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="liters" label={<Text style={{ color: '#94a3b8' }}>Litros</Text>} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.5} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pricePerLiter" label={<Text style={{ color: '#94a3b8' }}>R$/Litro</Text>}>
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="kmAtFuel" label={<Text style={{ color: '#94a3b8' }}>KM Atual</Text>}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="supplier" label={<Text style={{ color: '#94a3b8' }}>Posto/Fornecedor</Text>}>
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
