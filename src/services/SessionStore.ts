import { randomBytes } from 'crypto';

export type SessionUser = { id: number; nome: string; login: string; situacao: string };

export default class SessionStore {
  private sessions = new Map<string, SessionUser>();

  create(user: SessionUser) {
    const token = randomBytes(24).toString('hex');
    this.sessions.set(token, user);
    return token;
  }

  get(token?: string | null) {
    if (!token) return null;
    return this.sessions.get(token) || null;
  }

  delete(token?: string | null) {
    if (!token) return;
    this.sessions.delete(token);
  }
}
