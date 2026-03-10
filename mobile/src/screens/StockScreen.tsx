import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native'
import { materialService } from '../services/api'

interface Material {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
}

const CATEGORY_LABELS: Record<string, string> = {
  CAP: 'CAP',
  AGREGADO_GRAU: 'Brita',
  PEDRISCO: 'Pedrisco',
  PO_PEDRA: 'Pó de Pedra',
  AREIA: 'Areia',
  CAL: 'Cal',
  OLEO_BPF: 'Óleo BPF',
  DIESEL: 'Diesel',
  OUTRO: 'Outro',
}

export default function StockScreen() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadMaterials() {
    try {
      const data = await materialService.list()
      setMaterials(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMaterials() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await loadMaterials()
    setRefreshing(false)
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
        <Text style={s.headerTitle}>📦 Estoque</Text>
        <Text style={s.headerSub}>Materiais da usina</Text>
      </View>

      <FlatList
        data={materials}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        renderItem={({ item }) => {
          const low = item.currentStock <= item.minimumStock
          const pct = item.minimumStock > 0
            ? Math.min(100, Math.round((item.currentStock / (item.minimumStock * 3)) * 100))
            : 100
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.matName}>{item.name}</Text>
                  <Text style={s.matCat}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.stock, { color: low ? '#ef4444' : '#22c55e' }]}>
                    {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                  </Text>
                  {low && <Text style={s.lowAlert}>⚠ Estoque baixo</Text>}
                </View>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, {
                  width: `${pct}%`,
                  backgroundColor: low ? '#ef4444' : '#22c55e',
                }]} />
              </View>
              <Text style={s.minText}>Mínimo: {item.minimumStock} {item.unit}</Text>
            </View>
          )
        }}
        ListEmptyComponent={<Text style={s.empty}>Nenhum material encontrado.</Text>}
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
    backgroundColor: '#162032', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#1e3a5f',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  matName: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  matCat: { color: '#64748b', fontSize: 12, marginTop: 2 },
  stock: { fontSize: 18, fontWeight: 'bold' },
  lowAlert: { color: '#ef4444', fontSize: 11, marginTop: 2 },
  progressTrack: { height: 6, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  minText: { color: '#475569', fontSize: 11 },
  empty: { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 15 },
})
