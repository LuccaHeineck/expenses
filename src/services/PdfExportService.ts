import PDFDocument from 'pdfkit';

type PdfRow = {
  id: number;
  descricao: string;
  data_lancamento: string;
  valor: number;
  tipo_lancamento: string;
  situacao: string;
};

export default class PdfExportService {
  exportLancamentos(rows: PdfRow[], res: import('express').Response) {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 32 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="lancamentos.pdf"');

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margins = doc.page.margins;
    const tableWidth = pageWidth - margins.left - margins.right;
    const columnWidths = [52, 210, 94, 90, 88, 96];
    const rowX = margins.left;
    const headerY = 92;
    const rowPadding = 6;
    const headerHeight = 24;
    let y = headerY;

    const totalValue = rows.reduce((sum, row) => sum + Number(row.valor || 0), 0);

    const drawPageChrome = () => {
      doc.save();
      doc.rect(0, 0, pageWidth, 18).fill('#12726b');
      doc.restore();

      doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text('Lançamentos', margins.left, 34);
      doc.fillColor('#52606d').fontSize(9).font('Helvetica').text('Exportação da tabela de lançamentos', margins.left, 58);
      doc.text(`Total de itens: ${rows.length} | Total em valor: R$ ${totalValue.toFixed(2)}`, margins.left, 70);
    };

    const drawTableHeader = (top: number) => {
      let x = rowX;
      doc.save();
      doc.fillColor('#eef6f2');
      doc.rect(rowX, top, tableWidth, headerHeight).fill();
      doc.restore();

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#334e68');
      const headers = ['ID', 'Descrição', 'Data', 'Valor', 'Tipo', 'Situação'];
      for (let index = 0; index < headers.length; index++) {
        doc.text(headers[index], x + 6, top + 7, {
          width: columnWidths[index] - 12,
          align: index === 3 ? 'right' : 'left',
        });
        x += columnWidths[index];
      }
    };

    const measureRowHeight = (row: PdfRow) => {
      const values = [
        String(row.id),
        row.descricao,
        row.data_lancamento,
        `R$ ${Number(row.valor).toFixed(2)}`,
        row.tipo_lancamento,
        row.situacao,
      ];

      const heights = values.map((value, index) => {
        const width = columnWidths[index] - 12;
        const align = index === 3 ? 'right' : 'left';
        return doc.heightOfString(value, { width, align }) + rowPadding * 2;
      });

      return Math.max(22, ...heights);
    };

    const addPage = () => {
      doc.addPage({ size: 'A4', layout: 'landscape', margin: 32 });
      y = headerY;
      drawPageChrome();
      drawTableHeader(y);
      y += headerHeight;
      doc.font('Helvetica').fontSize(9);
    };

    drawPageChrome();
    drawTableHeader(y);
    y += headerHeight;

    doc.font('Helvetica').fontSize(9);

    rows.forEach((row, index) => {
      const rowHeight = measureRowHeight(row);
      if (y + rowHeight > pageHeight - margins.bottom) {
        addPage();
      }

      if (index % 2 === 0) {
        doc.save();
        doc.fillColor('#f9fbfc');
        doc.rect(rowX, y, tableWidth, rowHeight).fill();
        doc.restore();
      }

      let x = rowX;
      const values = [
        String(row.id),
        row.descricao,
        row.data_lancamento,
        `R$ ${Number(row.valor).toFixed(2)}`,
        row.tipo_lancamento,
        row.situacao,
      ];

      values.forEach((value, valueIndex) => {
        doc.fillColor('#1f2933').text(value, x + 6, y + rowPadding, {
          width: columnWidths[valueIndex] - 12,
          align: valueIndex === 3 ? 'right' : 'left',
        });
        x += columnWidths[valueIndex];
      });

      doc.save();
      doc.strokeColor('#d9e2ec').lineWidth(0.8);
      doc.rect(rowX, y, tableWidth, rowHeight).stroke();
      doc.restore();

      y += rowHeight;
    });

    doc.fontSize(8).fillColor('#52606d').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margins.left, pageHeight - margins.bottom + 6);
    doc.end();
  }
}