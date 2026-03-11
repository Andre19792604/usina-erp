import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Button, Space, Alert, Progress, Spin } from 'antd'
import { WarningOutlined, ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons'
import { materialService } from '../services/api'

const { Title, Text } = Typography

const categoryColors: Record<string, string> = {
  CAP: 'volcano', AGREGADO_GRAU: 'geekblue', PO_PEDRA: 'cyan',
  PEDRISCO: 'blue', CAL: 'lime', OLEO_BPF: 'purple', DIESEL: 'orange',
  AREIA: 'gold', AGREGADO: 'geekblue',
}

const movTypeLabel: Record<string, string> = {
  ENTRADA_COMPRA: 'Entrada Compra', SAIDA_PRODUCAO: 'Saída Produção',
  AJUSTE_POSITIVO: 'Ajuste +', AJUSTE_NEGATIVO: 'Ajuste -', PERDA: 'Perda',
}

export default function StockPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMat, setSelectedMat] = useState<string | null>(null)
  const [movLoading, setMovLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await materialService.list()
      setMaterials(data)
    } finally {
      setLoading(false)
    }
  }

  const loadMovements = async (id: string) => {
    try {
      setMovLoading(true)
      const data = await materialService.movements(id)
      setMovements(data)
    } catch {
      setMovements([])
    } finally {
      setMovLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const lowStock = materials.filter((m: any) => Number(m.currentStock) < Number(m.minStock))
  const totalValue = materials.reduce((sum: number, m: any) =>
    sum + Number(m.currentStock || 0) * Number(m.unitCost || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Estoque da Usina</Title>
          <Text style={{ color: '#64748b' }}>Valor total: <strong style={{ color: '#f59e0b' }}>R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong></Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ background: '#162032', border: '1px solid #334155', color: '#94a3b8' }} />
          <Button icon={<ArrowUpOutlined />} style={{ background: '#0d2a1f', border: '1px solid #22c55e', color: '#22c55e' }}>Entrada</Button>
          <Button icon={<ArrowDownOutlined />} style={{ background: '#2a1515', border: '1px solid #ef4444', color: '#ef4444' }}>Ajuste</Button>
        </Space>
      </div>

      {lowStock.length > 0 && (
        <Alert icon={<WarningOutlined />}
          message={`${lowStock.length} material(is) abaixo do mínimo: ${lowStock.map((m: any) => m.name).join(', ')}`}
          type="warning" showIcon
          style={{ marginBottom: 16, background: '#2a1f0d', border: '1px solid #92400e' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={selectedMat ? 14 : 24}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Posição do Estoque</Text>} style={{ border: '1px solid #1e3a5f' }}>
            {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
              <Table dataSource={materials} rowKey="id" size="small" pagination={false}
                onRow={(r: any) => ({
                  onClick: () => { setSelectedMat(r.id); loadMovements(r.id) },
                  style: { cursor: 'pointer', background: selectedMat === r.id ? '#1e2d3d' : undefined },
                })}
                columns={[
                  { title: 'Código', dataIndex: 'code', render: (v: string) => <Text style={{ color: '#60a5fa', fontSize: 12, fontFamily: 'monospace' }}>{v}</Text> },
                  { title: 'Material', dataIndex: 'name', render: (v: string) => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                  { title: 'Cat.', dataIndex: 'category', render: (v: string) => <Tag color={categoryColors[v] || 'default'} style={{ fontSize: 11 }}>{v}</Tag> },
                  {
                    title: 'Estoque Atual', key: 'stock',
                    render: (_: any, r: any) => {
                      const current = Number(r.currentStock || 0)
                      const min = Number(r.minStock || 1)
                      const pct = Math.min(100, Math.round((current / (min * 2)) * 100))
                      const isLow = current < min
                      return (
                        <div style={{ minWidth: 140 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text style={{ color: isLow ? '#ef4444' : '#e2e8f0', fontWeight: isLow ? 700 : 400 }}>
                              {current.toLocaleString()} {r.unit?.toLowerCase()}
                            </Text>
                            {isLow && <WarningOutlined style={{ color: '#ef4444' }} />}
                          </div>
                          <Progress percent={pct} showInfo={false} size="small"
                            strokeColor={isLow ? '#ef4444' : '#22c55e'} trailColor="#1e3a5f" />
                          <Text style={{ color: '#475569', fontSize: 11 }}>Mín: {min.toLocaleString()} {r.unit?.toLowerCase()}</Text>
                        </div>
                      )
                    },
                  },
                  {
                    title: 'Valor Total', key: 'total',
                    render: (_: any, r: any) => (
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                        R$ {(Number(r.currentStock || 0) * Number(r.unitCost || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </Text>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {selectedMat && (
          <Col xs={24} xl={10}>
            <Card
              title={<Text style={{ color: '#e2e8f0' }}>Movimentações — {materials.find((m: any) => m.id === selectedMat)?.name}</Text>}
              style={{ border: '1px solid #1e3a5f' }}
              extra={<Button size="small" type="text" onClick={() => setSelectedMat(null)} style={{ color: '#64748b' }}>✕</Button>}
            >
              {movLoading ? <Spin style={{ display: 'block', margin: '20px auto' }} /> : (
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {movements.length === 0 ? (
                    <Text style={{ color: '#475569' }}>Nenhuma movimentação encontrada</Text>
                  ) : movements.map((m: any) => (
                    <div key={m.id} style={{
                      background: '#0f172a', borderRadius: 8, padding: 10,
                      border: `1px solid ${Number(m.quantity) > 0 ? '#1a4a2a' : '#4a1a1a'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>
                          {movTypeLabel[m.type] || m.type}
                        </Text>
                        <Text style={{ color: Number(m.quantity) > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {Number(m.quantity) > 0 ? '+' : ''}{Number(m.quantity).toLocaleString()}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ color: '#475569', fontSize: 11 }}>{m.reference || '—'}</Text>
                        <Text style={{ color: '#475569', fontSize: 11 }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </Text>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}
