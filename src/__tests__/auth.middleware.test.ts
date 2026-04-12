import { describe, expect, test, jest } from '@jest/globals';
import { createRequireAuth, getTokenFromReq } from '../middleware/auth';

describe('Testes de Middleware de Autenticação', () => {
  test('getTokenFromReq retorna token do header Authorization', () => {
    const req = { headers: { authorization: 'Bearer token-123' } } as any;

    const token = getTokenFromReq(req);

    expect(token).toBe('token-123');
  });

  test('getTokenFromReq retorna token do cookie sid', () => {
    const req = { headers: { cookie: 'foo=1; sid=cookie-token; bar=2' } } as any;

    const token = getTokenFromReq(req);

    expect(token).toBe('cookie-token');
  });

  test('requireAuth retorna 401 quando token está ausente', () => {
    const sessionStore = { get: jest.fn() } as any;
    const requireAuth = createRequireAuth(sessionStore);
    const req = { headers: {} } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth retorna 401 quando sessão é inválida', () => {
    const sessionStore = { get: jest.fn().mockReturnValue(null) } as any;
    const requireAuth = createRequireAuth(sessionStore);
    const req = { headers: { authorization: 'Bearer invalid-token' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(sessionStore.get).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sessão inválida' });
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth chama next e preenche req.user quando sessão é válida', () => {
    const user = { id: 1, nome: 'User', login: 'user', situacao: 'ATIVO' };
    const sessionStore = { get: jest.fn().mockReturnValue(user) } as any;
    const requireAuth = createRequireAuth(sessionStore);
    const req = { headers: { authorization: 'Bearer valid-token' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
