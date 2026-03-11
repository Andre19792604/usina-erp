import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// NF-e status lifecycle: PENDENTE → EMITIDA → CANCELADA | DENEGADA
// This controller manages the Invoice model (NF-e records) linked to SalesOrders

export async function list(req: Request, res: Response) {
  try {
    const { status, clientId, from, to } = req.query

    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (from || to) {
      where.issueDate = {}
      if (from) where.issueDate.gte = new Date(from as string)
      if (to) where.issueDate.lte = new Date(to as string)
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, cnpj: true } },
        salesOrder: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(invoices)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        salesOrder: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    })
    if (!invoice) return res.status(404).json({ error: 'NF-e não encontrada' })
    res.json(invoice)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const {
      clientId, salesOrderId, number, serie, nature,
      totalProducts, totalIcms, totalIpi, totalPis,
      totalCofins, totalNfe, items, xmlContent,
    } = req.body

    if (!clientId || !totalNfe) {
      return res.status(400).json({ error: 'clientId e totalNfe são obrigatórios' })
    }

    // Generate sequential number if not provided
    let nfeNumber = number
    if (!nfeNumber) {
      const last = await prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' } })
      const lastNum = last?.number ? parseInt(last.number) : 0
      nfeNumber = String(lastNum + 1).padStart(9, '0')
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        salesOrderId: salesOrderId || null,
        number: nfeNumber,
        serie: serie || '001',
        nature: nature || 'Venda de Mercadoria',
        status: 'PENDENTE',
        issueDate: new Date(),
        totalProducts: totalProducts || totalNfe,
        totalIcms: totalIcms || 0,
        totalIpi: totalIpi || 0,
        totalPis: totalPis || 0,
        totalCofins: totalCofins || 0,
        totalNfe: totalNfe,
        items: items || [],
        xmlContent: xmlContent || null,
      },
      include: {
        client: { select: { id: true, name: true, cnpj: true } },
      },
    })

    res.status(201).json(invoice)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const { status, chave, protocol, cancelReason } = req.body
    const validStatuses = ['PENDENTE', 'EMITIDA', 'CANCELADA', 'DENEGADA', 'INUTILIZADA']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const data: any = { status }
    if (chave) data.chave = chave
    if (protocol) data.protocol = protocol
    if (cancelReason) data.cancelReason = cancelReason
    if (status === 'EMITIDA') data.issueDate = new Date()

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data,
      include: { client: { select: { id: true, name: true } } },
    })

    res.json(invoice)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function importXml(req: Request, res: Response) {
  try {
    const { xml } = req.body
    if (!xml) return res.status(400).json({ error: 'XML não fornecido' })

    // Parse key fields from NF-e XML (simplified extraction)
    const extract = (tag: string) => {
      const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`))
      return match ? match[1].trim() : null
    }

    const chave = extract('chNFe') || extract('Id')?.replace('NFe', '')
    const nfeNumber = extract('nNF')
    const serie = extract('serie')
    const totalNfe = parseFloat(extract('vNF') || '0')
    const cnpjEmitente = extract('CNPJ')
    const nomeEmitente = extract('xNome')

    if (!nfeNumber) {
      return res.status(400).json({ error: 'XML inválido: número da NF-e não encontrado' })
    }

    // Find or create client by CNPJ
    let client = null
    if (cnpjEmitente) {
      client = await prisma.client.findFirst({ where: { cnpj: cnpjEmitente } })
      if (!client && nomeEmitente) {
        client = await prisma.client.create({
          data: { name: nomeEmitente, cnpj: cnpjEmitente, active: true },
        })
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId: client?.id || null,
        number: nfeNumber,
        serie: serie || '001',
        nature: 'Importada via XML',
        status: 'EMITIDA',
        issueDate: new Date(),
        chave: chave || null,
        totalProducts: totalNfe,
        totalIcms: 0,
        totalIpi: 0,
        totalPis: 0,
        totalCofins: 0,
        totalNfe,
        items: [],
        xmlContent: xml,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    res.status(201).json({ invoice, parsed: { nfeNumber, serie, chave, totalNfe, cnpjEmitente, nomeEmitente } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function getXml(req: Request, res: Response) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      select: { xmlContent: true, number: true },
    })
    if (!invoice) return res.status(404).json({ error: 'NF-e não encontrada' })
    if (!invoice.xmlContent) return res.status(404).json({ error: 'XML não disponível' })
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Content-Disposition', `attachment; filename=NF-e_${invoice.number}.xml`)
    res.send(invoice.xmlContent)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
