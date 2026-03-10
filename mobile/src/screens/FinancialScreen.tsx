import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native'
import { financialService } from '../services/api'

interface FinancialDashboard {
  totalReceivable: number
  totalPayable: number
  overdueReceivable: number
  overduePayable: number
  cashFlow: number
  recentPayable: any[]
  recentReceivable: any[]
}

export default function FinancialScreen() {
  const [data, setData] = useState<FinancialDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData() {
    try {
      const d = await financialService.dashboard()
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    )
  }

  const fmt = (v: number) =>
    v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>💰 Financeiro</Text>
        <Text style={s.headerSub}>Visão geral do caixa</Text>
      </View>

      {data && (
        <>
          {/* KPI cards */}
          <View style={s.kpiGrid}>
            <KpiCard label="A Receber" value={fmt(data.totalReceivable)} color="#22c55e" />
            <KpiCard label="A Pagar" value={fmt(data.totalPayable)} color="#ef4444" />
            <KpiCard label="Receber Vencido" value={fmt(data.overdueReceivable)} color="#fb923c" />
            <KpiCard label="Saldo Líquido" value={fmt(data.cashFlow)} color={data.cashFlow >= 0 ? '#22c55e' : '#ef4444'} />
          </View>

          {/* Recent payables */}
          {data.recentPayable?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Contas a Pagar (recentes)</Text>
              {data.recentPayable.map((item: any) => (
                <View key={item.id} style={s.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listDesc}>{item.description}</Text>
                    <Text style={s.listSub}>{item.supplier?.name ?? '—'} · {formatDate(item.dueDate)}</Text>
                  </View>
                  <View>
                    <Text style={s.listAmount}>{fmt(item.amount)}</Text>
                    <StatusTag status={item.status} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent receivables */}
          {data.recentReceivable?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Contas a Receber (recentes)</Text>
              {data.recentReceivable.map((item: any) => (
                <View key={item.id} style={s.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listDesc}>{item.description}</Text>
                    <Text style={s.listSub}>{item.client?.name ?? '—'} · {formatDate(item.dueDate)}</Text>
                  </View>
                  <View>
                    <Text style={[s.listAmount, { color: '#22c55e' }]}>{fmt(item.amount)}</Text>
                    <StatusTag status={item.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
    </View>
  )
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#22c55e',
  RECEIVED: '#22c55e',
  OVERDUE: '#ef4444',
  PARTIAL: '#60a5fa',
}
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  RECEIVED: 'Recebido',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
}

function StatusTag({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#64748b'
  return (
    <Text style={{ color, fontSize: 11, textAlign: 'right', marginTop: 2 }}>
      {STATUS_LABELS[status] ?? status}
    </Text>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: {
    padding: 16, paddingTop: 52, backgroundColor: '#0d1b2e',
    borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  headerTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  kpiCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#162032', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#1e3a5f',
  },
  kpiLabel: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  kpiValue: { fontSize: 18, fontWeight: 'bold' },
  section: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#162032',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1e3a5f',
  },
  sectionTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  listDesc: { color: '#e2e8f0', fontSize: 13 },
  listSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  listAmount: { color: '#f59e0b', fontWeight: '700', fontSize: 14, textAlign: 'right' },
})
