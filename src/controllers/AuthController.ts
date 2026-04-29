import { Request, Response } from 'express';
import { AuthenticatedRequest, getTokenFromReq } from '../middleware/auth';
import AuthService from '../services/AuthService';

export default class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const { login, senha } = req.body as { login: string; senha: string };
    if (!login || !senha) return res.status(400).json({ error: 'Login e senha obrigatórios' });

    try {
      const result = await this.authService.login(login, senha);
      if (!result) return res.status(401).json({ error: 'Credenciais inválidas' });

      res.setHeader('Set-Cookie', `sid=${result.token}; HttpOnly; Path=/; SameSite=Lax`);
      res.json(result.user);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  me = (req: Request, res: Response) => {
    res.json((req as AuthenticatedRequest).user);
  };

  logout = (req: Request, res: Response) => {
    const token = getTokenFromReq(req);
    if (token) this.authService.logout(token);

    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    res.status(204).send();
  };
}