import { describe, test, expect, jest, afterEach, beforeAll } from '@jest/globals';
import nodemailer from 'nodemailer';
import EmailService from '../services/EmailService';

describe('Email Service', () => {
    const mockSendMail = jest.fn(() => Promise.resolve());
    const mockVerify = jest.fn(() => Promise.resolve());

    beforeAll(() => {
        process.env.SMTP_HOST = 'localhost';
        process.env.SMTP_PORT = '1025';
        process.env.SMTP_USER = 'user';
        process.env.SMTP_PASS = 'pass';

        jest.spyOn(nodemailer, 'createTransport').mockImplementation(() => ({
            sendMail: mockSendMail,
            verify: mockVerify,
        } as unknown as nodemailer.Transporter));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Conexão SMTP', async () => {
        const emailService = new EmailService();
        const resposta = await emailService.testConnection();
        expect(resposta).toBe(true);
        expect(mockVerify).toHaveBeenCalled();
    });

    test('Envio de email', async () => {
        const emailService = new EmailService();
        await expect(emailService.sendEmail('test@example.com', 'Assunto de teste', 'Corpo do email de teste')).resolves.not.toThrow();
        expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    test('Notificação de lançamento monta assunto/corpo e limpa espaços do destinatário', async () => {
        const emailService = new EmailService();
        const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

        await emailService.sendLancamentoNotification(
            'criado',
            {
                id: 10,
                descricao: 'Aluguel',
                data_lancamento: '2026-04-12',
                valor: 1500,
                tipo_lancamento: 'despesa',
                situacao: 'pago',
                usuario_id: 1,
            },
            '  teste@example.com  '
        );

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);

        const [to, subject, body] = sendEmailSpy.mock.calls[0];
        expect(to).toBe('teste@example.com');
        expect(subject).toContain('Lançamento criado');
        expect(subject).toContain('Aluguel');
        expect(body).toContain('ID: 10');
        expect(body).toContain('Descrição: Aluguel');
        expect(body).toContain('Data: 2026-04-12');
        expect(body).toContain('Valor: 1500');
    });

});