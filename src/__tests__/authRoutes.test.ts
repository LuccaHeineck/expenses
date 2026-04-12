import { describe, expect, test } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { createAuthRouter } from '../routes/authRoutes';
import SessionStore from '../services/SessionStore';

describe('Testes de Rotas de Autenticação', () => {
  test('POST /api/login retorna 400 quando campos obrigatórios faltam', async () => {
    const authService = {
      login: async () => null,
      logout: () => undefined,
    } as any;

    const app = express();
    app.use(express.json());
    app.use('/api', createAuthRouter(authService, new SessionStore()));

    const response = await request(app).post('/api/login').send({ login: 'only-login' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Login e senha obrigatórios' });
  });
});
