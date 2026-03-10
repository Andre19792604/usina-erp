import { Card, Typography } from 'antd'
const { Title, Text } = Typography
export default function MaterialsPage() {
  return (
    <div>
      <Title level={4} style={{ color: '#e2e8f0', marginBottom: 8 }}>Materials</Title>
      <Text style={{ color: '#64748b' }}>Módulo em desenvolvimento</Text>
      <Card style={{ border: '1px solid #1e3a5f', marginTop: 24 }}>
        <Text style={{ color: '#475569' }}>Em breve...</Text>
      </Card>
    </div>
  )
}
