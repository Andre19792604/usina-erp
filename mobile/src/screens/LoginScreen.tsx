import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@usina.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      Alert.alert('Erro', 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.card}>
        <Text style={s.logo}>⚙️ Usina ERP</Text>
        <Text style={s.subtitle}>Sistema de Gestão de Usina de Asfalto</Text>

        <TextInput
          style={s.input}
          placeholder="E-mail"
          placeholderTextColor="#475569"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={s.input}
          placeholder="Senha"
          placeholderTextColor="#475569"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0f172a" />
            : <Text style={s.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#162032',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#e2e8f0',
    fontSize: 15,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
