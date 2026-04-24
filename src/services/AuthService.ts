import { createHash } from 'crypto';
import SessionStore, { SessionUser } from './SessionStore';
import UsuarioRepository from '../repositories/UsuarioRepository';

export default class AuthService {
  constructor(
    private store: SessionStore,
    private usuarioRepository: UsuarioRepository = new UsuarioRepository(),
  ) {}

  private md5(s: string) {
    return createHash('md5').update(s).digest('hex');
  }

  async login(login: string, senha: string): Promise<{ user: SessionUser; token: string } | null> {
    const userRow = await this.usuarioRepository.findByLogin(login);

    if (!userRow) return null;

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
