import pool from '../db';

export type Lancamento = {
  id?: number;
  descricao: string;
  data_lancamento: string;
  valor: number;
  tipo_lancamento: string;
  situacao: string;
};

export default class LancamentoService {
  async list() {
    const result = await pool.query(
      `SELECT id, descricao, data_lancamento, valor, tipo_lancamento, situacao
       FROM lancamento
       ORDER BY data_lancamento DESC, id DESC`
    );
    return result.rows;
  }

  async create(payload: Lancamento) {
    const result = await pool.query(
      `INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, descricao, data_lancamento, valor, tipo_lancamento, situacao`,
      [payload.descricao, payload.data_lancamento, payload.valor, payload.tipo_lancamento, payload.situacao]
    );
    return result.rows[0];
  }

  async delete(id: string | number) {
    const result = await pool.query('DELETE FROM lancamento WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
