import jsPDF from 'jspdf'

export interface LabTestData {
  number: string
  order: string
  product: string
  date: string
  tech: string
  temp: number
  cap: number
  density: number
  vv: number
  vam: number
  rbv: number
  stability: number
  fluency: number
  approved: boolean
  notes?: string
}

const limits = {
  vvMin: 3, vvMax: 5,
  vamMin: 15,
  rbvMin: 65, rbvMax: 75,
  stabilityMin: 500,
  fluencyMin: 2, fluencyMax: 4.5,
}

function checkOk(value: number, min?: number, max?: number) {
  return (min === undefined || value >= min) && (max === undefined || value <= max)
}

export function generateLabPDF(test: LabTestData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 15

  // ── Header ───────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, W, 40, 'F')

  doc.setTextColor(245, 158, 11)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('USINA ERP', margin, 16)

  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Gestão de Usina de Asfalto', margin, 23)
  doc.text('Laudo de Controle Tecnológico — Ensaio Marshall', margin, 30)

  // Result badge
  doc.setFillColor(test.approved ? 34 : 239, test.approved ? 197 : 68, test.approved ? 94 : 68)
  doc.roundedRect(W - margin - 30, 12, 30, 10, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(test.approved ? 'APROVADO' : 'REPROVADO', W - margin - 15, 18.5, { align: 'center' })

  // ── Info block ───────────────────────────────────────────────
  let y = 50

  doc.setFillColor(22, 32, 50)
  doc.roundedRect(margin, y - 5, W - 2 * margin, 38, 3, 3, 'F')

  const col1 = margin + 5
  const col2 = margin + 90
  doc.setFontSize(9)

  const infoRows = [
    ['Nº do Ensaio', test.number, 'Ordem de Produção', test.order],
    ['Produto', test.product, 'Laboratorista', test.tech],
    ['Data do Ensaio', test.date, 'Temperatura de Usinagem', `${test.temp}°C`],
  ]

  infoRows.forEach(([l1, v1, l2, v2], i) => {
    const rowY = y + i * 11
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(l1 + ':', col1, rowY + 4)
    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'bold')
    doc.text(v1, col1 + 35, rowY + 4)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(l2 + ':', col2, rowY + 4)
    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'bold')
    doc.text(v2, col2 + 45, rowY + 4)
  })

  y += 42

  // ── Parameters table ─────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 158, 11)
  doc.text('Parâmetros Marshall', margin, y)
  y += 6

  // Table header
  doc.setFillColor(13, 27, 46)
  doc.rect(margin, y, W - 2 * margin, 8, 'F')
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  const cols = [margin + 3, margin + 55, margin + 95, margin + 125, margin + 155]
  const headers = ['Parâmetro', 'Norma DNIT 031/2006', 'Valor Obtido', 'Status', 'Observação']
  headers.forEach((h, i) => doc.text(h, cols[i], y + 5.5))
  y += 10

  const params = [
    {
      name: '% CAP (Ligante)',
      norm: '4,5 – 6,0%',
      value: `${test.cap}%`,
      ok: checkOk(test.cap, 4.5, 6),
    },
    {
      name: 'Densidade Aparente',
      norm: '≥ 2,30 g/cm³',
      value: `${test.density} g/cm³`,
      ok: checkOk(test.density, 2.30),
    },
    {
      name: 'Volume de Vazios (VV)',
      norm: `${limits.vvMin} – ${limits.vvMax}%`,
      value: `${test.vv}%`,
      ok: checkOk(test.vv, limits.vvMin, limits.vvMax),
    },
    {
      name: 'VAM',
      norm: `≥ ${limits.vamMin}%`,
      value: `${test.vam}%`,
      ok: checkOk(test.vam, limits.vamMin),
    },
    {
      name: 'RBV',
      norm: `${limits.rbvMin} – ${limits.rbvMax}%`,
      value: `${test.rbv}%`,
      ok: checkOk(test.rbv, limits.rbvMin, limits.rbvMax),
    },
    {
      name: 'Estabilidade Marshall',
      norm: `≥ ${limits.stabilityMin} kgf`,
      value: `${test.stability} kgf`,
      ok: checkOk(test.stability, limits.stabilityMin),
    },
    {
      name: 'Fluência',
      norm: `${limits.fluencyMin} – ${limits.fluencyMax} mm`,
      value: `${test.fluency} mm`,
      ok: checkOk(test.fluency, limits.fluencyMin, limits.fluencyMax),
    },
  ]

  params.forEach((p, i) => {
    const rowY = y + i * 9
    doc.setFillColor(i % 2 === 0 ? 22 : 15, i % 2 === 0 ? 32 : 23, i % 2 === 0 ? 50 : 42)
    doc.rect(margin, rowY, W - 2 * margin, 9, 'F')

    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(p.name, cols[0], rowY + 6)

    doc.setTextColor(148, 163, 184)
    doc.text(p.norm, cols[1], rowY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(245, 158, 11)
    doc.text(p.value, cols[2], rowY + 6)

    // Status circle
    doc.setFillColor(p.ok ? 34 : 239, p.ok ? 197 : 68, p.ok ? 94 : 68)
    doc.circle(cols[3] + 4, rowY + 5, 2.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6)
    doc.text(p.ok ? 'OK' : 'NOK', cols[3] + 4, rowY + 5.8, { align: 'center' })

    doc.setTextColor(p.ok ? 34 : 239, p.ok ? 197 : 68, p.ok ? 94 : 68)
    doc.setFontSize(8)
    doc.text(p.ok ? 'Conforme' : 'Não Conforme', cols[4], rowY + 6)
  })

  y += params.length * 9 + 10

  // ── Conclusion box ───────────────────────────────────────────
  doc.setFillColor(test.approved ? 13 : 42, test.approved ? 42 : 13, test.approved ? 31 : 13)
  doc.roundedRect(margin, y, W - 2 * margin, 18, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(test.approved ? 34 : 239, test.approved ? 197 : 68, test.approved ? 94 : 68)
  doc.text(
    test.approved
      ? '✓  MASSA APROVADA — Todos os parâmetros dentro das especificações normativas.'
      : '✗  MASSA REPROVADA — Um ou mais parâmetros fora das especificações normativas.',
    margin + 5, y + 11
  )

  y += 25

  // Notes
  if (test.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(245, 158, 11)
    doc.text('Observações:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(test.notes, margin, y + 6)
    y += 14
  }

  // ── Footer ───────────────────────────────────────────────────
  const footerY = 280
  doc.setDrawColor(30, 58, 95)
  doc.line(margin, footerY, W - margin, footerY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(`Ensaio: ${test.number}  |  Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin, footerY + 6)
  doc.text('Norma de referência: DNIT ES 031/2006  |  Usina ERP — Sistema de Gestão', W - margin, footerY + 6, { align: 'right' })
  doc.text(`Laboratorista responsável: ${test.tech}`, margin, footerY + 12)

  doc.save(`Laudo_Marshall_${test.number}.pdf`)
}
