import { describe, expect, test, jest } from '@jest/globals';
import { PassThrough } from 'stream';
import PdfExportService from '../services/PdfExportService';

function createMockResponse() {
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  stream.on('data', (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  const res = stream as PassThrough & {
    setHeader: jest.Mock;
    getBuffer: () => Buffer;
  };

  res.setHeader = jest.fn();
  res.getBuffer = () => Buffer.concat(chunks);

  return res;
}

describe('Testes de Exportação para PDF', () => {
  test('exportLancamentos configura headers e gera saída PDF', async () => {
    const pdfService = new PdfExportService();
    const res = createMockResponse();

    const rows = [
      {
        id: 1,
        descricao: 'Aluguel',
        data_lancamento: '2026-04-12',
        valor: 1500,
        tipo_lancamento: 'despesa',
        situacao: 'pago'
      }
    ];

    pdfService.exportLancamentos(rows, res as any);

    await new Promise<void>((resolve) => {
      res.on('finish', () => resolve());
      res.on('end', () => resolve());
      setImmediate(() => resolve());
    });

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="lancamentos.pdf"'
    );

    const output = res.getBuffer();
    expect(output.length).toBeGreaterThan(0);
    expect(output.subarray(0, 4).toString()).toBe('%PDF');
  });
});
