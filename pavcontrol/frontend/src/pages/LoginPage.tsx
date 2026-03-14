import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onFinish(values: { email: string; password: string }) {
    setLoading(true)
    setError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch {
      setError('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        top: '10%', left: '60%', transform: 'translateX(-50%)',
      }} />

      <Card style={{
        width: 420, border: '1px solid #1e3a5f',
        background: '#1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
            }}>
              P
            </div>
            <Title level={3} style={{ color: '#10b981', margin: 0 }}>PAVCONTROL</Title>
            <Text style={{ color: '#64748b' }}>Gestão de Obras de Pavimentação</Text>
          </div>

          {error && <Alert message={error} type="error" showIcon style={{ background: '#2a1515', border: '1px solid #ef4444' }} />}

          <Form layout="vertical" onFinish={onFinish} size="large" initialValues={{ email: 'admin@pavcontrol.com', password: 'admin123' }}>
            <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>E-mail</Text>} rules={[{ required: true }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#475569' }} />}
                placeholder="admin@pavcontrol.com"
                style={{ background: '#0f172a', border: '1px solid #334155' }}
              />
            </Form.Item>

            <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>Senha</Text>} rules={[{ required: true }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#475569' }} />}
                placeholder="••••••••"
                style={{ background: '#0f172a', border: '1px solid #334155' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit" block loading={loading}
                style={{
                  height: 44, fontWeight: 600, fontSize: 15,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                }}
              >
                Entrar no Sistema
              </Button>
            </Form.Item>
          </Form>

          <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', display: 'block' }}>
            PavControl v1.0 · Gestão de Obras de Pavimentação
          </Text>
        </Space>
      </Card>
    </div>
  )
}
