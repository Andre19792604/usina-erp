import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import { productionService } from '../services/api'

interface ProductionOrder {
  id: string
  number: string
  product: { name: string }
  plannedQty: number
  producedQty: number
  status: string
  scheduledDate: string
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PLANNED: { color: '#64748b', label: 'Planejado' },
  IN_PROGRESS: { color: '#f59e0b', label: 'Em Produção' },
  COMPLETED: { color: '#22c55e', label: 'Concluído' },
  PAUSED: { color: '#fb923c', label: 'Pausado' },
  CANCELLED: { color: '#ef4444', label: 'Cancelado' },
}

export default function ProductionScreen() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadOrders() {
    try {
      const data = await productionService.list()
      setOrders(data)
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as ordens.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  async function handleAction(order: ProductionOrder, newStatus: string) {
    try {
      await productionService.updateStatus(order.id, { status: newStatus })
      loadOrders()
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status.')
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🏭 Produção</Text>
        <Text style={s.headerSub}>Ordens de produção</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        renderItem={({ item }) => {
          const pct = item.plannedQty > 0 ? Math.round((item.producedQty / item.plannedQty) * 100) : 0
          const cfg = STATUS_CONFIG[item.status] || { color: '#64748b', label: item.status }
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.orderNum}>{item.number}</Text>
                <View style={[s.badge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
                  <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <Text style={s.productName}>{item.product?.name}</Text>

              <View style={s.progressRow}>
                <Text style={s.progressText}>{item.producedQty}/{item.plannedQty} ton</Text>
                <Text style={s.progressPct}>{pct}%</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, {
                  width: `${pct}%`,
                  backgroundColor: pct === 100 ? '#22c55e' : '#f59e0b',
                }]} />
              </View>

              <View style={s.actions}>
                {item.status === 'PLANNED' && (
                  <TouchableOpacity
                    style={[s.actionBtn, { borderColor: '#60a5fa' }]}
                    onPress={() => handleAction(item, 'IN_PROGRESS')}
                  >
                    <Text style={[s.actionText, { color: '#60a5fa' }]}>▶ Iniciar</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'IN_PROGRESS' && (
                  <>
                    <TouchableOpacity
                      style={[s.actionBtn, { borderColor: '#fb923c' }]}
                      onPress={() => handleAction(item, 'PAUSED')}
                    >
                      <Text style={[s.actionText, { color: '#fb923c' }]}>⏸ Pausar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionBtn, { borderColor: '#22c55e' }]}
                      onPress={() => handleAction(item, 'COMPLETED')}
                    >
                      <Text style={[s.actionText, { color: '#22c55e' }]}>✓ Concluir</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )
        }}
        ListEmptyComponent={<Text style={s.empty}>Nenhuma ordem encontrada.</Text>}
      />
    </View>
  )
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
  card: {
    backgroundColor: '#162032', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#1e3a5f',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNum: { color: '#60a5fa', fontWeight: '700', fontSize: 14 },
  badge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  productName: { color: '#e2e8f0', fontSize: 15, marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { color: '#94a3b8', fontSize: 12 },
  progressPct: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 3 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: '600' },
  empty: { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 15 },
})
