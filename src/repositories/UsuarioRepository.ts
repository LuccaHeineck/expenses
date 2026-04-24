import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usuario } from '../database/schema';

export default class UsuarioRepository {
  async findByLogin(login: string) {
    const rows = await db.select().from(usuario).where(eq(usuario.login, login)).limit(1);
    return rows[0] ?? null;
  }
}