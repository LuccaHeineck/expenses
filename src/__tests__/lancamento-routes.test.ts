import { describe, expect, test, jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import SessionStore from '../services/SessionStore';
import { createLancamentoRouter } from '../routes/lancamentoRoutes';

describe('Lancamento Routes', () => {
  test('POST /api/lancamentos retorna 400 quando email de notificação está ausente', async () => {
    const lancService = {
      list: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    const emailService = {
      sendLancamentoNotification: jest.fn(),
    } as any;

    const pdfExportService = {
      exportLancamentos: jest.fn(),
    } as any;

    const sessionStore = new SessionStore();
    const token = sessionStore.create({ id: 1, nome: 'Usuário', login: 'user', situacao: 'ATIVO' });

    const app = express();
    app.use(express.json());
    app.use('/api', createLancamentoRouter(lancService, emailService, sessionStore, pdfExportService));

    const response = await request(app)
      .post('/api/lancamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descricao: 'Conta de luz',
        data_lancamento: '2026-04-12',
        valor: 230.5,
        tipo_lancamento: 'despesa',
        situacao: 'pendente',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Email para notificação é obrigatório' });
    expect(lancService.create).not.toHaveBeenCalled();
  });
});
