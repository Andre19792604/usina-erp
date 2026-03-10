import { Row, Col, Card, Table, Tag, Typography, Progress, Button, Space, Alert } from 'antd'
import { WarningOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const materials = [
  { key: 1, code: 'CAP-50/70', name: 'CAP 50/70', category: 'CAP', unit: 'ton', current: 45.2, min: 50, cost: 4200 },
  { key: 2, code: 'CAP-30/45', name: 'CAP 30/45', category: 'CAP', unit: 'ton', current: 82.0, min: 30, cost: 4350 },
  { key: 3, code: 'BRIT-0', name: 'Brita 0', category: 'AGREGADO', unit: 'ton', current: 342.5, min: 200, cost: 85 },
  { key: 4, code: 'BRIT-1', name: 'Brita 1', category: 'AGREGADO', unit: 'ton', current: 210.0, min: 200, cost: 80 },
  { key: 5, code: 'BRIT-2', name: 'Brita 2', category: 'AGREGADO', unit: 'ton', current: 88.0, min: 100, cost: 78 },
  { key: 6, code: 'PO-PEDRA', name: 'Pó de Pedra', category: 'AGREGADO', unit: 'ton', current: 195.0, min: 150, cost: 55 },
  { key: 7, code: 'AREIA-M', name: 'Areia Média', category: 'AREIA', unit: 'ton', current: 120.0, min: 100, cost: 45 },
  { key: 8, code: 'CAL-HID', name: 'Cal Hidratada', category: 'CAL', unit: 'ton', current: 12.0, min: 20, cost: 320 },
  { key: 9, code: 'OLEO-BPF', name: 'Óleo BPF', category: 'COMBUSTIVEL', unit: 'L', current: 4200, min: 3000, cost: 3.8 },
  { key: 10, code: 'DIESEL', name: 'Diesel', category: 'COMBUSTIVEL', unit: 'L', current: 3200, min: 5000, cost: 5.9 },
]

const categoryColors: Record<string, string> = {
  CAP: 'volcano',
  AGREGADO: 'geekblue',
  AREIA: 'gold',
  CAL: 'lime',
  COMBUSTIVEL: 'purple',
}

const movements = [
  { key: 1, material: 'CAP 50/70', type: 'SAIDA_PRODUCAO', qty: -12.4, balance: 45.2, time: '10:01', ref: 'OP00001234' },
  { key: 2, material: 'Brita 0', type: 'SAIDA_PRODUCAO', qty: -38.6, balance: 342.5, time: '10:01', ref: 'OP00001234' },
  { key: 3, material: 'CAP 50/70', type: 'ENTRADA_COMPRA', qty: 30.0, balance: 57.6, time: '08:00', ref: 'PC00000089' },
  { key: 4, material: 'Diesel', type: 'ENTRADA_COMPRA', qty: 5000, balance: 8200, time: '07:30', ref: 'PC00000090' },
]

export default function StockPage() {
  const lowStock = materials.filter(m => m.current < m.min)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Estoque da Usina</Title>
          <Text style={{ color: '#64748b' }}>Materiais pertencentes à empresa</Text>
        </div>
        <Space>
          <Button icon={<ArrowUpOutlined />} style={{ background: '#0d2a1f', border: '1px solid #22c55e', color: '#22c55e' }}>
            Entrada
          </Button>
          <Button icon={<ArrowDownOutlined />} style={{ background: '#2a1515', border: '1px solid #ef4444', color: '#ef4444' }}>
            Saída / Ajuste
          </Button>
        </Space>
      </div>

      {lowStock.length > 0 && (
        <Alert
          icon={<WarningOutlined />}
          message={`${lowStock.length} material(is) abaixo do estoque mínimo: ${lowStock.map(m => m.name).join(', ')}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16, background: '#2a1f0d', border: '1px solid #92400e' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Posição do Estoque</Text>} style={{ border: '1px solid #1e3a5f' }}>
            <Table
              dataSource={materials}
              size="small"
              pagination={false}
              columns={[
                { title: 'Código', dataIndex: 'code', render: v => <Text style={{ color: '#60a5fa', fontSize: 12, fontFamily: 'monospace' }}>{v}</Text> },
                { title: 'Material', dataIndex: 'name', render: v => <Text style={{ color: '#e2e8f0' }}>{v}</Text> },
                { title: 'Categoria', dataIndex: 'category', render: v => <Tag color={categoryColors[v] || 'default'} style={{ fontSize: 11 }}>{v}</Tag> },
                {
                  title: 'Estoque Atual',
                  key: 'stock',
                  render: (_, r: any) => {
                    const pct = Math.min(100, Math.round((r.current / (r.min * 2)) * 100))
                    const isLow = r.current < r.min
                    return (
                      <div style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ color: isLow ? '#ef4444' : '#e2e8f0', fontWeight: isLow ? 700 : 400 }}>
                            {r.current.toLocaleString()} {r.unit}
                          </Text>
                          {isLow && <WarningOutlined style={{ color: '#ef4444' }} />}
                        </div>
                        <Progress
                          percent={pct} showInfo={false} size="small"
                          strokeColor={isLow ? '#ef4444' : '#22c55e'}
                          trailColor="#1e3a5f"
                        />
                        <Text style={{ color: '#475569', fontSize: 11 }}>Mín: {r.min.toLocaleString()} {r.unit}</Text>
                      </div>
                    )
                  },
                },
                {
                  title: 'Valor Total',
                  key: 'total',
                  render: (_, r: any) => (
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                      R$ {(r.current * r.cost).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title={<Text style={{ color: '#e2e8f0' }}>Últimas Movimentações</Text>} style={{ border: '1px solid #1e3a5f' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {movements.map(m => (
                <div key={m.key} style={{
                  background: '#0f172a', borderRadius: 8, padding: 12,
                  border: `1px solid ${m.qty > 0 ? '#1a4a2a' : '#4a1a1a'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{m.material}</Text>
                    <Text style={{
                      color: m.qty > 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {m.qty > 0 ? '+' : ''}{m.qty.toLocaleString()}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#475569', fontSize: 11 }}>{m.type.replace(/_/g, ' ')}</Text>
                    <Text style={{ color: '#475569', fontSize: 11 }}>{m.time} · {m.ref}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
