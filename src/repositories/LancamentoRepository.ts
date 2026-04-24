import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { lancamento } from '../database/schema';

export type LancamentoRecord = {
  id?: number;
  descricao: string;
  data_lancamento: string;
  valor: number;
  tipo_lancamento: string;
  situacao: string;
};

function mapLancamento(row: typeof lancamento.$inferSelect) {
  return {
    id: row.id,
    descricao: row.descricao,
    data_lancamento: row.data_lancamento,
    valor: Number(row.valor),
    tipo_lancamento: row.tipo_lancamento,
    situacao: row.situacao,
  };
}

export default class LancamentoRepository {
  async list() {
    const rows = await db
      .select()
      .from(lancamento)
      .orderBy(desc(lancamento.data_lancamento), desc(lancamento.id));

    return rows.map(mapLancamento);
  }

  async create(payload: LancamentoRecord) {
    const rows = await db
      .insert(lancamento)
      .values({
        descricao: payload.descricao,
        data_lancamento: payload.data_lancamento,
        valor: payload.valor,
        tipo_lancamento: payload.tipo_lancamento,
        situacao: payload.situacao,
      })
      .returning();

    return rows[0] ? mapLancamento(rows[0]) : null;
  }

  async delete(id: string | number) {
    const rows = await db.delete(lancamento).where(eq(lancamento.id, Number(id))).returning({ id: lancamento.id });
    return rows.length > 0;
  }

  async update(id: string | number, payload: Partial<LancamentoRecord>) {
    const values: Partial<typeof lancamento.$inferInsert> = {};

    if (payload.descricao !== undefined) values.descricao = payload.descricao;
    if (payload.data_lancamento !== undefined) values.data_lancamento = payload.data_lancamento;
    if (payload.valor !== undefined) values.valor = payload.valor;
    if (payload.tipo_lancamento !== undefined) values.tipo_lancamento = payload.tipo_lancamento;
    if (payload.situacao !== undefined) values.situacao = payload.situacao;

    const rows = await db
      .update(lancamento)
      .set(values)
      .where(eq(lancamento.id, Number(id)))
      .returning();

    return rows[0] ? mapLancamento(rows[0]) : null;
  }
}