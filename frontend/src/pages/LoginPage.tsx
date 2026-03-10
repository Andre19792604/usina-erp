import { Form, Input, Button, Card, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()

  function onFinish() {
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decorativo */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        top: '10%', left: '60%', transform: 'translateX(-50%)',
      }} />

      <Card style={{
        width: 420, border: '1px solid #1e3a5f',
        background: '#1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
            }}>
              🏭
            </div>
            <Title level={3} style={{ color: '#f59e0b', margin: 0 }}>USINA ERP</Title>
            <Text style={{ color: '#64748b' }}>Sistema de Gestão de Usina de Asfalto</Text>
          </div>

          {/* Form */}
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>}>
              <Input
                prefix={<UserOutlined style={{ color: '#475569' }} />}
                placeholder="admin@usina.com"
                style={{ background: '#0f172a', border: '1px solid #334155' }}
              />
            </Form.Item>

            <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>Senha</Text>}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#475569' }} />}
                placeholder="••••••••"
                style={{ background: '#0f172a', border: '1px solid #334155' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  height: 44, fontWeight: 600, fontSize: 15,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                }}
              >
                Entrar no Sistema
              </Button>
            </Form.Item>
          </Form>

          <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', display: 'block' }}>
            Usina ERP v1.0 · Todos os direitos reservados
          </Text>
        </Space>
      </Card>
    </div>
  )
}
