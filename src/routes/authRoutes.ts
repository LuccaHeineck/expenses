import { Router, Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { createRequireAuth, getTokenFromReq } from '../middleware/auth';
import SessionStore from '../services/SessionStore';

export function createAuthRouter(authService: AuthService, sessionStore: SessionStore) {
  const router = Router();
  const requireAuth = createRequireAuth(sessionStore);

  router.post('/login', async (req: Request, res: Response) => {
    const { login, senha } = req.body as { login: string; senha: string };
    if (!login || !senha) return res.status(400).json({ error: 'Login e senha obrigatórios' });

    try {
      const result = await authService.login(login, senha);
      if (!result) return res.status(401).json({ error: 'Credenciais inválidas' });

      res.setHeader('Set-Cookie', `sid=${result.token}; HttpOnly; Path=/; SameSite=Lax`);
      res.json(result.user);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.get('/me', requireAuth, (req: Request, res: Response) => {
    res.json((req as any).user);
  });

  router.post('/logout', (req: Request, res: Response) => {
    const token = getTokenFromReq(req);
    if (token) authService.logout(token);

    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    res.status(204).send();
  });

  return router;
}
