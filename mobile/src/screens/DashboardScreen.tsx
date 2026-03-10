import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { financialService } from '../services/api'

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const { scaleReading, mx3000Data, status } = useWebSocket()
  const [financial, setFinancial] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData() {
    try {
      const fin = await financialService.dashboard()
      setFinancial(fin)
    } catch {}
  }

  useEffect(() => { loadData() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>⚙️ Usina ERP</Text>
          <Text style={s.headerSub}>Olá, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Real-time MX3000 */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>MX3000 – Tempo Real</Text>
          <StatusDot active={status.mx3000} label={status.mx3000 ? 'Online' : 'Offline'} />
        </View>
        <View style={s.row}>
          <TempCard label="Tambor" value={mx3000Data?.tempDrum} />
          <TempCard label="Misturador" value={mx3000Data?.tempMixer} />
          <TempCard label="CAP" value={mx3000Data?.tempCap} />
          <TempCard label="Saída" value={mx3000Data?.tempOutput} />
        </View>
        {mx3000Data && (
          <View style={s.mx3000Stats}>
            <StatItem label="Lote atual" value={`${mx3000Data.batchWeight} kg`} color="#f59e0b" />
            <StatItem label="Lotes" value={String(mx3000Data.batchCount)} color="#60a5fa" />
            <StatItem label="Total produzido" value={`${mx3000Data.totalProduced} t`} color="#22c55e" />
          </View>
        )}
      </View>

      {/* Scale */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Balança Rodoviária</Text>
          <StatusDot active={status.scale} label={status.scale ? 'Online' : 'Offline'} />
        </View>
        {scaleReading ? (
          <View style={s.scaleCard}>
            <Text style={s.scaleWeight}>{scaleReading.weight.toFixed(3)} {scaleReading.unit}</Text>
            <View style={[s.stabilityBadge, { backgroundColor: scaleReading.stable ? '#16a34a' : '#ca8a04' }]}>
              <Text style={s.stabilityText}>{scaleReading.stable ? 'ESTÁVEL' : 'INSTÁVEL'}</Text>
            </View>
          </View>
        ) : (
          <Text style={s.emptyText}>Aguardando leitura…</Text>
        )}
      </View>

      {/* Financial summary */}
      {financial && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Financeiro</Text>
          <View style={s.row}>
            <FinCard label="A Receber" value={financial.totalReceivable} color="#22c55e" />
            <FinCard label="A Pagar" value={financial.totalPayable} color="#ef4444" />
          </View>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

function TempCard({ label, value }: { label: string; value?: number }) {
  const isHigh = value !== undefined && value > 160
  const color = value === undefined ? '#475569' : isHigh ? '#ef4444' : '#22c55e'
  return (
    <View style={s.tempCard}>
      <Text style={s.tempLabel}>{label}</Text>
      <Text style={[s.tempValue, { color }]}>
        {value !== undefined ? `${value}°C` : '—'}
      </Text>
    </View>
  )
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
  )
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={s.statusDot}>
      <View style={[s.dot, { backgroundColor: active ? '#22c55e' : '#ef4444' }]} />
      <Text style={[s.dotLabel, { color: active ? '#22c55e' : '#ef4444' }]}>{label}</Text>
    </View>
  )
}

function FinCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[s.finCard, { flex: 1 }]}>
      <Text style={s.finLabel}>{label}</Text>
      <Text style={[s.finValue, { color }]}>
        {value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 52, backgroundColor: '#0d1b2e', borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  headerTitle: { color: '#f59e0b', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#94a3b8', fontSize: 13 },
  section: {
    margin: 16, marginBottom: 0,
    backgroundColor: '#162032', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#1e3a5f',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tempCard: {
    flex: 1, minWidth: 70, backgroundColor: '#0f172a', borderRadius: 8,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f',
  },
  tempLabel: { color: '#64748b', fontSize: 11, marginBottom: 4 },
  tempValue: { fontSize: 16, fontWeight: 'bold' },
  mx3000Stats: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e3a5f',
  },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 11, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  scaleCard: { alignItems: 'center', paddingVertical: 8 },
  scaleWeight: { color: '#e2e8f0', fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  stabilityBadge: { borderRadius: 4, paddingHorizontal: 12, paddingVertical: 4 },
  stabilityText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#475569', textAlign: 'center', paddingVertical: 12 },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { fontSize: 12 },
  finCard: {
    backgroundColor: '#0f172a', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#1e3a5f', marginRight: 8,
  },
  finLabel: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  finValue: { fontSize: 18, fontWeight: 'bold' },
})
