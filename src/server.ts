import path from "path";
import express from "express";
import dotenv from "dotenv";
import SessionStore from './services/SessionStore';
import AuthService from './services/AuthService';
import EmailService from './services/EmailService';
import LancamentoService from './services/LancamentoService';
import PdfExportService from './services/PdfExportService';
import { createAuthRouter } from './routes/authRoutes';
import { createLancamentoRouter } from './routes/lancamentoRoutes';
import { createPageRouter } from './routes/pageRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "public"), { index: false }));

const sessionStore = new SessionStore();
const authService = new AuthService(sessionStore);
const lancService = new LancamentoService();
const emailService = new EmailService();
const pdfExportService = new PdfExportService();
app.use('/api', createAuthRouter(authService, sessionStore));
app.use('/api', createLancamentoRouter(lancService, emailService, sessionStore, pdfExportService));
app.use(createPageRouter());

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
