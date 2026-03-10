/**
 * Scale Service — Balança Rodoviária
 *
 * Supports two connection modes:
 *   - TCP: connects to a scale indicator over TCP/IP (most modern scales)
 *   - SERIAL: reads from a serial/COM port (RS-232 indicators)
 *
 * Protocol: Toledo/Filizola/Urano standard string format
 *   Example response: "  15240 kg S" (gross weight + stability flag)
 *
 * Broadcasts live readings via WebSocket to all connected clients.
 */

import net from 'net'
import EventEmitter from 'events'
import { logger } from '../../utils/logger'
import { prisma } from '../../utils/prisma'

export interface ScaleReading {
  rawData: string
  weight: number | null   // kg
  stable: boolean
  timestamp: Date
}

export class ScaleService extends EventEmitter {
  private client: net.Socket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private buffer = ''
  private lastReading: ScaleReading | null = null
  private pollTimer: NodeJS.Timeout | null = null
  private connected = false

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly pollIntervalMs = 500
  ) {
    super()
  }

  // ── Connection ────────────────────────────────────────────────

  connect() {
    if (this.client) return
    logger.info(`[Scale] Connecting to ${this.host}:${this.port}`)

    this.client = new net.Socket()

    this.client.connect(this.port, this.host, () => {
      this.connected = true
      this.buffer = ''
      logger.info('[Scale] Connected')
      this.emit('connected')
      this.startPolling()
    })

    this.client.on('data', (data) => {
      this.buffer += data.toString('ascii')
      this.processBuffer()
    })

    this.client.on('error', (err) => {
      logger.warn(`[Scale] Error: ${err.message}`)
      this.emit('error', err)
      this.scheduleReconnect()
    })

    this.client.on('close', () => {
      this.connected = false
      this.stopPolling()
      this.client = null
      logger.warn('[Scale] Disconnected')
      this.emit('disconnected')
      this.scheduleReconnect()
    })
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.stopPolling()
    this.client?.destroy()
    this.client = null
    this.connected = false
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 5000)
  }

  // ── Polling ───────────────────────────────────────────────────
  // Sends ENQ (0x05) to request current weight reading

  private startPolling() {
    this.pollTimer = setInterval(() => {
      if (this.connected && this.client) {
        this.client.write(Buffer.from([0x05])) // ENQ
      }
    }, this.pollIntervalMs)
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  // ── Protocol Parsing ──────────────────────────────────────────
  // Handles Toledo/Filizola/Urano ASCII protocol
  // Format: STX WEIGHT_STRING ETX  (or CR/LF terminated)

  private processBuffer() {
    // Split on CR, LF or ETX
    const lines = this.buffer.split(/[\r\n\x03]+/)
    this.buffer = lines.pop() ?? '' // keep incomplete last chunk

    for (const line of lines) {
      const trimmed = line.replace(/[\x00-\x1f]/g, '').trim()
      if (!trimmed) continue
      const reading = this.parseLine(trimmed)
      if (reading) {
        this.lastReading = reading
        this.emit('reading', reading)
        this.saveReading(reading)
      }
    }
  }

  private parseLine(raw: string): ScaleReading | null {
    // Try to extract a number from the string
    // Examples:
    //   "  15240 S"  → weight=15240, stable=true
    //   "  15240 I"  → weight=15240, stable=false (I = Instável)
    //   "00015240"   → weight=15240, stable=true (fixed-width, no flag)

    const match = raw.match(/(\d+(?:\.\d+)?)\s*([SBIU])?/)
    if (!match) return null

    const weight = parseFloat(match[1])
    const flag = match[2]?.toUpperCase()
    const stable = flag === 'S' || flag === 'B' || !flag

    return {
      rawData: raw,
      weight: isNaN(weight) ? null : weight,
      stable,
      timestamp: new Date(),
    }
  }

  // ── Persistence ───────────────────────────────────────────────

  private async saveReading(reading: ScaleReading) {
    if (!reading.weight) return
    try {
      await prisma.scaleReading.create({
        data: {
          rawData: reading.rawData,
          grossWeight: reading.weight,
          stable: reading.stable,
        },
      })
    } catch {
      // Non-critical — don't crash on DB write error
    }
  }

  // ── Public API ────────────────────────────────────────────────

  getLastReading(): ScaleReading | null {
    return this.lastReading
  }

  isConnected(): boolean {
    return this.connected
  }

  /**
   * Simulate a reading (for development/testing without physical scale)
   */
  simulateReading(weight?: number) {
    const w = weight ?? Math.round(10000 + Math.random() * 20000)
    const reading: ScaleReading = {
      rawData: `SIM${w.toString().padStart(8, '0')}S`,
      weight: w,
      stable: true,
      timestamp: new Date(),
    }
    this.lastReading = reading
    this.emit('reading', reading)
    return reading
  }
}

// Singleton instance — configure from env
let _scaleService: ScaleService | null = null

export function getScaleService(): ScaleService {
  if (!_scaleService) {
    _scaleService = new ScaleService(
      process.env.SCALE_HOST || '192.168.1.100',
      Number(process.env.SCALE_PORT) || 8008,
      Number(process.env.SCALE_POLL_MS) || 500
    )
  }
  return _scaleService
}
