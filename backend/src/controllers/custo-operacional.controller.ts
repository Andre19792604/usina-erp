import { Response } from 'express'
import { prisma } from '../utils/prisma'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { MixtureType } from '@prisma/client'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

interface PrevisaoInput {
  tipoProduto: MixtureType
  producaoTon: number
  precoVendaC?: number
  precoVendaSc?: number
  precoVendaSp?: number
  precoVendaSb?: number
}

// Composição padrão dos traços (% em massa por insumo)
// Usada para calcular custo de insumos sem depender de um traço customizado
const COMPOSICAO_PADRAO: Record<MixtureType, Record<string, number>> = {
  CBUQ: {
    cap5070: 5.5, brita0: 20.0, brita1: 30.0, brita2: 28.0,
    poPedra: 13.5, cal: 1.0, areia: 2.0,
  },
  PMF: {
    emulsaoRl1c: 4.5, brita0: 50.0, poPedra: 35.0, areia: 8.5, cal: 2.0,
  },
  TSD: {
    emulsaoRr2c: 14.0, brita0: 52.0, poPedra: 34.0,
  },
  MICROSF: {
    emulsaoRl1c: 10.0, areia: 62.0, poPedra: 22.0, polMineral: 3.0, cal: 1.5,
  },
  SMA: {
    cap5070: 6.5, brita1: 65.0, poPedra: 15.0, cal: 2.0, fibra: 0.3, areia: 11.2,
  },
  OUTRO: {},
}

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

function calcTotalFixo(cfg: any): number {
  return (
    Number(cfg.folhaSalarial) + Number(cfg.encargos) + Number(cfg.aluguel) +
    Number(cfg.depreciacao) + Number(cfg.energiaFixa) + Number(cfg.manutencao) +
    Number(cfg.seguros) + Number(cfg.locacaoEquip) + Number(cfg.outrosFixos)
  )
}

function calcCargaTrib(cfg: any): number {
  return (
    Number(cfg.pis) + Number(cfg.cofins) + Number(cfg.iss) +
    Number(cfg.icms) + Number(cfg.irpj) + Number(cfg.csll)
  )
}

function calcCustoUtil(cfg: any, semBPF = false): number {
  const diesel = Number(cfg.dieselLTon) * Number(cfg.dieselPreco)
  const bpf = semBPF ? 0 : Number(cfg.bpfLTon) * Number(cfg.bpfPreco)
  const energia = Number(cfg.energiaKwhTon) * Number(cfg.energiaTarifa)
  return diesel + bpf + energia
}

/** Busca preços vigentes dos materiais no banco */
async function getPrecosVigentes(): Promise<Record<string, number>> {
  const materials = await prisma.material.findMany({
    where: { active: true },
    select: { code: true, unitCost: true },
  })
  return Object.fromEntries(materials.map(m => [m.code, Number(m.unitCost)]))
}

/** Calcula custo de insumos por tonelada para um tipo de produto e modo de fornecimento */
function calcCustoInsumo(
  tipoProduto: MixtureType,
  modo: 'COMPLETO' | 'SEM_CAP' | 'SEM_CAP_PEDRA' | 'SO_USINAGEM',
  precos: Record<string, number>,
): number {
  const comp = COMPOSICAO_PADRAO[tipoProduto] ?? {}

  const isCAP = (k: string) => k.startsWith('cap') || k.startsWith('emulsao')
  const isPedra = (k: string) =>
    k.startsWith('brita') || k.startsWith('poPedra') || k.startsWith('areia')

  let custo = 0
  for (const [insumo, pct] of Object.entries(comp)) {
    const excludeCAP = modo !== 'COMPLETO' && isCAP(insumo)
    const excludePedra = (modo === 'SEM_CAP_PEDRA' || modo === 'SO_USINAGEM') && isPedra(insumo)
    if (excludeCAP || excludePedra) continue
    // Tenta mapear código do insumo para price
    const preco = precos[insumo] ?? precos[`MAT-${insumo.toUpperCase()}`] ?? 0
    custo += (pct / 100) * preco
  }
  return custo
}

function calcResultado(
  previsao: PrevisaoInput,
  cfg: any,
  precos: Record<string, number>,
  totalFixo: number,
  prodSoma: number,
  cargaTrib: number,
) {
  const prod = Number(previsao.producaoTon)
  if (prod <= 0) return null

  const fixoRateadoTotal = (prod / (prodSoma || 1)) * totalFixo
  const fixoRateadoPorTon = fixoRateadoTotal / prod

  const modos = ['COMPLETO', 'SEM_CAP', 'SEM_CAP_PEDRA', 'SO_USINAGEM'] as const
  const precoVendaMap: Record<string, number | null> = {
    COMPLETO:      previsao.precoVendaC   ?? null,
    SEM_CAP:       previsao.precoVendaSc  ?? null,
    SEM_CAP_PEDRA: previsao.precoVendaSp  ?? null,
    SO_USINAGEM:   previsao.precoVendaSb  ?? null,
  }

  const resultadoModos = modos.map(modo => {
    const semBPF = modo === 'SO_USINAGEM'
    const custoInsumo = calcCustoInsumo(previsao.tipoProduto, modo, precos)
    const custoUtil = calcCustoUtil(cfg, semBPF)
    const custoVar = custoInsumo + custoUtil
    const custoBase = custoVar + fixoRateadoPorTon
    const precoV = precoVendaMap[modo] ?? 0
    const custoTrib = precoV > 0 ? precoV * (cargaTrib / 100) : 0
    const custoTotal = custoBase + custoTrib
    const margemBruta = precoV > 0 ? ((precoV - custoTotal) / precoV) * 100 : null
    const margemContrib = precoV > 0 ? ((precoV - custoVar - custoTrib) / precoV) * 100 : null
    const peq = precoV > 0 && custoVar + custoTrib < precoV
      ? (fixoRateadoPorTon * prod) / (precoV - custoVar - custoTrib)
      : null

    return {
      modo,
      custoInsumoPorTon: +custoInsumo.toFixed(4),
      custoUtilPorTon:   +custoUtil.toFixed(4),
      custoFixoPorTon:   +fixoRateadoPorTon.toFixed(4),
      custoTribPorTon:   +custoTrib.toFixed(4),
      custoTotalPorTon:  +custoTotal.toFixed(4),
      precoVenda:        precoV || null,
      margemBruta:       margemBruta !== null ? +margemBruta.toFixed(2) : null,
      margemContrib:     margemContrib !== null ? +margemContrib.toFixed(2) : null,
      pontoEquilibrio:   peq !== null ? +peq.toFixed(0) : null,
      receitaMensal:     precoV > 0 ? +(precoV * prod).toFixed(2) : null,
      custoMensal:       +(custoTotal * prod).toFixed(2),
    }
  })

  return {
    tipoProduto: previsao.tipoProduto,
    producaoTon: prod,
    modos: resultadoModos,
  }
}

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

/** GET /custo-operacional — lista todas as configs por mês */
export async function list(req: AuthRequest, res: Response) {
  const configs = await prisma.custoOpConfig.findMany({
    orderBy: { mesReferencia: 'desc' },
    include: { previsoes: true },
  })
  res.json(configs)
}

/** GET /custo-operacional/:id — detalhe de uma config */
export async function getById(req: AuthRequest, res: Response) {
  const cfg = await prisma.custoOpConfig.findUnique({
    where: { id: req.params.id },
    include: { previsoes: true },
  })
  if (!cfg) throw new AppError('Configuração não encontrada', 404)
  res.json(cfg)
}

/** GET /custo-operacional/mes/:ano/:mes — busca ou cria config do mês */
export async function getOrCreateMes(req: AuthRequest, res: Response) {
  const { ano, mes } = req.params
  const mesRef = new Date(Number(ano), Number(mes) - 1, 1)

  let cfg = await prisma.custoOpConfig.findUnique({
    where: { mesReferencia: mesRef },
    include: { previsoes: true },
  })

  if (!cfg) {
    // Clonar config do mês anterior se existir
    const mesAnterior = new Date(mesRef)
    mesAnterior.setMonth(mesAnterior.getMonth() - 1)

    const anterior = await prisma.custoOpConfig.findUnique({
      where: { mesReferencia: mesAnterior },
      include: { previsoes: true },
    })

    if (anterior) {
      const { id: _, mesReferencia: __, createdAt: ___, updatedAt: ____, previsoes, ...campos } = anterior as any
      cfg = await prisma.custoOpConfig.create({
        data: {
          ...campos,
          mesReferencia: mesRef,
          previsoes: {
            create: previsoes.map(({ id: _id, configId: _cid, ...p }: any) => p),
          },
        },
        include: { previsoes: true },
      })
    } else {
      cfg = await prisma.custoOpConfig.create({
        data: {
          mesReferencia: mesRef,
          prodPrevistaTon: 15000,
          previsoes: {
            create: [
              { tipoProduto: 'CBUQ', producaoTon: 7000, precoVendaC: 620, precoVendaSc: 285, precoVendaSp: 95, precoVendaSb: 72 },
              { tipoProduto: 'PMF', producaoTon: 1200, precoVendaC: 480, precoVendaSc: 230, precoVendaSp: 85, precoVendaSb: 60 },
              { tipoProduto: 'TSD', producaoTon: 400, precoVendaC: 520, precoVendaSc: 255, precoVendaSp: 90, precoVendaSb: 65 },
            ],
          },
        },
        include: { previsoes: true },
      })
    }
  }

  res.json(cfg)
}

/** POST /custo-operacional — criar nova config */
export async function create(req: AuthRequest, res: Response) {
  const { mesReferencia, previsoes, ...campos } = req.body

  const mesRef = new Date(mesReferencia)
  mesRef.setDate(1) // garante 1º dia do mês

  const existe = await prisma.custoOpConfig.findUnique({ where: { mesReferencia: mesRef } })
  if (existe) throw new AppError('Já existe configuração para este mês', 409)

  const cfg = await prisma.custoOpConfig.create({
    data: {
      ...campos,
      mesReferencia: mesRef,
      previsoes: previsoes ? { create: previsoes } : undefined,
    },
    include: { previsoes: true },
  })

  res.status(201).json(cfg)
}

/** PUT /custo-operacional/:id — atualizar config */
export async function update(req: AuthRequest, res: Response) {
  const { previsoes, mesReferencia: _, ...campos } = req.body

  const cfg = await prisma.custoOpConfig.update({
    where: { id: req.params.id },
    data: campos,
  })

  // Upsert das previsões por produto
  if (previsoes?.length) {
    await Promise.all(
      previsoes.map((p: PrevisaoInput) =>
        prisma.custoOpPrevisao.upsert({
          where: { configId_tipoProduto: { configId: cfg.id, tipoProduto: p.tipoProduto } },
          update: {
            producaoTon: p.producaoTon,
            precoVendaC:  p.precoVendaC,
            precoVendaSc: p.precoVendaSc,
            precoVendaSp: p.precoVendaSp,
            precoVendaSb: p.precoVendaSb,
          },
          create: { configId: cfg.id, ...p },
        }),
      ),
    )
  }

  const atualizado = await prisma.custoOpConfig.findUnique({
    where: { id: cfg.id },
    include: { previsoes: true },
  })
  res.json(atualizado)
}

/** GET /custo-operacional/:id/calcular — retorna o cálculo completo de margem */
export async function calcular(req: AuthRequest, res: Response) {
  const cfg = await prisma.custoOpConfig.findUnique({
    where: { id: req.params.id },
    include: { previsoes: true },
  })
  if (!cfg) throw new AppError('Configuração não encontrada', 404)

  const precos = await getPrecosVigentes()
  const totalFixo = calcTotalFixo(cfg)
  const cargaTrib = calcCargaTrib(cfg)
  const prodSoma = cfg.previsoes.reduce((s, p) => s + Number(p.producaoTon), 0)

  const resultados = cfg.previsoes
    .map(p => calcResultado(p as any, cfg, precos, totalFixo, prodSoma, cargaTrib))
    .filter(Boolean)

  const totalReceita = resultados.reduce(
    (s, r) => s + (r!.modos[0].receitaMensal ?? 0), 0,
  )
  const totalCusto = resultados.reduce(
    (s, r) => s + r!.modos[0].custoMensal, 0,
  )

  res.json({
    mesReferencia: cfg.mesReferencia,
    resumo: {
      totalFixoMes: +totalFixo.toFixed(2),
      cargaTribPerc: +cargaTrib.toFixed(4),
      custoUtil: {
        comBPF: +calcCustoUtil(cfg).toFixed(4),
        semBPF: +calcCustoUtil(cfg, true).toFixed(4),
      },
      prodSoma: +prodSoma.toFixed(2),
      fixoRateadoPorTon: prodSoma > 0 ? +(totalFixo / prodSoma).toFixed(4) : 0,
      totalReceitaMes: +totalReceita.toFixed(2),
      totalCustoMes:   +totalCusto.toFixed(2),
      resultadoMes:    +(totalReceita - totalCusto).toFixed(2),
      margemGeralPerc: totalReceita > 0
        ? +((totalReceita - totalCusto) / totalReceita * 100).toFixed(2)
        : 0,
    },
    produtos: resultados,
  })
}
