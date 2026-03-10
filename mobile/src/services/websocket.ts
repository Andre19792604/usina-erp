type WsCallback = (data: any) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private listeners: Map<string, WsCallback[]> = new Map()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url = ''

  connect(baseUrl: string) {
    this.url = baseUrl.replace('http', 'ws') + '/ws'
    this.createConnection()
  }

  private createConnection() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.emit('connected', null)
        this.send({ type: 'subscribe', channels: ['scale', 'mx3000'] })
      }

      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          this.emit(msg.type, msg.data)
        } catch {
          // ignore
        }
      }

      this.ws.onclose = () => {
        this.emit('disconnected', null)
        this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this.ws?.close()
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.createConnection()
    }, 5000)
  }

  send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  on(event: string, cb: WsCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(cb)
  }

  off(event: string, cb: WsCallback) {
    const arr = this.listeners.get(event)
    if (arr) {
      const idx = arr.indexOf(cb)
      if (idx !== -1) arr.splice(idx, 1)
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }
}

export const wsService = new WebSocketService()
