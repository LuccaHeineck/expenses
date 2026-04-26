import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import LancamentoService, { Lancamento } from '../services/LancamentoService';
import PdfExportService from '../services/PdfExportService';

export default class LancamentoController {
  constructor(
    private lancamentoService: LancamentoService,
    private emailService: EmailService,
    private pdfExportService: PdfExportService,
  ) {}

  list = async (_req: Request, res: Response) => {
    try {
      const rows = await this.lancamentoService.list();
      res.json(rows);
    } catch (error) {
      console.error('Erro ao listar lancamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  exportPdf = async (_req: Request, res: Response) => {
    try {
      const rows = await this.lancamentoService.list();
      this.pdfExportService.exportLancamentos(rows, res);
    } catch (error) {
      console.error('Erro ao exportar lancamentos para PDF:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao, email } = req.body;
    if (!descricao || !data_lancamento || valor == null || !tipo_lancamento || !situacao) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email para notificação é obrigatório' });
    }

    try {
      const usuario_id = Number((req as any).user?.id);
      if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
        return res.status(401).json({ error: 'Usuário da sessão inválido' });
      }

      const created = await this.lancamentoService.create({ descricao, data_lancamento, valor, tipo_lancamento, situacao, usuario_id });
      void this.emailService.sendLancamentoNotification('criado', created as Lancamento, email).catch((error) => {
        console.error('Erro ao enviar email de criação de lancamento:', error);
      });
      res.status(201).json(created);
    } catch (error) {
      console.error('Erro ao criar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  delete = async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    try {
      const ok = await this.lancamentoService.delete(id);
      if (!ok) return res.status(404).json({ error: 'Lancamento não encontrado' });
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  update = async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao, email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email para notificação é obrigatório' });
    }

    try {
      const updated = await this.lancamentoService.update(id, { descricao, data_lancamento, valor, tipo_lancamento, situacao });
      if (!updated) return res.status(404).json({ error: 'Lancamento não encontrado' });

      void this.emailService.sendLancamentoNotification('atualizado', updated as Lancamento, email).catch((error) => {
        console.error('Erro ao enviar email de atualização de lancamento:', error);
      });
      res.json(updated);
    } catch (error) {
      console.error('Erro ao atualizar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}