import { describe, expect, test } from '@jest/globals';
import SessionStore from '../services/SessionStore';

describe('Session Store', () => {
  test('create/get/delete mantém o ciclo de vida da sessão consistente', () => {
    const store = new SessionStore();
    const user = { id: 1, nome: 'Usuário', login: 'user', situacao: 'ATIVO' };

    const token = store.create(user);

    expect(token).toHaveLength(48);
    expect(store.get(token)).toEqual(user);

    store.delete(token);

    expect(store.get(token)).toBeNull();
  });
});
