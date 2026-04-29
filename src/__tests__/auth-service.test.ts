import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import AuthService from '../services/AuthService';
import SessionStore from '../services/SessionStore';
import UsuarioRepository from '../repositories/UsuarioRepository';

describe('Auth Service', () => {
  const store = {
    create: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<SessionStore>;
  const repository = {
    findByLogin: jest.fn(),
  } as unknown as jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login retorna null quando usuário não existe', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository.findByLogin.mockResolvedValue(null as any);
    const service = new AuthService(store, repository);

    const result = await service.login('usuario-inexistente', '123456');

    expect(result).toBeNull();
    expect(store.create).not.toHaveBeenCalled();
  });

  test('login retorna null quando senha é inválida', async () => {
    repository.findByLogin.mockResolvedValue({
      id: 1,
      nome: 'Usuário Teste',
      login: 'test',
      senha: 'invalid-hash',
      situacao: 'ATIVO',
    });

    const service = new AuthService(store, repository);
    const result = await service.login('test', 'senha-incorreta');

    expect(result).toBeNull();
    expect(store.create).not.toHaveBeenCalled();
  });

  test('login retorna usuário e token quando credenciais são válidas', async () => {
    const senha = '123456';
    const senhaMd5 = 'e10adc3949ba59abbe56e057f20f883e';

    repository.findByLogin.mockResolvedValue({
      id: 5,
      nome: 'Usuário Válido',
      login: 'valid',
      senha: senhaMd5,
      situacao: 'ATIVO',
    });
    store.create.mockReturnValue('token-abc');

    const service = new AuthService(store, repository);
    const result = await service.login('valid', senha);

    expect(store.create).toHaveBeenCalledWith({ id: 5, nome: 'Usuário Válido', login: 'valid', situacao: 'ATIVO' });
    expect(result).toEqual({
      user: { id: 5, nome: 'Usuário Válido', login: 'valid', situacao: 'ATIVO' },
      token: 'token-abc',
    });
  });
});
