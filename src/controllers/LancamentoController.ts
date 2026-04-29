import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import EmailService from '../services/EmailService';
import LancamentoService, { Lancamento } from '../services/LancamentoService';
import PdfExportService from '../services/PdfExportService';

export default class LancamentoController {
  constructor(
    private lancamentoService: LancamentoService,
    private emailService: EmailService,
    private pdfExportService: PdfExportService,
  ) {}

  private getUsuarioId(req: Request): number | null {
    const usuarioId = Number((req as AuthenticatedRequest).user?.id);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) return null;
    return usuarioId;
  }

  private hasRequiredCreateFields(body: Record<string, unknown>) {
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao } = body;
    return Boolean(descricao && data_lancamento && valor != null && tipo_lancamento && situacao);
  }

  private isValidNotificationEmail(email: unknown): email is string {
    return typeof email === 'string' && email.trim().length > 0;
  }

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
    const payload = req.body as Record<string, unknown>;
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao, email } = payload;
    if (!this.hasRequiredCreateFields(payload)) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    if (!this.isValidNotificationEmail(email)) {
      return res.status(400).json({ error: 'Email para notificação é obrigatório' });
    }

    const descricaoStr = String(descricao);
    const dataLancStr = String(data_lancamento);
    const valorNum = Number(valor);
    const tipoStr = String(tipo_lancamento);
    const situacaoStr = String(situacao);
    if (!descricaoStr.trim() || !dataLancStr.trim() || !Number.isFinite(valorNum) || !tipoStr.trim() || !situacaoStr.trim()) {
      return res.status(400).json({ error: 'Campos inválidos' });
    }

    try {
      const usuario_id = this.getUsuarioId(req);
      if (!usuario_id) {
        return res.status(401).json({ error: 'Usuário da sessão inválido' });
      }

      const created = await this.lancamentoService.create({ descricao: descricaoStr, data_lancamento: dataLancStr, valor: valorNum, tipo_lancamento: tipoStr, situacao: situacaoStr, usuario_id });
      this.emailService.sendLancamentoNotification('criado', created as Lancamento, email).catch((error) => {
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
    const { descricao, data_lancamento, valor, tipo_lancamento, situacao, email } = req.body as Record<string, unknown>;
    if (!this.isValidNotificationEmail(email)) {
      return res.status(400).json({ error: 'Email para notificação é obrigatório' });
    }

    const descricaoStr = String(descricao);
    const dataLancStr = String(data_lancamento);
    const valorNum = Number(valor);
    const tipoStr = String(tipo_lancamento);
    const situacaoStr = String(situacao);
    if (!descricaoStr.trim() || !dataLancStr.trim() || !Number.isFinite(valorNum) || !tipoStr.trim() || !situacaoStr.trim()) {
      return res.status(400).json({ error: 'Campos inválidos' });
    }

    try {
      const updated = await this.lancamentoService.update(id, { descricao: descricaoStr, data_lancamento: dataLancStr, valor: valorNum, tipo_lancamento: tipoStr, situacao: situacaoStr });
      if (!updated) return res.status(404).json({ error: 'Lancamento não encontrado' });

      this.emailService.sendLancamentoNotification('atualizado', updated as Lancamento, email).catch((error) => {
        console.error('Erro ao enviar email de atualização de lancamento:', error);
      });
      res.json(updated);
    } catch (error) {
      console.error('Erro ao atualizar lancamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}