DROP TABLE IF EXISTS lancamento;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  login VARCHAR(80) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  situacao VARCHAR(20) NOT NULL
);

CREATE TABLE lancamento (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  data_lancamento DATE NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  tipo_lancamento VARCHAR(20) NOT NULL,
  situacao VARCHAR(20) NOT NULL
);

INSERT INTO usuario (nome, login, senha, situacao)
VALUES ('Administrador', 'admin', '123456', 'ATIVO')
ON CONFLICT (login) DO NOTHING;

INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao) VALUES
('Salario mensal', '2026-03-05', 4500.00, 'RECEITA', 'PAGO'),
('Freelance website', '2026-03-08', 1200.00, 'RECEITA', 'PAGO'),
('Aluguel', '2026-03-10', 1500.00, 'DESPESA', 'PAGO'),
('Conta de energia', '2026-03-11', 280.40, 'DESPESA', 'PENDENTE'),
('Internet', '2026-03-12', 120.00, 'DESPESA', 'PAGO'),
('Supermercado', '2026-03-13', 540.75, 'DESPESA', 'PAGO'),
('Transporte', '2026-03-14', 210.00, 'DESPESA', 'PAGO'),
('Plano de saude', '2026-03-16', 650.00, 'DESPESA', 'PENDENTE'),
('Venda notebook usado', '2026-03-18', 1800.00, 'RECEITA', 'PAGO'),
('Cinema', '2026-03-20', 75.50, 'DESPESA', 'PAGO');
