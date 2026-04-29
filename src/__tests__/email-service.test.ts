import { describe, test, expect, jest, afterEach } from '@jest/globals';
import EmailService from '../services/EmailService';

describe('Email Service', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Conexão SMTP', async () => {
        const emailService = new EmailService();
        const resposta = await emailService.testConnection();
        expect(resposta).toBe(true);
    });

    test('Envio de email', async () => {
        const emailService = new EmailService();
        await expect(emailService.sendEmail('test@example.com', 'Assunto de teste', 'Corpo do email de teste')).resolves.not.toThrow();
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