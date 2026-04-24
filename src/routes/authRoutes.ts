import { Router } from 'express';
import AuthService from '../services/AuthService';
import { createRequireAuth } from '../middleware/auth';
import SessionStore from '../services/SessionStore';
import AuthController from '../controllers/AuthController';

export function createAuthRouter(authService: AuthService, sessionStore: SessionStore) {
  const router = Router();
  const controller = new AuthController(authService);
  const requireAuth = createRequireAuth(sessionStore);

  router.post('/login', controller.login);
  router.get('/me', requireAuth, controller.me);
  router.post('/logout', controller.logout);

  return router;
}
