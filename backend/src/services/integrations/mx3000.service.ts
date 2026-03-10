/**
 * MX3000 Service — Controlador de Usina de Asfalto
 *
 * Connects to the MX3000 plant controller via Modbus TCP or proprietary
 * TCP protocol (varies by manufacturer configuration).
 *
 * Reads: temperatures (drum, mixer, CAP, output),
 *        batch count, batch weight, total produced today.
 *
 * Broadcasts data via WebSocket to connected clients every 2s.
 */

import net from 'net'
import EventEmitter from 'events'
import { logger } from '../../utils/logger'
import { prisma } from '../../utils/prisma'

export interface Mx3000Data {
  tempDrum: number | null     // °C — tambor secador
  tempMixer: number | null    // °C — misturador (pugmill)
  tempCap: number | null      // °C — temperatura do CAP
  tempOutput: number | null   // °C — temperatura de saída da massa
  batchWeight: number | null  // kg — peso do traço
  batchCount: number | null   // nº de traços acumulados
  totalProduced: number | null // toneladas produzidas hoje
  timestamp: Date
}

export class Mx3000Service extends EventEmitter {
  private client: net.Socket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private pollTimer: NodeJS.Timeout | null = null
  private lastData: Mx3000Data | null = null
  private connected = false
  private currentOrderId: string | null = null

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly pollIntervalMs = 2000
  ) {
    super()
  }

  setCurrentOrder(orderId: string | null) {
    this.currentOrderId = orderId
  }

  // ── Connection ────────────────────────────────────────────────

  connect() {
    if (this.client) return
    logger.info(`[MX3000] Connecting to ${this.host}:${this.port}`)

    this.client = new net.Socket()
    this.client.setTimeout(10000)

    this.client.connect(this.port, this.host, () => {
      this.connected = true
      logger.info('[MX3000] Connected')
      this.emit('connected')
      this.startPolling()
    })

    this.client.on('data', (data) => {
      const parsed = this.parseResponse(data)
      if (parsed) {
        this.lastData = parsed
        this.emit('data', parsed)
        this.saveData(parsed)
      }
    })

    this.client.on('error', (err) => {
      logger.warn(`[MX3000] Error: ${err.message}`)
      this.scheduleReconnect()
    })

    this.client.on('close', () => {
      this.connected = false
      this.stopPolling()
      this.client = null
      logger.warn('[MX3000] Disconnected')
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
    }, 8000)
  }

  // ── Polling ───────────────────────────────────────────────────
  // Sends read request every pollIntervalMs milliseconds

  private startPolling() {
    // MX3000 read command (adapt to actual protocol)
    const READ_CMD = Buffer.from([0x01, 0x03, 0x00, 0x00, 0x00, 0x14, 0x45, 0xC5]) // Modbus read

    this.pollTimer = setInterval(() => {
      if (this.connected && this.client) {
        this.client.write(READ_CMD)
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
  // Parses Modbus RTU over TCP response
  // Registers (16-bit, big-endian):
  //   0x00: temp drum (×0.1 °C)
  //   0x01: temp mixer (×0.1 °C)
  //   0x02: temp CAP (×0.1 °C)
  //   0x03: temp output (×0.1 °C)
  //   0x04-0x05: batch weight (kg, 32-bit)
  //   0x06-0x07: batch count (32-bit)
  //   0x08-0x09: total produced today (kg, 32-bit)

  private parseResponse(data: Buffer): Mx3000Data | null {
    // Modbus TCP response: header(6) + function(1) + byte_count(1) + data
    if (data.length < 9) return null
    const byteCount = data[8]
    if (data.length < 9 + byteCount) return null

    try {
      const d = data.slice(9) // actual data bytes

      const read16 = (offset: number) => d.readUInt16BE(offset * 2)
      const read32 = (offset: number) =>
        (d.readUInt16BE(offset * 2) << 16) | d.readUInt16BE((offset + 1) * 2)

      return {
        tempDrum: read16(0) / 10,
        tempMixer: read16(1) / 10,
        tempCap: read16(2) / 10,
        tempOutput: read16(3) / 10,
        batchWeight: read32(4),
        batchCount: read32(6),
        totalProduced: read32(8) / 1000, // kg → ton
        timestamp: new Date(),
      }
    } catch {
      return null
    }
  }

  // ── Persistence ───────────────────────────────────────────────

  private async saveData(data: Mx3000Data) {
    try {
      await prisma.mx3000Reading.create({
        data: {
          productionOrderId: this.currentOrderId,
          tempDrum: data.tempDrum,
          tempMixer: data.tempMixer,
          tempCap: data.tempCap,
          tempOutput: data.tempOutput,
          batchWeight: data.batchWeight,
          batchCount: data.batchCount,
          totalProduced: data.totalProduced,
        },
      })
    } catch {
      // Non-critical
    }
  }

  // ── Public API ────────────────────────────────────────────────

  getLastData(): Mx3000Data | null {
    return this.lastData
  }

  isConnected(): boolean {
    return this.connected
  }

  /**
   * Simulate MX3000 data for dev/testing
   */
  simulateData(): Mx3000Data {
    const base = { timestamp: new Date() }
    const data: Mx3000Data = {
      tempDrum: 185 + Math.random() * 20,
      tempMixer: 145 + Math.random() * 15,
      tempCap: 160 + Math.random() * 10,
      tempOutput: 148 + Math.random() * 8,
      batchWeight: 1800 + Math.random() * 200,
      batchCount: Math.floor(120 + Math.random() * 20),
      totalProduced: 210 + Math.random() * 5,
      ...base,
    }
    this.lastData = data
    this.emit('data', data)
    return data
  }
}

let _mx3000: Mx3000Service | null = null

export function getMx3000Service(): Mx3000Service {
  if (!_mx3000) {
    _mx3000 = new Mx3000Service(
      process.env.MX3000_HOST || '192.168.1.200',
      Number(process.env.MX3000_PORT) || 502,
      Number(process.env.MX3000_POLL_MS) || 2000
    )
  }
  return _mx3000
}
