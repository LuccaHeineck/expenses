import { Router } from 'express';
import path from 'path';

export function createPageRouter() {
  const router = Router();

  router.get('/login', (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'login.html'));
  });

  router.get('/app', (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'app.html'));
  });

  router.get('/', (_req, res) => {
    res.redirect('/app');
  });

  return router;
}
