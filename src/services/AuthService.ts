import pool from '../db';
import { createHash } from 'crypto';
import SessionStore, { SessionUser } from './SessionStore';

export default class AuthService {
  constructor(private store: SessionStore) {}

  private md5(s: string) {
    return createHash('md5').update(s).digest('hex');
  }

  async login(login: string, senha: string): Promise<{ user: SessionUser; token: string } | null> {
    const result = await pool.query('SELECT id, nome, login, senha, situacao FROM usuario WHERE login = $1', [login]);

    if (result.rowCount === 0) return null;
    
    const userRow = result.rows[0];
    const hash = this.md5(senha);
    
    if (hash !== userRow.senha) return null;
    
    const user: SessionUser = { id: userRow.id, nome: userRow.nome, login: userRow.login, situacao: userRow.situacao };
    const token = this.store.create(user);
    
    return { user, token };
  }

  getUserFromToken(token?: string | null) {
    return this.store.get(token);
  }

  logout(token?: string | null) {
    this.store.delete(token);
  }
}
