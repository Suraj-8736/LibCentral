import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data array as a CSV file
 */
export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  const headerKeys = headers.map((h) => h.key);
  const headerLabels = headers.map((h) => `"${h.label}"`).join(',');

  const csvRows = data.map((row) => {
    return headerKeys
      .map((key) => {
        let val = row[key];
        if (val === undefined || val === null) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
  });

  const csvContent = [headerLabels, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data array as a formatted PDF report
 */
export const exportToPDF = ({
  title = 'Library Report',
  subtitle = 'Official Academic Circulation Record',
  headers = [],
  rows = [],
  filename = 'library_report',
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Modern Academic Header
  doc.setFillColor(30, 27, 75); // Indigo 950
  doc.rect(0, 0, doc.internal.pageSize.width, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LibCentral — Central Academic Library', 40, 32);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254);
  doc.text(title.toUpperCase(), 40, 52);

  const timestamp = new Date().toLocaleString('en-IN');
  doc.setFontSize(9);
  doc.text(`Generated: ${timestamp}`, doc.internal.pageSize.width - 200, 52);

  // Subtitle / metadata below header
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(subtitle, 40, 90);

  // AutoTable
  doc.autoTable({
    startY: 105,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Brand Indigo 600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      // Footer page numbers
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        str,
        doc.internal.pageSize.width - 70,
        doc.internal.pageSize.height - 20
      );
      doc.text(
        'Confidential & Proprietary — University Library System',
        40,
        doc.internal.pageSize.height - 20
      );
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
