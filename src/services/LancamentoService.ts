import LancamentoRepository from '../repositories/LancamentoRepository';

export type Lancamento = {
  id?: number;
  descricao: string;
  data_lancamento: string;
  valor: number;
  tipo_lancamento: string;
  situacao: string;
  usuario_id: number;
};

export default class LancamentoService {
  constructor(private repository: LancamentoRepository = new LancamentoRepository()) {}

  async list() {
    return this.repository.list();
  }

  async create(payload: Lancamento) {
    return this.repository.create(payload);
  }

  async delete(id: string | number) {
    return this.repository.delete(id);
  }

  async update(id: string | number, payload: Partial<Lancamento>) {
    return this.repository.update(id, payload);
  }

}
