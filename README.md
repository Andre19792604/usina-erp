# Usina ERP

Sistema ERP completo para usina de asfalto.

## Módulos
- Autenticação e controle de acesso por perfil
- Cadastros (clientes, fornecedores, materiais, veículos, funcionários)
- Produção (ordens, fórmulas/traços, controle de qualidade)
- Estoque (insumos: CAP, brita, areia, cal)
- Balança / Pesagem
- Vendas (orçamentos, pedidos, contratos)
- Compras (cotações, pedidos de compra)
- Financeiro (contas a pagar/receber, fluxo de caixa)
- Manutenção (equipamentos, ordens de serviço)
- Relatórios e Dashboard

## Stack
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend:** React + Vite + TypeScript + Ant Design
- **Infra:** Docker Compose

## Início rápido

```bash
# Subir banco de dados
docker-compose up -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Estrutura
```
usina-erp/
├── backend/          # API REST
├── frontend/         # Interface web
└── docker-compose.yml
```
