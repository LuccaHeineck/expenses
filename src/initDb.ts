import pool, { db } from "./db";
import { eq } from 'drizzle-orm';
import { lancamento, usuario } from './database/schema';
import { createHash } from 'crypto';

const seedLancamentos = [
  { descricao: 'Salario mensal', data_lancamento: '2026-03-05', valor: 2000.0, tipo_lancamento: 'RECEITA', situacao: 'PAGO' },
  { descricao: 'Cortar grama do vizinho', data_lancamento: '2026-03-08', valor: 1200.0, tipo_lancamento: 'RECEITA', situacao: 'PAGO' },
  { descricao: 'Aluguel', data_lancamento: '2026-03-10', valor: 1500.0, tipo_lancamento: 'DESPESA', situacao: 'PAGO' },
  { descricao: 'Conta de energia', data_lancamento: '2026-03-11', valor: 280.4, tipo_lancamento: 'DESPESA', situacao: 'PENDENTE' },
  { descricao: 'Internet', data_lancamento: '2026-03-12', valor: 120.0, tipo_lancamento: 'DESPESA', situacao: 'PAGO' },
  { descricao: 'Supermercado', data_lancamento: '2026-03-13', valor: 540.75, tipo_lancamento: 'DESPESA', situacao: 'PAGO' },
  { descricao: 'Transporte', data_lancamento: '2026-03-14', valor: 210.0, tipo_lancamento: 'DESPESA', situacao: 'PAGO' },
  { descricao: 'Plano de saude', data_lancamento: '2026-03-16', valor: 650.0, tipo_lancamento: 'DESPESA', situacao: 'PENDENTE' },
  { descricao: 'Venda notebook usado', data_lancamento: '2026-03-18', valor: 1800.0, tipo_lancamento: 'RECEITA', situacao: 'PAGO' },
  { descricao: 'Cinema', data_lancamento: '2026-03-20', valor: 75.5, tipo_lancamento: 'DESPESA', situacao: 'PAGO' },
] as const;

async function initDatabase(): Promise<void> {
  try {
    const adminId = await ensureAdminUser();
    await seedLancamentosIfNeeded(adminId);
    console.warn('Seed concluído com sucesso.');
    await normalizeUserPasswordsToMd5();
  } catch (error) {
    console.error('Erro ao executar seed do banco:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

async function ensureAdminUser(): Promise<number> {
  // eslint-disable-next-line sonarjs/hashing
  const hashedDefaultPassword = createHash('md5').update('123456', 'utf8').digest('hex');

  const insertedUsers = await db
    .insert(usuario)
    .values({
      nome: 'Administrador',
      login: 'admin',
      senha: hashedDefaultPassword,
      situacao: 'ATIVO',
    })
    .onConflictDoNothing({ target: usuario.login })
    .returning({ id: usuario.id });

  const insertedId = insertedUsers[0]?.id;
  if (insertedId) return insertedId;

  const existing = await db
    .select({ id: usuario.id })
    .from(usuario)
    .where(eq(usuario.login, 'admin'))
    .limit(1);
  const existingId = existing[0]?.id;
  if (!existingId) {
    throw new Error('Usuário admin não encontrado para seed de lançamentos.');
  }
  return existingId;
}

async function seedLancamentosIfNeeded(adminId: number): Promise<void> {
  const existingLancamentos = await db
    .select({ id: lancamento.id })
    .from(lancamento)
    .limit(1);

  if (existingLancamentos.length > 0) return;

  await db.insert(lancamento).values(
    seedLancamentos.map((item) => ({
      ...item,
      usuario_id: adminId,
    })),
  );
}

async function normalizeUserPasswordsToMd5(): Promise<void> {
  const users = await db.select({ id: usuario.id, senha: usuario.senha }).from(usuario);
  for (const row of users) {
    const { id, senha } = row;
    if (!senha) {
      console.warn(`Usuário id=${id} sem senha registrada — pulando.`);
      continue;
    }
    if (/^[a-f0-9]{32}$/i.test(senha)) {
      continue;
    }
    // eslint-disable-next-line sonarjs/hashing
    const hash = createHash('md5').update(senha, 'utf8').digest('hex');
    await db.update(usuario).set({ senha: hash }).where(eq(usuario.id, id));
    console.warn(`Senha do usuario id=${id} atualizada para MD5.`);
  }
}

void initDatabase();
