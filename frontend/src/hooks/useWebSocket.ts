import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
  .replace('/api', '')
  .replace('http', 'ws') + '/ws'

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

export interface WsStatus {
  scale: boolean
  mx3000: boolean
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [connected, setConnected] = useState(false)
  const [scaleReading, setScaleReading] = useState<ScaleReading | null>(null)
  const [mx3000Data, setMx3000Data] = useState<Mx3000Data | null>(null)
  const [wsStatus, setWsStatus] = useState<WsStatus>({ scale: false, mx3000: false })

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onopen = () => {
      setConnected(true)
      socket.send(JSON.stringify({ type: 'subscribe', channels: ['scale', 'mx3000', 'status'] }))
    }

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'scale') setScaleReading(msg.data)
        else if (msg.type === 'mx3000') setMx3000Data(msg.data)
        else if (msg.type === 'status') setWsStatus(msg.data)
      } catch { /* ignore */ }
    }

    socket.onclose = () => {
      setConnected(false)
      reconnectTimer.current = setTimeout(connect, 5000)
    }

    socket.onerror = () => socket.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  const simulate = useCallback((channel: 'scale' | 'mx3000') => {
    ws.current?.send(JSON.stringify({ type: `${channel}:simulate` }))
  }, [])

  return { connected, scaleReading, mx3000Data, wsStatus, simulate }
}
