import { useEffect, useState, useCallback } from 'react'
import {
  Row, Col, Card, Form, InputNumber, Select, DatePicker,
  Button, Tabs, Statistic, Tag, Divider, Spin, message, Typography, Space, Tooltip,
} from 'antd'
import {
  SaveOutlined, CalculatorOutlined,
  ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { custoOpService } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ModoResult {
  modo: string
  custoInsumoPorTon: number
  custoUtilPorTon: number
  custoFixoPorTon: number
  custoTribPorTon: number
  custoTotalPorTon: number
  precoVenda: number | null
  margemBruta: number | null
  margemContrib: number | null
  pontoEquilibrio: number | null
  receitaMensal: number | null
  custoMensal: number
}

interface ProdutoResult {
  tipoProduto: string
  producaoTon: number
  modos: ModoResult[]
}

interface Resumo {
  totalFixoMes: number
  cargaTribPerc: number
  custoUtil: { comBPF: number; semBPF: number }
  prodSoma: number
  fixoRateadoPorTon: number
  totalReceitaMes: number
  totalCustoMes: number
  resultadoMes: number
  margemGeralPerc: number
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MODOS = [
  { id: 'COMPLETO',      label: 'Fornecimento Completo', color: '#22c55e', desc: 'CAP + agregados + BPF' },
  { id: 'SEM_CAP',       label: 'Sem CAP',               color: '#f59e0b', desc: 'Cliente fornece o CAP/emulsão' },
  { id: 'SEM_CAP_PEDRA', label: 'Sem CAP + Pedra',       color: '#60a5fa', desc: 'Cliente fornece CAP e agregados' },
  { id: 'SO_USINAGEM',   label: 'Só Usinagem',           color: '#a78bfa', desc: 'Sem CAP, pedra e BPF' },
]

const PRODUTOS = [
  { value: 'CBUQ',   label: 'CBUQ (BC / CR / CF)' },
  { value: 'PMF',    label: 'PMF I' },
  { value: 'TSD',    label: 'TSD' },
  { value: 'MICROSF',label: 'Microrevestimento' },
  { value: 'SMA',    label: 'SMA' },
]

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtPct = (v: number | null) =>
  v !== null ? `${v.toFixed(1)}%` : '—'

function corMargem(v: number | null): string {
  if (v === null) return '#64748b'
  if (v >= 20) return '#22c55e'
  if (v >= 10) return '#f59e0b'
  return '#ef4444'
}

// ─── Card de resultado por modo ───────────────────────────────────────────────

function ModoCard({ modo, resultado }: { modo: typeof MODOS[0]; resultado: ModoResult }) {
  const margem = resultado.margemBruta

  return (
    <Card
      size="small"
      style={{
        borderTop: `3px solid ${modo.color}`,
        background: '#0d1929',
        height: '100%',
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Tag color={modo.color} style={{ marginBottom: 4 }}>{modo.label}</Tag>
        <br />
        <Text style={{ fontSize: 11, color: '#64748b' }}>{modo.desc}</Text>
      </div>
      <Divider style={{ margin: '8px 0', borderColor: '#1e3a5f' }} />

      <Row gutter={[4, 4]}>
        <Col span={12}><Text style={{ fontSize: 11, color: '#94a3b8' }}>Insumos/ton</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12 }}>{fmt(resultado.custoInsumoPorTon)}</Text>
        </Col>
        <Col span={12}><Text style={{ fontSize: 11, color: '#94a3b8' }}>Combust./ton</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12 }}>{fmt(resultado.custoUtilPorTon)}</Text>
        </Col>
        <Col span={12}><Text style={{ fontSize: 11, color: '#94a3b8' }}>Fixo rat./ton</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12 }}>{fmt(resultado.custoFixoPorTon)}</Text>
        </Col>
        <Col span={12}><Text style={{ fontSize: 11, color: '#94a3b8' }}>Tributos/ton</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12 }}>{fmt(resultado.custoTribPorTon)}</Text>
        </Col>
      </Row>

      <Divider style={{ margin: '8px 0', borderColor: '#1e3a5f' }} />

      <Row>
        <Col span={12}><Text style={{ fontSize: 12, fontWeight: 700 }}>Custo Total/ton</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
            {fmt(resultado.custoTotalPorTon)}
          </Text>
        </Col>
        <Col span={12}><Text style={{ fontSize: 12, color: '#94a3b8' }}>Preço venda</Text></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12 }}>
            {resultado.precoVenda ? fmt(resultado.precoVenda) : '—'}
          </Text>
        </Col>
      </Row>

      <Divider style={{ margin: '8px 0', borderColor: '#1e3a5f' }} />

      <Row gutter={4}>
        <Col span={12}>
          <div style={{ background: '#0f172a', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Margem Bruta</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: corMargem(margem) }}>
              {fmtPct(margem)}
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ background: '#0f172a', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Margem Contrib.</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: corMargem(resultado.margemContrib) }}>
              {fmtPct(resultado.margemContrib)}
            </div>
          </div>
        </Col>
      </Row>

      {resultado.pontoEquilibrio !== null && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
          Ponto de equilíbrio: <strong style={{ color: '#a78bfa' }}>{resultado.pontoEquilibrio.toLocaleString('pt-BR')} ton</strong>
        </div>
      )}
    </Card>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function CustoOperacionalPage() {
  const [formGeral] = Form.useForm()
  const [formTrib]  = Form.useForm()
  const [formComb]  = Form.useForm()

  const [configId, setConfigId]   = useState<string | null>(null)
  const [resumo,   setResumo]     = useState<Resumo | null>(null)
  const [produtos, setProdutos]   = useState<ProdutoResult[]>([])
  const [loading,  setLoading]    = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)

  // Previsões editáveis
  const [previsoes, setPrevisoes] = useState<Record<string, {
    producaoTon: number
    precoVendaC?: number; precoVendaSc?: number
    precoVendaSp?: number; precoVendaSb?: number
  }>>({})

  const mesAtual = dayjs()

  // ── Carrega config do mês ─────────────────────────────────────────────────
  const carregarMes = useCallback(async (date: dayjs.Dayjs) => {
    setLoading(true)
    try {
      const cfg = await custoOpService.getOrCreateMes(date.year(), date.month() + 1)
      setConfigId(cfg.id)

      formGeral.setFieldsValue({
        mesReferencia:   dayjs(cfg.mesReferencia),
        regimeTrib:      cfg.regimeTrib,
        prodPrevistaTon: Number(cfg.prodPrevistaTon),
        diasOperacao:    cfg.diasOperacao,
        horasPorDia:     cfg.horasPorDia,
        folhaSalarial:   Number(cfg.folhaSalarial),
        encargos:        Number(cfg.encargos),
        aluguel:         Number(cfg.aluguel),
        depreciacao:     Number(cfg.depreciacao),
        energiaFixa:     Number(cfg.energiaFixa),
        manutencao:      Number(cfg.manutencao),
        seguros:         Number(cfg.seguros),
        locacaoEquip:    Number(cfg.locacaoEquip),
        outrosFixos:     Number(cfg.outrosFixos),
      })

      formTrib.setFieldsValue({
        pis: Number(cfg.pis), cofins: Number(cfg.cofins),
        iss: Number(cfg.iss), icms: Number(cfg.icms),
        irpj: Number(cfg.irpj), csll: Number(cfg.csll),
      })

      formComb.setFieldsValue({
        dieselLTon: Number(cfg.dieselLTon), dieselPreco: Number(cfg.dieselPreco),
        bpfLTon: Number(cfg.bpfLTon), bpfPreco: Number(cfg.bpfPreco),
        energiaKwhTon: Number(cfg.energiaKwhTon), energiaTarifa: Number(cfg.energiaTarifa),
      })

      const prev: typeof previsoes = {}
      cfg.previsoes.forEach((p: any) => {
        prev[p.tipoProduto] = {
          producaoTon:  Number(p.producaoTon),
          precoVendaC:  p.precoVendaC  ? Number(p.precoVendaC)  : undefined,
          precoVendaSc: p.precoVendaSc ? Number(p.precoVendaSc) : undefined,
          precoVendaSp: p.precoVendaSp ? Number(p.precoVendaSp) : undefined,
          precoVendaSb: p.precoVendaSb ? Number(p.precoVendaSb) : undefined,
        }
      })
      setPrevisoes(prev)

      await calcularResultado(cfg.id)
    } catch {
      message.error('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregarMes(mesAtual) }, [])

  // ── Salvar ─────────────────────────────────────────────────────────────────
  const salvar = async () => {
    const [geral, trib, comb] = await Promise.all([
      formGeral.validateFields(),
      formTrib.validateFields(),
      formComb.validateFields(),
    ])

    const payload = {
      ...geral,
      ...trib,
      ...comb,
      mesReferencia: geral.mesReferencia.startOf('month').toISOString(),
      previsoes: PRODUTOS.map(p => ({
        tipoProduto: p.value,
        ...(previsoes[p.value] ?? { producaoTon: 0 }),
      })),
    }

    try {
      if (configId) {
        await custoOpService.update(configId, payload)
      } else {
        const novo = await custoOpService.create(payload)
        setConfigId(novo.id)
      }
      message.success('Configuração salva!')
      if (configId) await calcularResultado(configId)
    } catch {
      message.error('Erro ao salvar')
    }
  }

  // ── Calcular ──────────────────────────────────────────────────────────────
  const calcularResultado = async (id: string) => {
    setCalcLoading(true)
    try {
      const resultado = await custoOpService.calcular(id)
      setResumo(resultado.resumo)
      setProdutos(resultado.produtos ?? [])
    } catch {
      // Silently ignore if not saved yet
    } finally {
      setCalcLoading(false)
    }
  }

  const setPrev = (produto: string, field: string, val: number | null) => {
    setPrevisoes(prev => ({
      ...prev,
      [produto]: { ...(prev[produto] ?? { producaoTon: 0 }), [field]: val ?? undefined },
    }))
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Custo Operacional</Title>
          <Text style={{ color: '#64748b' }}>Custo por tonelada, margem por produto e ponto de equilíbrio</Text>
        </div>
        <Space>
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => configId && calcularResultado(configId)}
            loading={calcLoading}
          >
            Recalcular
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={salvar}>
            Salvar
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* ═══ COLUNA DE INPUTS ═══ */}
        <Col xs={24} xl={14}>
          <Tabs
            items={[
              {
                key: 'geral',
                label: '⚙ Parâmetros',
                children: (
                  <Card>
                    <Form form={formGeral} layout="vertical">
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item label="Mês de Referência" name="mesReferencia">
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              style={{ width: '100%' }}
                              onChange={d => d && carregarMes(d)}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Regime Tributário" name="regimeTrib">
                            <Select options={[
                              { value: 'PRESUMIDO', label: 'Lucro Presumido' },
                              { value: 'REAL',      label: 'Lucro Real' },
                              { value: 'SIMPLES',   label: 'Simples Nacional' },
                            ]} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Produção Prevista (ton/mês)" name="prodPrevistaTon">
                            <InputNumber style={{ width: '100%' }} min={0} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Dias de Operação / Mês" name="diasOperacao">
                            <InputNumber style={{ width: '100%' }} min={1} max={31} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Horas / Dia" name="horasPorDia">
                            <InputNumber style={{ width: '100%' }} min={1} max={24} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider titlePlacement="left" style={{ fontSize: 13 }}>Custos Fixos Mensais (R$)</Divider>
                      <Row gutter={12}>
                        {[
                          ['folhaSalarial', 'Folha Salarial Bruta'],
                          ['encargos', 'Encargos (FGTS + INSS)'],
                          ['aluguel', 'Aluguel / Arrendamento'],
                          ['depreciacao', 'Depreciação de Equipamentos'],
                          ['energiaFixa', 'Energia Elétrica (Demanda Fixa)'],
                          ['manutencao', 'Manutenção Preventiva'],
                          ['seguros', 'Seguros e Taxas'],
                          ['locacaoEquip', 'Locação de Equipamentos'],
                          ['outrosFixos', 'Outros Custos Fixos'],
                        ].map(([name, label]) => (
                          <Col span={8} key={name}>
                            <Form.Item label={label} name={name}>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={v => `R$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={v => v?.replace(/R\$\s?|(\.)/g, '').replace(',', '.') as any}
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </Form>
                  </Card>
                ),
              },
              {
                key: 'tributos',
                label: '📋 Carga Tributária',
                children: (
                  <Card>
                    <Form form={formTrib} layout="vertical">
                      <Row gutter={12}>
                        {[
                          ['pis', 'PIS (%)'],
                          ['cofins', 'COFINS (%)'],
                          ['iss', 'ISS (%)'],
                          ['icms', 'ICMS (%)'],
                          ['irpj', 'IRPJ (%)'],
                          ['csll', 'CSLL (%)'],
                        ].map(([name, label]) => (
                          <Col span={8} key={name}>
                            <Form.Item label={label} name={name}>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0} max={100} step={0.01}
                                addonAfter="%"
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                      {resumo && (
                        <Card style={{ background: '#0f172a', border: '1px solid #1e3a5f' }}>
                          <Statistic
                            title="Carga Tributária Total"
                            value={resumo.cargaTribPerc}
                            suffix="%"
                            valueStyle={{ color: '#ef4444' }}
                          />
                        </Card>
                      )}
                    </Form>
                  </Card>
                ),
              },
              {
                key: 'combustiveis',
                label: '⛽ Combustíveis',
                children: (
                  <Card>
                    <Form form={formComb} layout="vertical">
                      {[
                        { title: 'Diesel S-10', fields: [['dieselLTon', 'Consumo (L/ton)', 0.1], ['dieselPreco', 'Preço (R$/L)', 0.01]] },
                        { title: 'Óleo BPF (queimador)', fields: [['bpfLTon', 'Consumo (L/ton)', 0.1], ['bpfPreco', 'Preço (R$/L)', 0.01]] },
                        { title: 'Energia Elétrica', fields: [['energiaKwhTon', 'Consumo (kWh/ton)', 0.1], ['energiaTarifa', 'Tarifa (R$/kWh)', 0.001]] },
                      ].map(({ title, fields }) => (
                        <div key={title}>
                          <Divider titlePlacement="left" style={{ fontSize: 13 }}>{title}</Divider>
                          <Row gutter={12}>
                            {fields.map(([name, label, step]) => (
                              <Col span={12} key={name as string}>
                                <Form.Item label={label as string} name={name as string}>
                                  <InputNumber
                                    style={{ width: '100%' }}
                                    min={0} step={step as number}
                                  />
                                </Form.Item>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                      {resumo && (
                        <Row gutter={12} style={{ marginTop: 8 }}>
                          <Col span={12}>
                            <Card size="small" style={{ background: '#0f172a', border: '1px solid #f59e0b44' }}>
                              <Statistic
                                title="Custo util. c/ BPF/ton"
                                value={resumo.custoUtil.comBPF}
                                prefix="R$"
                                precision={2}
                                valueStyle={{ color: '#f59e0b', fontSize: 18 }}
                              />
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card size="small" style={{ background: '#0f172a', border: '1px solid #a78bfa44' }}>
                              <Statistic
                                title="Custo util. s/ BPF/ton"
                                value={resumo.custoUtil.semBPF}
                                prefix="R$"
                                precision={2}
                                valueStyle={{ color: '#a78bfa', fontSize: 18 }}
                              />
                            </Card>
                          </Col>
                        </Row>
                      )}
                    </Form>
                  </Card>
                ),
              },
              {
                key: 'previsoes',
                label: '📦 Previsão por Produto',
                children: (
                  <Card>
                    {PRODUTOS.map(prod => (
                      <div key={prod.value} style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ color: '#94a3b8', marginBottom: 12 }}>
                          {prod.label}
                        </Title>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item label="Produção prevista (ton/mês)">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                value={previsoes[prod.value]?.producaoTon}
                                onChange={v => setPrev(prod.value, 'producaoTon', v)}
                              />
                            </Form.Item>
                          </Col>
                          {MODOS.map(modo => (
                            <Col span={4} key={modo.id}>
                              <Form.Item
                                label={
                                  <Tooltip title={modo.desc}>
                                    <span style={{ color: modo.color, fontSize: 11 }}>
                                      {modo.label} <InfoCircleOutlined />
                                    </span>
                                  </Tooltip>
                                }
                              >
                                <InputNumber
                                  style={{ width: '100%' }}
                                  min={0}
                                  prefix="R$"
                                  value={(previsoes[prod.value] as any)?.[
                                    { COMPLETO: 'precoVendaC', SEM_CAP: 'precoVendaSc',
                                      SEM_CAP_PEDRA: 'precoVendaSp', SO_USINAGEM: 'precoVendaSb' }[modo.id]!
                                  ]}
                                  onChange={v => setPrev(prod.value,
                                    { COMPLETO: 'precoVendaC', SEM_CAP: 'precoVendaSc',
                                      SEM_CAP_PEDRA: 'precoVendaSp', SO_USINAGEM: 'precoVendaSb' }[modo.id]!,
                                    v,
                                  )}
                                />
                              </Form.Item>
                            </Col>
                          ))}
                        </Row>
                        <Divider style={{ margin: '8px 0', borderColor: '#1e3a5f' }} />
                      </div>
                    ))}
                  </Card>
                ),
              },
            ]}
          />
        </Col>

        {/* ═══ COLUNA DE RESULTADOS ═══ */}
        <Col xs={24} xl={10}>
          <Spin spinning={calcLoading}>
            {resumo && (
              <>
                {/* KPIs gerais */}
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Card size="small" style={{ border: '1px solid #f59e0b44' }}>
                      <Statistic
                        title="Custo Total / Mês"
                        value={resumo.totalCustoMes}
                        prefix="R$"
                        precision={0}
                        valueStyle={{ color: '#f59e0b', fontSize: 20 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ border: '1px solid #22c55e44' }}>
                      <Statistic
                        title="Receita Prevista / Mês"
                        value={resumo.totalReceitaMes}
                        prefix="R$"
                        precision={0}
                        valueStyle={{ color: '#22c55e', fontSize: 20 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ border: `1px solid ${resumo.resultadoMes >= 0 ? '#22c55e' : '#ef4444'}44` }}>
                      <Statistic
                        title="Resultado Mensal"
                        value={Math.abs(resumo.resultadoMes)}
                        prefix={resumo.resultadoMes >= 0 ? 'R$ +' : 'R$ -'}
                        precision={0}
                        valueStyle={{ color: resumo.resultadoMes >= 0 ? '#22c55e' : '#ef4444', fontSize: 20 }}
                        suffix={
                          resumo.resultadoMes >= 0
                            ? <ArrowUpOutlined style={{ color: '#22c55e' }} />
                            : <ArrowDownOutlined style={{ color: '#ef4444' }} />
                        }
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ border: `1px solid ${corMargem(resumo.margemGeralPerc)}44` }}>
                      <Statistic
                        title="Margem Geral"
                        value={resumo.margemGeralPerc}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: corMargem(resumo.margemGeralPerc), fontSize: 20 }}
                      />
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ border: '1px solid #60a5fa44' }}>
                      <Row>
                        <Col span={12}>
                          <Statistic
                            title="Custo Fixo Rateado / ton"
                            value={resumo.fixoRateadoPorTon}
                            prefix="R$"
                            precision={2}
                            valueStyle={{ color: '#60a5fa', fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Produção total prevista"
                            value={resumo.prodSoma}
                            suffix="ton"
                            precision={0}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* Resultados por produto */}
                {produtos.map(prod => (
                  <Card
                    key={prod.tipoProduto}
                    size="small"
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{PRODUTOS.find(p => p.value === prod.tipoProduto)?.label ?? prod.tipoProduto}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>
                          {prod.producaoTon.toLocaleString('pt-BR')} ton/mês
                        </Text>
                      </div>
                    }
                    style={{ marginBottom: 12, background: '#0d1929' }}
                  >
                    <Row gutter={[8, 8]}>
                      {prod.modos.map(modoRes => {
                        const modo = MODOS.find(m => m.id === modoRes.modo)!
                        return (
                          <Col span={12} key={modoRes.modo}>
                            <ModoCard modo={modo} resultado={modoRes} />
                          </Col>
                        )
                      })}
                    </Row>
                  </Card>
                ))}
              </>
            )}

            {!resumo && !calcLoading && (
              <Card style={{ textAlign: 'center', padding: 40 }}>
                <CalculatorOutlined style={{ fontSize: 48, color: '#1e3a5f', marginBottom: 16 }} />
                <br />
                <Text style={{ color: '#64748b' }}>
                  Preencha os parâmetros e clique em <strong>Salvar</strong> para ver o cálculo
                </Text>
              </Card>
            )}
          </Spin>
        </Col>
      </Row>
    </Spin>
  )
}
