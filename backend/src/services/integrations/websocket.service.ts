/**
 * WebSocket Service
 *
 * Bridges scale and MX3000 real-time data to browser clients.
 * Uses the 'ws' library on top of the Express HTTP server.
 *
 * Message types (server → client):
 *   { type: 'scale', data: ScaleReading }
 *   { type: 'mx3000', data: Mx3000Data }
 *   { type: 'ping' }
 *
 * Message types (client → server):
 *   { type: 'subscribe', channels: ['scale', 'mx3000'] }
 *   { type: 'scale:simulate' }
 *   { type: 'mx3000:simulate' }
 */

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { Server } from 'http'
import { logger } from '../../utils/logger'
import { getScaleService } from './scale.service'
import { getMx3000Service } from './mx3000.service'

interface ExtendedWs extends WebSocket {
  channels: Set<string>
  isAlive: boolean
}

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' })
  const scale = getScaleService()
  const mx3000 = getMx3000Service()

  // ── Scale events → broadcast ────────────────────────────────
  scale.on('reading', (data) => {
    broadcast(wss, 'scale', data, 'scale')
  })
  scale.on('connected', () => broadcast(wss, 'scale:status', { connected: true }))
  scale.on('disconnected', () => broadcast(wss, 'scale:status', { connected: false }))

  // ── MX3000 events → broadcast ───────────────────────────────
  mx3000.on('data', (data) => {
    broadcast(wss, 'mx3000', data, 'mx3000')
  })
  mx3000.on('connected', () => broadcast(wss, 'mx3000:status', { connected: true }))
  mx3000.on('disconnected', () => broadcast(wss, 'mx3000:status', { connected: false }))

  // ── Client connections ──────────────────────────────────────
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    const client = ws as ExtendedWs
    client.channels = new Set()
    client.isAlive = true

    client.on('pong', () => { client.isAlive = true })

    // Send last known data immediately
    if (scale.getLastReading()) {
      client.send(JSON.stringify({ type: 'scale', data: scale.getLastReading() }))
    }
    if (mx3000.getLastData()) {
      client.send(JSON.stringify({ type: 'mx3000', data: mx3000.getLastData() }))
    }

    // Status
    client.send(JSON.stringify({
      type: 'status',
      data: {
        scale: scale.isConnected(),
        mx3000: mx3000.isConnected(),
      },
    }))

    client.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        handleClientMessage(client, msg, scale, mx3000)
      } catch {
        // ignore malformed messages
      }
    })

    client.on('error', () => { /* ignore */ })
    logger.debug('[WS] Client connected')
  })

  // ── Heartbeat ───────────────────────────────────────────────
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = ws as ExtendedWs
      if (!client.isAlive) return client.terminate()
      client.isAlive = false
      client.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(heartbeat))

  // ── Connect integrations (if env configured) ─────────────────
  if (process.env.SCALE_HOST) {
    scale.connect()
  } else {
    logger.info('[Scale] SCALE_HOST not set — using simulation mode')
  }
  if (process.env.MX3000_HOST) {
    mx3000.connect()
  } else {
    logger.info('[MX3000] MX3000_HOST not set — using simulation mode')
  }

  logger.info('[WS] WebSocket server running on /ws')
  return wss
}

function broadcast(
  wss: WebSocketServer,
  type: string,
  data: unknown,
  channel?: string
) {
  const payload = JSON.stringify({ type, data })
  wss.clients.forEach((ws) => {
    const client = ws as ExtendedWs
    if (client.readyState !== WebSocket.OPEN) return
    if (channel && client.channels.size > 0 && !client.channels.has(channel)) return
    client.send(payload)
  })
}

function handleClientMessage(
  client: ExtendedWs,
  msg: any,
  scale: ReturnType<typeof getScaleService>,
  mx3000: ReturnType<typeof getMx3000Service>
) {
  switch (msg.type) {
    case 'subscribe':
      client.channels = new Set(msg.channels ?? [])
      break
    case 'scale:simulate':
      scale.simulateReading(msg.weight)
      break
    case 'mx3000:simulate':
      mx3000.simulateData()
      break
    default:
      break
  }
}
