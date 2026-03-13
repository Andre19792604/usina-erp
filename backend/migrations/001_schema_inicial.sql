-- ============================================================
-- USINA ERP — Schema inicial PostgreSQL
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- busca textual

-- ─────────────────────────────────────────────
-- DOMÍNIOS / TIPOS ENUMERADOS
-- ─────────────────────────────────────────────
CREATE TYPE papel_usuario  AS ENUM ('admin','gerente','operador','laboratorista','financeiro','comercial');
CREATE TYPE status_pedido  AS ENUM ('orcamento','confirmado','em_producao','entregue','cancelado');
CREATE TYPE tipo_mov_est    AS ENUM ('entrada','saida','ajuste','perda');
CREATE TYPE tipo_fornecimento AS ENUM ('completo','sem_cap','sem_cap_pedra','so_usinagem');
CREATE TYPE tipo_produto    AS ENUM ('CBUQ_BC','CBUQ_CR','PMF_I','TSD','MICROREVESTIMENTO','CBUQ_CF');
CREATE TYPE regime_trib     AS ENUM ('presumido','real','simples');

-- ─────────────────────────────────────────────
-- USUÁRIOS E ACESSO
-- ─────────────────────────────────────────────
CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  papel         papel_usuario NOT NULL DEFAULT 'operador',
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acesso TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessoes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip         INET,
  user_agent TEXT,
  expira_em  TIMESTAMPTZ NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CLIENTES
-- ─────────────────────────────────────────────
CREATE TABLE clientes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  cnpj_cpf    VARCHAR(20) UNIQUE,
  ie          VARCHAR(30),
  telefone    VARCHAR(20),
  email       VARCHAR(150),
  endereco    TEXT,
  cidade      VARCHAR(100),
  uf          CHAR(2),
  cep         VARCHAR(10),
  contato     VARCHAR(120),
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  obs         TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INSUMOS (CADASTRO MESTRE)
-- ─────────────────────────────────────────────
CREATE TABLE insumos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo      VARCHAR(20) UNIQUE NOT NULL,
  nome        VARCHAR(120) NOT NULL,
  unidade     VARCHAR(10) NOT NULL DEFAULT 'ton',  -- ton, L, kg, m3
  categoria   VARCHAR(50) NOT NULL,  -- cap, agregado, emulsao, combustivel, aditivo
  estoque_min NUMERIC(12,3) NOT NULL DEFAULT 0,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preços de compra (histórico)
CREATE TABLE insumos_precos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo_id  UUID NOT NULL REFERENCES insumos(id),
  preco      NUMERIC(12,4) NOT NULL,
  fornecedor VARCHAR(150),
  nf_numero  VARCHAR(30),
  vigente_em DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_por UUID REFERENCES usuarios(id),
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_precos_insumo_data ON insumos_precos(insumo_id, vigente_em DESC);

-- ─────────────────────────────────────────────
-- ESTOQUE
-- ─────────────────────────────────────────────
CREATE TABLE estoque (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo_id  UUID UNIQUE NOT NULL REFERENCES insumos(id),
  quantidade NUMERIC(14,3) NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estoque_movimentacoes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo_id     UUID NOT NULL REFERENCES insumos(id),
  tipo          tipo_mov_est NOT NULL,
  quantidade    NUMERIC(14,3) NOT NULL,
  preco_unitario NUMERIC(12,4),
  referencia    VARCHAR(60),   -- nf, pedido, ajuste manual
  obs           TEXT,
  criado_por    UUID REFERENCES usuarios(id),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mov_insumo ON estoque_movimentacoes(insumo_id, criado_em DESC);

-- ─────────────────────────────────────────────
-- TRAÇOS (DOSAGENS / MIX DESIGN)
-- ─────────────────────────────────────────────
CREATE TABLE tracos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         VARCHAR(80) NOT NULL,
  tipo_produto tipo_produto NOT NULL,
  versao       SMALLINT NOT NULL DEFAULT 1,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  aprovado_por UUID REFERENCES usuarios(id),
  aprovado_em  TIMESTAMPTZ,
  obs          TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE traco_componentes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traco_id    UUID NOT NULL REFERENCES tracos(id) ON DELETE CASCADE,
  insumo_id   UUID NOT NULL REFERENCES insumos(id),
  percentual  NUMERIC(6,3) NOT NULL,  -- % em massa
  UNIQUE(traco_id, insumo_id)
);

-- ─────────────────────────────────────────────
-- PRODUÇÃO DIÁRIA
-- ─────────────────────────────────────────────
CREATE TABLE producao_diaria (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_producao  DATE NOT NULL,
  turno          SMALLINT NOT NULL DEFAULT 1,  -- 1=manhã, 2=tarde, 3=noite
  operador_id    UUID REFERENCES usuarios(id),
  temperatura_amb NUMERIC(5,1),
  obs            TEXT,
  fechado        BOOLEAN NOT NULL DEFAULT FALSE,  -- impede edição
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(data_producao, turno)
);

CREATE TABLE producao_itens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producao_id     UUID NOT NULL REFERENCES producao_diaria(id) ON DELETE CASCADE,
  traco_id        UUID NOT NULL REFERENCES tracos(id),
  tipo_produto    tipo_produto NOT NULL,
  quantidade_ton  NUMERIC(10,3) NOT NULL,
  temperatura_saida NUMERIC(5,1),
  hora_inicio     TIME,
  hora_fim        TIME,
  obs             TEXT
);

-- ─────────────────────────────────────────────
-- PEDIDOS E FORNECIMENTO
-- ─────────────────────────────────────────────
CREATE TABLE pedidos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero          SERIAL,  -- número sequencial legível
  cliente_id      UUID NOT NULL REFERENCES clientes(id),
  status          status_pedido NOT NULL DEFAULT 'orcamento',
  data_pedido     DATE NOT NULL DEFAULT CURRENT_DATE,
  data_entrega    DATE,
  obra            VARCHAR(200),
  local_entrega   TEXT,
  tipo_forn       tipo_fornecimento NOT NULL DEFAULT 'completo',
  obs             TEXT,
  criado_por      UUID REFERENCES usuarios(id),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_status  ON pedidos(status);

CREATE TABLE pedido_itens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id       UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo_produto    tipo_produto NOT NULL,
  traco_id        UUID REFERENCES tracos(id),
  quantidade_ton  NUMERIC(10,3) NOT NULL,
  preco_ton       NUMERIC(10,4) NOT NULL,
  producao_item_id UUID REFERENCES producao_itens(id),  -- vincula ao produzido
  entregue_ton    NUMERIC(10,3) NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- PERDAS OPERACIONAIS
-- ─────────────────────────────────────────────
CREATE TABLE perdas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_perda    DATE NOT NULL,
  tipo_produto  tipo_produto,
  traco_id      UUID REFERENCES tracos(id),
  quantidade_ton NUMERIC(10,3) NOT NULL,
  motivo        VARCHAR(200) NOT NULL,
  categoria     VARCHAR(80),   -- qualidade, operacional, equipamento, temperatura
  custo_estimado NUMERIC(12,2),
  responsavel_id UUID REFERENCES usuarios(id),
  acao_corretiva TEXT,
  criado_por    UUID REFERENCES usuarios(id),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- LABORATÓRIO / CONTROLE TECNOLÓGICO
-- ─────────────────────────────────────────────
CREATE TABLE lab_amostras (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo         VARCHAR(30) UNIQUE NOT NULL,
  data_coleta    DATE NOT NULL,
  producao_id    UUID REFERENCES producao_diaria(id),
  tipo_produto   tipo_produto NOT NULL,
  traco_id       UUID REFERENCES tracos(id),
  coletado_por   UUID REFERENCES usuarios(id),
  status         VARCHAR(30) NOT NULL DEFAULT 'pendente',  -- pendente, em_ensaio, aprovado, reprovado
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lab_ensaios (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amostra_id   UUID NOT NULL REFERENCES lab_amostras(id) ON DELETE CASCADE,
  tipo_ensaio  VARCHAR(80) NOT NULL,  -- Marshall, Cântabro, Granulometria, etc.
  data_ensaio  DATE NOT NULL,
  resultado    JSONB NOT NULL DEFAULT '{}',  -- flexível p/ qualquer ensaio
  aprovado     BOOLEAN,
  obs          TEXT,
  realizado_por UUID REFERENCES usuarios(id),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ensaios_amostra ON lab_ensaios(amostra_id);

-- ─────────────────────────────────────────────
-- CUSTO OPERACIONAL (CONFIGURAÇÃO MENSAL)
-- ─────────────────────────────────────────────
CREATE TABLE custo_op_config (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes_referencia   DATE NOT NULL UNIQUE,  -- armazenado como 1º dia do mês
  regime_trib      regime_trib NOT NULL DEFAULT 'presumido',
  prod_prevista_ton NUMERIC(10,2) NOT NULL,
  dias_operacao    SMALLINT NOT NULL DEFAULT 22,
  horas_por_dia    SMALLINT NOT NULL DEFAULT 8,
  -- Custos fixos (R$)
  folha_salarial   NUMERIC(14,2) NOT NULL DEFAULT 0,
  encargos_sociais NUMERIC(14,2) NOT NULL DEFAULT 0,
  aluguel          NUMERIC(14,2) NOT NULL DEFAULT 0,
  depreciacao      NUMERIC(14,2) NOT NULL DEFAULT 0,
  energia_fixa     NUMERIC(14,2) NOT NULL DEFAULT 0,
  manutencao       NUMERIC(14,2) NOT NULL DEFAULT 0,
  seguros          NUMERIC(14,2) NOT NULL DEFAULT 0,
  locacao_equip    NUMERIC(14,2) NOT NULL DEFAULT 0,
  outros_fixos     NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Carga tributária (%)
  pis              NUMERIC(6,4) NOT NULL DEFAULT 1.65,
  cofins           NUMERIC(6,4) NOT NULL DEFAULT 7.60,
  iss              NUMERIC(6,4) NOT NULL DEFAULT 0,
  icms             NUMERIC(6,4) NOT NULL DEFAULT 12.00,
  irpj             NUMERIC(6,4) NOT NULL DEFAULT 4.80,
  csll             NUMERIC(6,4) NOT NULL DEFAULT 2.88,
  -- Combustíveis/Utilidades
  diesel_l_ton     NUMERIC(8,4) NOT NULL DEFAULT 3.2,
  diesel_preco     NUMERIC(8,4) NOT NULL DEFAULT 6.40,
  bpf_l_ton        NUMERIC(8,4) NOT NULL DEFAULT 4.5,
  bpf_preco        NUMERIC(8,4) NOT NULL DEFAULT 3.80,
  energia_kwh_ton  NUMERIC(8,4) NOT NULL DEFAULT 9.8,
  energia_tarifa   NUMERIC(8,4) NOT NULL DEFAULT 0.775,
  criado_por       UUID REFERENCES usuarios(id),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Previsão de produção por produto (vinculada à config mensal)
CREATE TABLE custo_op_previsao (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id       UUID NOT NULL REFERENCES custo_op_config(id) ON DELETE CASCADE,
  tipo_produto    tipo_produto NOT NULL,
  traco_id        UUID REFERENCES tracos(id),
  producao_ton    NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_venda_c   NUMERIC(10,2),   -- completo
  preco_venda_sc  NUMERIC(10,2),   -- sem CAP
  preco_venda_sp  NUMERIC(10,2),   -- sem CAP + pedra
  preco_venda_sb  NUMERIC(10,2),   -- só usinagem
  UNIQUE(config_id, tipo_produto)
);

-- ─────────────────────────────────────────────
-- NOTAS FISCAIS / FISCAL
-- ─────────────────────────────────────────────
CREATE TABLE notas_fiscais (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero         VARCHAR(20) NOT NULL,
  serie          VARCHAR(5)  NOT NULL DEFAULT '1',
  chave_nfe      VARCHAR(50),
  pedido_id      UUID REFERENCES pedidos(id),
  cliente_id     UUID NOT NULL REFERENCES clientes(id),
  data_emissao   DATE NOT NULL,
  valor_produtos NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_frete    NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_desconto NUMERIC(14,2) NOT NULL DEFAULT 0,
  base_icms      NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_icms     NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_pis      NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_cofins   NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_total    NUMERIC(14,2) NOT NULL DEFAULT 0,
  status         VARCHAR(20)  NOT NULL DEFAULT 'emitida',  -- emitida, cancelada, inutilizada
  xml_path       VARCHAR(255),
  criado_por     UUID REFERENCES usuarios(id),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- VIEWS ÚTEIS
-- ─────────────────────────────────────────────

-- Produção do mês atual
CREATE OR REPLACE VIEW vw_producao_mes_atual AS
SELECT
  pi.tipo_produto,
  SUM(pi.quantidade_ton)                        AS total_ton,
  COUNT(DISTINCT pd.data_producao)              AS dias_produzidos,
  AVG(pi.temperatura_saida)                     AS temp_media,
  DATE_TRUNC('month', pd.data_producao)         AS mes
FROM producao_itens pi
JOIN producao_diaria pd ON pd.id = pi.producao_id
WHERE DATE_TRUNC('month', pd.data_producao) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY pi.tipo_produto, DATE_TRUNC('month', pd.data_producao);

-- Estoque com último preço
CREATE OR REPLACE VIEW vw_estoque_valorizado AS
SELECT
  i.id, i.codigo, i.nome, i.unidade, i.categoria,
  e.quantidade,
  p.preco                                       AS ultimo_preco,
  e.quantidade * p.preco                        AS valor_total,
  CASE WHEN e.quantidade <= i.estoque_min THEN TRUE ELSE FALSE END AS abaixo_minimo
FROM insumos i
LEFT JOIN estoque e ON e.insumo_id = i.id
LEFT JOIN LATERAL (
  SELECT preco FROM insumos_precos
  WHERE insumo_id = i.id ORDER BY vigente_em DESC LIMIT 1
) p ON TRUE
WHERE i.ativo = TRUE;

-- Perdas do mês
CREATE OR REPLACE VIEW vw_perdas_mes_atual AS
SELECT
  tipo_produto,
  categoria,
  COUNT(*)                AS ocorrencias,
  SUM(quantidade_ton)     AS total_ton,
  SUM(custo_estimado)     AS custo_total
FROM perdas
WHERE DATE_TRUNC('month', data_perda) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY tipo_produto, categoria;

-- ─────────────────────────────────────────────
-- TRIGGER: atualiza estoque automaticamente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_atualiza_estoque()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO estoque(insumo_id, quantidade)
      VALUES(NEW.insumo_id, 0)
      ON CONFLICT (insumo_id) DO NOTHING;

    IF NEW.tipo IN ('entrada') THEN
      UPDATE estoque SET quantidade = quantidade + NEW.quantidade,
                         atualizado_em = NOW()
      WHERE insumo_id = NEW.insumo_id;
    ELSIF NEW.tipo IN ('saida','perda') THEN
      UPDATE estoque SET quantidade = quantidade - NEW.quantidade,
                         atualizado_em = NOW()
      WHERE insumo_id = NEW.insumo_id;
    ELSIF NEW.tipo = 'ajuste' THEN
      UPDATE estoque SET quantidade = NEW.quantidade,
                         atualizado_em = NOW()
      WHERE insumo_id = NEW.insumo_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mov_estoque
AFTER INSERT ON estoque_movimentacoes
FOR EACH ROW EXECUTE FUNCTION fn_atualiza_estoque();

-- Trigger: atualiza atualizado_em
CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_upd    BEFORE UPDATE ON usuarios    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();
CREATE TRIGGER trg_pedidos_upd     BEFORE UPDATE ON pedidos     FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();
CREATE TRIGGER trg_custo_op_upd    BEFORE UPDATE ON custo_op_config FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();
