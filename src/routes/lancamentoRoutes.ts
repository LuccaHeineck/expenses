import { Router } from 'express';
import LancamentoService from '../services/LancamentoService';
import EmailService from '../services/EmailService';
import SessionStore from '../services/SessionStore';
import { createRequireAuth } from '../middleware/auth';
import PdfExportService from '../services/PdfExportService';
import LancamentoController from '../controllers/LancamentoController';

export function createLancamentoRouter(
  lancService: LancamentoService,
  emailService: EmailService,
  sessionStore: SessionStore,
  pdfExportService: PdfExportService
) {
  const router = Router();
  const controller = new LancamentoController(lancService, emailService, pdfExportService);
  const requireAuth = createRequireAuth(sessionStore);

  router.get('/lancamentos', requireAuth, controller.list);
  router.get('/lancamentos/export/pdf', requireAuth, controller.exportPdf);
  router.post('/lancamentos', requireAuth, controller.create);
  router.delete('/lancamentos/:id', requireAuth, controller.delete);
  router.put('/lancamentos/:id', requireAuth, controller.update);

  return router;
}
