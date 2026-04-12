import { createHash } from 'crypto';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import AuthService from '../services/AuthService';
import pool from '../db';

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

const mockedQuery: any = pool.query;

describe('AuthService', () => {
  const store = {
    create: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login retorna null quando usuário não existe', async () => {
    mockedQuery.mockResolvedValue({ rowCount: 0, rows: [] });
    const service = new AuthService(store);

    const result = await service.login('usuario-inexistente', '123456');

    expect(result).toBeNull();
    expect(store.create).not.toHaveBeenCalled();
  });

  test('login retorna null quando senha é inválida', async () => {
    mockedQuery.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 1,
          nome: 'Usuário Teste',
          login: 'test',
          senha: 'invalid-hash',
          situacao: 'ATIVO',
        },
      ],
    });

    const service = new AuthService(store);
    const result = await service.login('test', 'senha-incorreta');

    expect(result).toBeNull();
    expect(store.create).not.toHaveBeenCalled();
  });

  test('login retorna usuário e token quando credenciais são válidas', async () => {
    const senha = '123456';
    const senhaMd5 = createHash('md5').update(senha).digest('hex');

    mockedQuery.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 5,
          nome: 'Usuário Válido',
          login: 'valid',
          senha: senhaMd5,
          situacao: 'ATIVO',
        },
      ],
    });
    store.create.mockReturnValue('token-abc');

    const service = new AuthService(store);
    const result = await service.login('valid', senha);

    expect(store.create).toHaveBeenCalledWith({ id: 5, nome: 'Usuário Válido', login: 'valid', situacao: 'ATIVO' });
    expect(result).toEqual({
      user: { id: 5, nome: 'Usuário Válido', login: 'valid', situacao: 'ATIVO' },
      token: 'token-abc',
    });
  });
});
