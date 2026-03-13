-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'OPERADOR', 'FINANCEIRO', 'VENDAS', 'COMPRAS', 'BALANCA', 'MANUTENCAO', 'VIEWER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'TANKER', 'PICKUP', 'MACHINE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('TON', 'KG', 'LITRO', 'M3', 'UNIDADE');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('CAP', 'AGREGADO_GRAU', 'PEDRISCO', 'PO_PEDRA', 'AREIA', 'CAL', 'ADITIVO', 'OLEO_BPF', 'DIESEL', 'COMBUSTIVEL', 'OUTRO');

-- CreateEnum
CREATE TYPE "StockOwner" AS ENUM ('USINA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "MixtureType" AS ENUM ('CBUQ', 'PMF', 'TSD', 'TSS', 'MICROSF', 'SMA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRADA_COMPRA', 'ENTRADA_DEVOLUCAO', 'SAIDA_PRODUCAO', 'SAIDA_VENDA', 'SAIDA_PERDA', 'AJUSTE_INVENTARIO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "ClientStockMovementType" AS ENUM ('ENTRADA', 'CONSUMO', 'PERDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "LossReason" AS ENUM ('TEMPERATURA', 'UMIDADE', 'CONTAMINACAO', 'EQUIPAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('OPEN', 'IN_PRODUCTION', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('OPEN', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DINHEIRO', 'BOLETO', 'PIX', 'TRANSFERENCIA', 'CHEQUE', 'CARTAO');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDENTE', 'EMITIDA', 'CANCELADA', 'DENEGADA', 'INUTILIZADA');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('USINA', 'VEICULO', 'BALANCA', 'ELETRICO', 'HIDRAULICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegimeTrib" AS ENUM ('PRESUMIDO', 'REAL', 'SIMPLES');

-- CreateEnum
CREATE TYPE "TipoFornecimento" AS ENUM ('COMPLETO', 'SEM_CAP', 'SEM_CAP_PEDRA', 'SO_USINAGEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERADOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "stateReg" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "creditLimit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "stateReg" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "fireDate" TIMESTAMP(3),
    "salary" DECIMAL(12,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "capacity" DECIMAL(10,2),
    "tare" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL,
    "unit" "MaterialUnit" NOT NULL,
    "density" DECIMAL(8,4),
    "minStock" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MixtureType" NOT NULL,
    "description" TEXT,
    "unitPrice" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "unit" "MaterialUnit" NOT NULL DEFAULT 'TON',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formula_items" (
    "id" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "percentage" DECIMAL(8,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formula_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "formulaId" TEXT,
    "plannedQty" DECIMAL(14,2) NOT NULL,
    "producedQty" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "operatorId" TEXT,
    "temperature" DECIMAL(6,2),
    "notes" TEXT,
    "salesOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_controls" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DECIMAL(6,2),
    "density" DECIMAL(8,4),
    "vv" DECIMAL(6,2),
    "vam" DECIMAL(6,2),
    "rbd" DECIMAL(8,4),
    "stability" DECIMAL(10,2),
    "fluency" DECIMAL(6,2),
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitCost" DECIMAL(14,4) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "productionOrderId" TEXT,
    "purchaseOrderId" TEXT,
    "lossId" TEXT,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_stocks" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_stock_movements" (
    "id" TEXT NOT NULL,
    "clientStockId" TEXT NOT NULL,
    "type" "ClientStockMovementType" NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "salesOrderId" TEXT,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_losses" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "quantity" DECIMAL(14,2) NOT NULL,
    "reason" "LossReason" NOT NULL,
    "temperature" DECIMAL(6,2),
    "description" TEXT,
    "registeredById" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operational_losses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tests" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "productId" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicianName" TEXT,
    "temperature" DECIMAL(6,2),
    "capContent" DECIMAL(6,3),
    "density" DECIMAL(8,4),
    "vv" DECIMAL(6,2),
    "vam" DECIMAL(6,2),
    "rbv" DECIMAL(6,2),
    "stability" DECIMAL(10,2),
    "fluency" DECIMAL(6,2),
    "stabilityMin" DECIMAL(10,2),
    "vvMin" DECIMAL(6,2),
    "vvMax" DECIMAL(6,2),
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "pdfPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_tickets" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "driverName" TEXT,
    "grossWeight" DECIMAL(10,2) NOT NULL,
    "tare" DECIMAL(10,2) NOT NULL,
    "netWeight" DECIMAL(10,2) NOT NULL,
    "operatorId" TEXT,
    "salesOrderId" TEXT,
    "notes" TEXT,
    "weighedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "quoteId" TEXT,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'OPEN',
    "deliveryDate" TIMESTAMP(3),
    "address" TEXT,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalValue" DECIMAL(14,2) NOT NULL,
    "description" TEXT,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "expectedDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "receivedQty" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_payable" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'OPEN',
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_receivable" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'OPEN',
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "serie" TEXT NOT NULL DEFAULT '001',
    "nature" TEXT NOT NULL DEFAULT 'Venda de Mercadoria',
    "clientId" TEXT,
    "salesOrderId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDENTE',
    "issueDate" TIMESTAMP(3),
    "chave" TEXT,
    "protocol" TEXT,
    "cancelReason" TEXT,
    "totalProducts" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalIcms" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalIpi" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalPis" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalCofins" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalNfe" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL DEFAULT '[]',
    "xmlContent" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "equipmentId" TEXT,
    "vehicleId" TEXT,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cost" DECIMAL(14,2),
    "technicianId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_readings" (
    "id" TEXT NOT NULL,
    "rawData" TEXT NOT NULL,
    "grossWeight" DECIMAL(10,2),
    "stable" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedIn" TEXT,

    CONSTRAINT "scale_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mx3000_readings" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "tempDrum" DECIMAL(6,2),
    "tempMixer" DECIMAL(6,2),
    "tempCap" DECIMAL(6,2),
    "tempOutput" DECIMAL(6,2),
    "batchWeight" DECIMAL(10,2),
    "batchCount" INTEGER,
    "totalProduced" DECIMAL(14,2),
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mx3000_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custo_op_configs" (
    "id" TEXT NOT NULL,
    "mesReferencia" TIMESTAMP(3) NOT NULL,
    "regimeTrib" "RegimeTrib" NOT NULL DEFAULT 'PRESUMIDO',
    "prodPrevistaTon" DECIMAL(10,2) NOT NULL,
    "diasOperacao" INTEGER NOT NULL DEFAULT 22,
    "horasPorDia" INTEGER NOT NULL DEFAULT 8,
    "folhaSalarial" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "encargos" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "aluguel" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "depreciacao" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "energiaFixa" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "manutencao" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "seguros" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "locacaoEquip" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outrosFixos" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pis" DECIMAL(6,4) NOT NULL DEFAULT 1.65,
    "cofins" DECIMAL(6,4) NOT NULL DEFAULT 7.60,
    "iss" DECIMAL(6,4) NOT NULL DEFAULT 0,
    "icms" DECIMAL(6,4) NOT NULL DEFAULT 12.00,
    "irpj" DECIMAL(6,4) NOT NULL DEFAULT 4.80,
    "csll" DECIMAL(6,4) NOT NULL DEFAULT 2.88,
    "dieselLTon" DECIMAL(8,4) NOT NULL DEFAULT 3.2,
    "dieselPreco" DECIMAL(8,4) NOT NULL DEFAULT 6.40,
    "bpfLTon" DECIMAL(8,4) NOT NULL DEFAULT 4.5,
    "bpfPreco" DECIMAL(8,4) NOT NULL DEFAULT 3.80,
    "energiaKwhTon" DECIMAL(8,4) NOT NULL DEFAULT 9.8,
    "energiaTarifa" DECIMAL(8,4) NOT NULL DEFAULT 0.775,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custo_op_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custo_op_previsoes" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "tipoProduto" "MixtureType" NOT NULL,
    "producaoTon" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precoVendaC" DECIMAL(10,2),
    "precoVendaSc" DECIMAL(10,2),
    "precoVendaSp" DECIMAL(10,2),
    "precoVendaSb" DECIMAL(10,2),

    CONSTRAINT "custo_op_previsoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_code_key" ON "clients"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpjCpf_key" ON "clients"("cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_cnpjCpf_key" ON "suppliers"("cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "employees_code_key" ON "employees"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_cpf_key" ON "employees"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_code_key" ON "formulas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formula_items_formulaId_materialId_key" ON "formula_items"("formulaId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_number_key" ON "production_orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "client_stocks_clientId_materialId_key" ON "client_stocks"("clientId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_number_key" ON "lab_tests"("number");

-- CreateIndex
CREATE UNIQUE INDEX "weight_tickets_number_key" ON "weight_tickets"("number");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_number_key" ON "quotes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_number_key" ON "sales_orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_number_key" ON "contracts"("number");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_number_key" ON "purchase_orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_code_key" ON "equipments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_orders_number_key" ON "maintenance_orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "custo_op_configs_mesReferencia_key" ON "custo_op_configs"("mesReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "custo_op_previsoes_configId_tipoProduto_key" ON "custo_op_previsoes"("configId", "tipoProduto");

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_items" ADD CONSTRAINT "formula_items_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_items" ADD CONSTRAINT "formula_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formulas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_controls" ADD CONSTRAINT "quality_controls_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_lossId_fkey" FOREIGN KEY ("lossId") REFERENCES "operational_losses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_stocks" ADD CONSTRAINT "client_stocks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_stocks" ADD CONSTRAINT "client_stocks_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_stock_movements" ADD CONSTRAINT "client_stock_movements_clientStockId_fkey" FOREIGN KEY ("clientStockId") REFERENCES "client_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_stock_movements" ADD CONSTRAINT "client_stock_movements_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_losses" ADD CONSTRAINT "operational_losses_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_tickets" ADD CONSTRAINT "weight_tickets_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_tickets" ADD CONSTRAINT "weight_tickets_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_tickets" ADD CONSTRAINT "weight_tickets_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_orders" ADD CONSTRAINT "maintenance_orders_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_orders" ADD CONSTRAINT "maintenance_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_orders" ADD CONSTRAINT "maintenance_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mx3000_readings" ADD CONSTRAINT "mx3000_readings_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custo_op_previsoes" ADD CONSTRAINT "custo_op_previsoes_configId_fkey" FOREIGN KEY ("configId") REFERENCES "custo_op_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
