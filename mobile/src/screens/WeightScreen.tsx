import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TextInput, TouchableOpacity, Alert,
} from 'react-native'
import { useWebSocket } from '../hooks/useWebSocket'
import { weightService } from '../services/api'

interface Ticket {
  id: string
  ticketNumber: string
  vehicle: { plate: string; driverName?: string }
  grossWeight: number
  tareWeight: number
  netWeight: number
  materialType: string
  createdAt: string
}

export default function WeightScreen() {
  const { scaleReading, status } = useWebSocket()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [plate, setPlate] = useState('')
  const [tare, setTare] = useState('')

  async function loadTickets() {
    try {
      const data = await weightService.list()
      setTickets(data.slice(0, 20))
    } catch {}
  }

  useEffect(() => { loadTickets() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadTickets()
    setRefreshing(false)
  }

  async function registerWeight() {
    if (!plate || !scaleReading) {
      Alert.alert('Atenção', 'Informe a placa e aguarde a leitura da balança.')
      return
    }
    const grossWeight = scaleReading.weight
    const tareWeight = parseFloat(tare) || 0
    const netWeight = grossWeight - tareWeight
    if (netWeight <= 0) {
      Alert.alert('Erro', 'Peso líquido inválido. Verifique a tara.')
      return
    }
    try {
      await weightService.create({ plate: plate.toUpperCase(), grossWeight, tareWeight, netWeight })
      setPlate('')
      setTare('')
      loadTickets()
      Alert.alert('Sucesso', `Peso registrado: ${netWeight.toFixed(3)} t`)
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o peso.')
    }
  }

  const gross = scaleReading?.weight ?? 0
  const tareNum = parseFloat(tare) || 0
  const net = gross - tareNum

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>⚖️ Balança Rodoviária</Text>
        <View style={[s.statusPill, { backgroundColor: status.scale ? '#16a34a22' : '#7f1d1d22' }]}>
          <View style={[s.dot, { backgroundColor: status.scale ? '#22c55e' : '#ef4444' }]} />
          <Text style={{ color: status.scale ? '#22c55e' : '#ef4444', fontSize: 12 }}>
            {status.scale ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Live reading */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Leitura Atual</Text>
        <Text style={s.bigWeight}>{gross.toFixed(3)} t</Text>
        {scaleReading && (
          <View style={[s.badge, { backgroundColor: scaleReading.stable ? '#16a34a22' : '#ca8a0422' }]}>
            <Text style={{ color: scaleReading.stable ? '#22c55e' : '#f59e0b', fontWeight: '600', fontSize: 12 }}>
              {scaleReading.stable ? '● ESTÁVEL' : '◌ INSTÁVEL'}
            </Text>
          </View>
        )}
      </View>

      {/* Register ticket */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Registrar Ticket</Text>
        <TextInput
          style={s.input}
          placeholder="Placa do veículo (ex: ABC-1234)"
          placeholderTextColor="#475569"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
        />
        <TextInput
          style={s.input}
          placeholder="Tara (toneladas)"
          placeholderTextColor="#475569"
          value={tare}
          onChangeText={setTare}
          keyboardType="decimal-pad"
        />
        <View style={s.calcRow}>
          <CalcItem label="Bruto" value={`${gross.toFixed(3)} t`} />
          <Text style={s.minus}>−</Text>
          <CalcItem label="Tara" value={`${tareNum.toFixed(3)} t`} />
          <Text style={s.minus}>=</Text>
          <CalcItem label="Líquido" value={`${net.toFixed(3)} t`} highlight />
        </View>
        <TouchableOpacity style={s.button} onPress={registerWeight}>
          <Text style={s.buttonText}>Registrar Pesagem</Text>
        </TouchableOpacity>
      </View>

      {/* Recent tickets */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Últimos Tickets</Text>
        {tickets.length === 0
          ? <Text style={s.empty}>Nenhum ticket hoje.</Text>
          : tickets.map(t => (
            <View key={t.id} style={s.ticketRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.ticketNum}>{t.ticketNumber}</Text>
                <Text style={s.ticketPlate}>{t.vehicle?.plate}</Text>
              </View>
              <Text style={s.ticketNet}>{t.netWeight?.toFixed(3)} t</Text>
            </View>
          ))
        }
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

function CalcItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: '#64748b', fontSize: 11 }}>{label}</Text>
      <Text style={{ color: highlight ? '#f59e0b' : '#e2e8f0', fontWeight: '600', fontSize: 14 }}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    padding: 16, paddingTop: 52, backgroundColor: '#0d1b2e',
    borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: {
    margin: 16, marginBottom: 0, backgroundColor: '#162032',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1e3a5f',
  },
  sectionTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  bigWeight: { color: '#f59e0b', fontSize: 48, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  badge: { alignSelf: 'center', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  input: {
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155',
    borderRadius: 8, padding: 12, color: '#e2e8f0', fontSize: 15, marginBottom: 12,
  },
  calcRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 12,
  },
  minus: { color: '#475569', fontSize: 18, fontWeight: '300' },
  button: { backgroundColor: '#f59e0b', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 15 },
  ticketRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  ticketNum: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
  ticketPlate: { color: '#64748b', fontSize: 12, marginTop: 2 },
  ticketNet: { color: '#f59e0b', fontWeight: '700', fontSize: 15 },
  empty: { color: '#475569', textAlign: 'center', paddingVertical: 12 },
})
