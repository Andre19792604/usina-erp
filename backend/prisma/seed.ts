import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin padrão
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@usina.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@usina.com', password, role: 'ADMIN' },
  })

  // Materiais base de uma usina de asfalto
  const materials = [
    { code: 'CAP-50/70', name: 'CAP 50/70', category: 'CAP', unit: 'TON', minStock: 50 },
    { code: 'CAP-30/45', name: 'CAP 30/45', category: 'CAP', unit: 'TON', minStock: 30 },
    { code: 'BRIT-0', name: 'Brita 0 (4,75–9,5mm)', category: 'AGREGADO_GRAU', unit: 'TON', minStock: 200 },
    { code: 'BRIT-1', name: 'Brita 1 (9,5–19mm)', category: 'AGREGADO_GRAU', unit: 'TON', minStock: 200 },
    { code: 'BRIT-2', name: 'Brita 2 (19–25mm)', category: 'AGREGADO_GRAU', unit: 'TON', minStock: 100 },
    { code: 'PO-PEDRA', name: 'Pó de Pedra', category: 'PO_PEDRA', unit: 'TON', minStock: 150 },
    { code: 'AREIA-M', name: 'Areia Média', category: 'AREIA', unit: 'TON', minStock: 100 },
    { code: 'CAL-HID', name: 'Cal Hidratada', category: 'CAL', unit: 'TON', minStock: 20 },
    { code: 'OLEO-COM', name: 'Óleo Combustível', category: 'COMBUSTIVEL', unit: 'LITRO', minStock: 5000 },
  ]

  for (const m of materials) {
    await prisma.material.upsert({
      where: { code: m.code },
      update: {},
      create: m as any,
    })
  }

  // Produto padrão
  await prisma.product.upsert({
    where: { code: 'CBUQ-BC' },
    update: {},
    create: {
      code: 'CBUQ-BC',
      name: 'CBUQ Binder Course (Capa de Rolamento)',
      type: 'CBUQ',
      unitPrice: 280,
    },
  })

  console.log('Seed executado com sucesso!')
  console.log('Login: admin@usina.com | Senha: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
