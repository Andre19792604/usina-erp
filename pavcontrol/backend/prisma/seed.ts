import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Empresa padrão
  const company = await prisma.company.upsert({
    where: { cnpj: '00000000000100' },
    update: {},
    create: {
      name: 'PavControl Demo',
      cnpj: '00000000000100',
      phone: '(11) 99999-9999',
      email: 'contato@pavcontrol.com',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  // Admin padrão
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@pavcontrol.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@pavcontrol.com',
      password,
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  // Serviços base de pavimentação
  const services = [
    { code: 'SRV-PAV', name: 'Pavimentação Asfáltica', unit: 'TON' },
    { code: 'SRV-IMP', name: 'Imprimação', unit: 'M2' },
    { code: 'SRV-PIN', name: 'Pintura de Ligação', unit: 'M2' },
    { code: 'SRV-TAP', name: 'Tapa-Buraco', unit: 'TON' },
    { code: 'SRV-FRE', name: 'Fresagem', unit: 'M2' },
    { code: 'SRV-MIC', name: 'Microrrevestimento', unit: 'M2' },
    { code: 'SRV-TSD', name: 'Tratamento Superficial', unit: 'M2' },
    { code: 'SRV-TER', name: 'Terraplanagem', unit: 'M3' },
    { code: 'SRV-DRE', name: 'Drenagem', unit: 'ML' },
    { code: 'SRV-SIN', name: 'Sinalização', unit: 'ML' },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: {},
      create: { ...s, companyId: company.id },
    })
  }

  console.log('Seed executado com sucesso!')
  console.log('Login: admin@pavcontrol.com | Senha: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
