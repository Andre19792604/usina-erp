import { useEffect, useState } from 'react'
import { wsService } from '../services/websocket'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001/api'
const WS_BASE = API_URL.replace('/api', '')

export interface ScaleReading {
  weight: number
  unit: string
  stable: boolean
  timestamp: string
}

export interface Mx3000Data {
  tempDrum: number
  tempMixer: number
  tempCap: number
  tempOutput: number
  batchWeight: number
  batchCount: number
  totalProduced: number
  timestamp: string
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [scaleReading, setScaleReading] = useState<ScaleReading | null>(null)
  const [mx3000Data, setMx3000Data] = useState<Mx3000Data | null>(null)
  const [status, setStatus] = useState<{ scale: boolean; mx3000: boolean }>({ scale: false, mx3000: false })

  useEffect(() => {
    wsService.connect(WS_BASE)

    const onConnected = () => setConnected(true)
    const onDisconnected = () => setConnected(false)
    const onScale = (data: ScaleReading) => setScaleReading(data)
    const onMx3000 = (data: Mx3000Data) => setMx3000Data(data)
    const onStatus = (data: any) => setStatus(data)

    wsService.on('connected', onConnected)
    wsService.on('disconnected', onDisconnected)
    wsService.on('scale', onScale)
    wsService.on('mx3000', onMx3000)
    wsService.on('status', onStatus)

    return () => {
      wsService.off('connected', onConnected)
      wsService.off('disconnected', onDisconnected)
      wsService.off('scale', onScale)
      wsService.off('mx3000', onMx3000)
      wsService.off('status', onStatus)
    }
  }, [])

  return { connected, scaleReading, mx3000Data, status }
}
