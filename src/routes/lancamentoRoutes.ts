import { Router, Request, Response } from 'express';
import LancamentoService from '../services/LancamentoService';
import SessionStore from '../services/SessionStore';
import { createRequireAuth } from '../middleware/auth';

export function createLancamentoRouter(lancService: LancamentoService, sessionStore: SessionStore) {
  const router = Router();
  const requireAuth = createRequireAuth(sessionStore);

  router.get('/lancamentos', requireAuth, async (_req: Request, res: Response) => {
    try {
      const rows = await lancService.list();
      res.json(rows);
    } catch (error) {
      console.error('Erro ao listar lancamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.post('/lancamentos', requireAuth, async (req: Request, res: Response) => {
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao } = req.body;
    if (!descricao || !data_lancamento || valor == null || !tipo_lancamento || !situacao) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    try {
      const created = await lancService.create({ descricao, data_lancamento, valor, tipo_lancamento, situacao });
      res.status(201).json(created);
    } catch (error) {
      console.error('Erro ao criar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.delete('/lancamentos/:id', requireAuth, async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    try {
      const ok = await lancService.delete(id);
      if (!ok) return res.status(404).json({ error: 'Lancamento não encontrado' });
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  return router;
}
