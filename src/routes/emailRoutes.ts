import { Router, Request, Response } from 'express';
import EmailService from '../services/EmailService';

export function createEmailRouter(emailService: EmailService) {
  const router = Router();

  router.post('/send-email', async (req: Request, res: Response) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    try {
      await emailService.sendEmail(to, subject, body);
      res.status(200).json({ message: 'Email enviado com sucesso' });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  return router;
}