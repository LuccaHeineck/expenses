import { Request, Response, NextFunction } from 'express';
import SessionStore, { SessionUser } from '../services/SessionStore';

export type AuthenticatedRequest = Request & { user?: SessionUser };

export function getTokenFromReq(req: Request) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7).trim();

  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie.split(/; */).find((c) => c.startsWith('sid='));
  if (!match) return null;

  return match.split('=')[1];
}

export function createRequireAuth(sessionStore: SessionStore) {
  return function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Não autenticado' });

    const session = sessionStore.get(token);
    if (!session) return res.status(401).json({ error: 'Sessão inválida' });

    const authReq = req as AuthenticatedRequest;
    authReq.user = session;
    next();
  };
}
