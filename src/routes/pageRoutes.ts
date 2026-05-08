import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { NODE_ENV } from '../config';

export function createPageRouter() {
  const router = Router();

  router.get('/login', (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'login.html'));
  });

  router.get('/app', (_req, res) => {
    const filePath = path.resolve(process.cwd(), 'public', 'app.html');
    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const envScript = `<script>window.NODE_ENV = ${JSON.stringify(NODE_ENV)};</script>`;
      const out = html.replace('</head>', `${envScript}</head>`);
      res.type('html').send(out);
    } catch (err: unknown) {
      console.error('Failed to inject NODE_ENV into app.html, serving original file:', err); // eslint-disable-line no-console
      res.sendFile(filePath);
    }
  });

  router.get('/', (_req, res) => {
    res.redirect('/app');
  });

  return router;
}
