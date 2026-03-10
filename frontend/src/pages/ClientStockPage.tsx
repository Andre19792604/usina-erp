import { Row, Col, Card, Typography, Space, Button } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const clientStocks = [
  { key: 1, client: 'Prefeitura de SP', material: 'CAP 50/70', balance: 28.4, unit: 'ton',
    movements: [{ type: 'ENTRADA', qty: 30, date: '08/03', note: 'NF 4521' }, { type: 'CONSUMO', qty: -1.6, date: '10/03', note: 'OP00001234' }] },
  { key: 2, client: 'Construtora ABC', material: 'Brita 1', balance: 142.0, unit: 'ton',
    movements: [{ type: 'ENTRADA', qty: 200, date: '05/03', note: 'NF 1102' }, { type: 'CONSUMO', qty: -58, date: '09/03', note: 'OP00001233' }] },
  { key: 3, client: 'DER-SP', material: 'CAP 30/45', balance: 15.2, unit: 'ton',
    movements: [{ type: 'ENTRADA', qty: 20, date: '03/03', note: 'NF 8834' }, { type: 'CONSUMO', qty: -4.8, date: '08/03', note: 'OP00001232' }] },
]

export default function ClientStockPage() {
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ color: '#e2e8f0', margin: 0 }}>Estoque de Clientes</Title>
          <Text style={{ color: '#64748b' }}>Materiais fornecidos pelos clientes (CAP, agregados)</Text>
        </div>
        <Button icon={<ArrowUpOutlined />} style={{ background: '#0d2a1f', border: '1px solid #22c55e', color: '#22c55e' }}>
          Registrar Entrada
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {clientStocks.map(cs => (
          <Col key={cs.key} xs={24} lg={8}>
            <Card style={{ border: '1px solid #1e3a5f' }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Cliente</Text>
              <div style={{ color: '#60a5fa', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{cs.client}</div>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Material</Text>
              <div style={{ color: '#e2e8f0', marginBottom: 12 }}>{cs.material}</div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, textAlign: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#64748b', fontSize: 11, display: 'block' }}>SALDO</Text>
                <Text style={{ color: '#f59e0b', fontSize: 28, fontWeight: 800 }}>{cs.balance.toLocaleString()}</Text>
                <Text style={{ color: '#64748b' }}> {cs.unit}</Text>
              </div>
              <Space direction="vertical" style={{ width: '100%' }} size={6}>
                {cs.movements.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space size={6}>
                      {m.qty > 0 ? <ArrowUpOutlined style={{ color: '#22c55e', fontSize: 11 }} /> : <ArrowDownOutlined style={{ color: '#f59e0b', fontSize: 11 }} />}
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{m.date} · {m.note}</Text>
                    </Space>
                    <Text style={{ color: m.qty > 0 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                      {m.qty > 0 ? '+' : ''}{m.qty} {cs.unit}
                    </Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
