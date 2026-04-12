import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import type { Lancamento } from './LancamentoService';

dotenv.config();

export default class EmailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (host && user && pass && Number.isFinite(port)) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
          user,
          pass
        }
      });
    } else {
      this.transporter = null;
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    if (!this.transporter) {
      console.log('[EMAIL MOCK]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${body}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_USER?.trim(),
      to,
      subject,
      text: body
    });
  }

  async sendLancamentoNotification(action: 'criado' | 'atualizado', lancamento: Lancamento, to: string) {
    const subject = `Lançamento ${action}: ${lancamento.descricao}`;
    const body = [
      `Um lançamento foi ${action}.`,
      `ID: ${lancamento.id ?? 'novo'}`,
      `Descrição: ${lancamento.descricao}`,
      `Data: ${lancamento.data_lancamento}`,
      `Valor: ${lancamento.valor}`,
      `Tipo: ${lancamento.tipo_lancamento}`,
      `Situação: ${lancamento.situacao}`
    ].join('\n');

    await this.sendEmail(to.trim(), subject, body);
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('SMTP não configurado. Teste de conexão ignorado.');
      return true;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão SMTP:', error);
      return false;
    }
  }
}