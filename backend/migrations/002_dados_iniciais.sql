-- ============================================================
-- USINA ERP — Dados iniciais (seed)
-- ============================================================

-- Usuário admin padrão (senha: Admin@2025 — alterar no primeiro acesso)
-- hash bcrypt da senha: Admin@2025
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
('Administrador', 'admin@usinaerp.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqxEOwGNcRPX4lbLqh2bXZi7d0ae',
 'admin');

-- Insumos padrão
INSERT INTO insumos (codigo, nome, unidade, categoria, estoque_min) VALUES
('CAP-5070',  'CAP 50/70',                  'ton', 'cap',        5.0),
('CAP-3045',  'CAP 30/45',                  'ton', 'cap',        2.0),
('EMUL-RL1C', 'Emulsão Asfáltica RL-1C',    'ton', 'emulsao',    3.0),
('EMUL-RR2C', 'Emulsão Asfáltica RR-2C',    'ton', 'emulsao',    2.0),
('BRIT-0',    'Brita 0 (4,75~9,5mm)',       'ton', 'agregado',  50.0),
('BRIT-1',    'Brita 1 (9,5~19mm)',         'ton', 'agregado',  50.0),
('BRIT-2',    'Brita 2 (19~25mm)',          'ton', 'agregado',  30.0),
('PO-PED',    'Pó-de-pedra / Fíler',        'ton', 'agregado',  80.0),
('AREIA',     'Areia Natural',              'ton', 'agregado',  20.0),
('CAL',       'Cal Hidratada CH-I',         'ton', 'aditivo',    2.0),
('POL-MIN',   'Pó Mineral / Calcário',      'ton', 'aditivo',    1.0),
('DIESEL',    'Diesel S-10',                'L',   'combustivel', 2000.0),
('BPF',       'Óleo BPF',                   'L',   'combustivel', 1000.0);

-- Traço padrão CBUQ BC
INSERT INTO tracos (nome, tipo_produto) VALUES
('CBUQ BC — Padrão',          'CBUQ_BC'),
('CBUQ CR — Padrão',          'CBUQ_CR'),
('PMF I — Padrão',            'PMF_I'),
('TSD — Padrão',              'TSD'),
('Microrevestimento — Padrão','MICROREVESTIMENTO'),
('CBUQ CF — Padrão',          'CBUQ_CF');

-- Componentes do traço CBUQ BC
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('CAP-5070', 5.5), ('BRIT-0', 20.0), ('BRIT-1', 30.0),
  ('BRIT-2', 28.0), ('PO-PED', 13.5), ('CAL', 1.0), ('AREIA', 2.0)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'CBUQ BC — Padrão';

-- Componentes do traço CBUQ CR
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('CAP-5070', 5.8), ('BRIT-0', 35.0), ('BRIT-1', 20.0),
  ('BRIT-2', 2.0), ('PO-PED', 28.2), ('CAL', 1.0), ('AREIA', 8.0)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'CBUQ CR — Padrão';

-- Componentes PMF I
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('EMUL-RL1C', 4.5), ('BRIT-0', 50.0),
  ('PO-PED', 35.0), ('AREIA', 8.5), ('CAL', 2.0)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'PMF I — Padrão';

-- Componentes TSD
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('EMUL-RR2C', 14.0), ('BRIT-0', 52.0), ('PO-PED', 34.0)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'TSD — Padrão';

-- Componentes Microrevestimento
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('EMUL-RL1C', 10.0), ('AREIA', 62.0), ('PO-PED', 22.0),
  ('POL-MIN', 3.0), ('CAL', 1.5)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'Microrevestimento — Padrão';

-- Componentes CBUQ CF
INSERT INTO traco_componentes (traco_id, insumo_id, percentual)
SELECT t.id, i.id, comp.pct FROM (VALUES
  ('CAP-3045', 4.8), ('BRIT-2', 35.0), ('BRIT-1', 25.0),
  ('BRIT-0', 15.0), ('PO-PED', 18.2), ('CAL', 1.0), ('AREIA', 1.0)
) AS comp(cod, pct)
JOIN insumos i ON i.codigo = comp.cod
CROSS JOIN tracos t WHERE t.nome = 'CBUQ CF — Padrão';
