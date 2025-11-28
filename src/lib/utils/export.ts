import { formatCurrency, formatDate } from './format';

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string; format?: (value: any) => string }[],
  filename: string
): void {
  if (data.length === 0) return;

  // Create header row
  const header = columns.map(col => `"${col.label}"`).join(',');

  // Create data rows
  const rows = data.map(item =>
    columns
      .map(col => {
        const value = item[col.key];
        const formatted = col.format ? col.format(value) : String(value ?? '');
        // Escape quotes and wrap in quotes
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');

  // Create and download file
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Export wealth report to CSV
 */
export function exportWealthReport(
  entities: Array<{
    name: string;
    type: string;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }>,
  totalNetWorth: number,
  filename: string = 'wealth-report'
): void {
  const reportDate = formatDate(new Date(), 'MMMM d, yyyy');

  const columns = [
    { key: 'name' as const, label: 'Entity Name' },
    { key: 'type' as const, label: 'Type' },
    { key: 'totalAssets' as const, label: 'Total Assets', format: (v: number) => formatCurrency(v) },
    { key: 'totalLiabilities' as const, label: 'Total Liabilities', format: (v: number) => formatCurrency(v) },
    { key: 'netWorth' as const, label: 'Net Worth', format: (v: number) => formatCurrency(v) },
  ];

  // Add total row
  const dataWithTotal = [
    ...entities,
    {
      name: 'TOTAL',
      type: '',
      totalAssets: entities.reduce((sum, e) => sum + e.totalAssets, 0),
      totalLiabilities: entities.reduce((sum, e) => sum + e.totalLiabilities, 0),
      netWorth: totalNetWorth,
    },
  ];

  exportToCSV(dataWithTotal, columns, `${filename}-${formatDate(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Export advisors to CSV
 */
export function exportAdvisors(
  advisors: Array<{
    name: string;
    firm: string;
    email: string;
    phone: string;
    specialty: string;
    lastContactDate?: Date | null;
  }>,
  specialtyLabels: Record<string, string>
): void {
  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'firm' as const, label: 'Firm' },
    { key: 'email' as const, label: 'Email' },
    { key: 'phone' as const, label: 'Phone' },
    { key: 'specialty' as const, label: 'Specialty', format: (v: string) => specialtyLabels[v] || v },
    {
      key: 'lastContactDate' as const,
      label: 'Last Contact',
      format: (v: Date | null) => (v ? formatDate(v) : 'Never'),
    },
  ];

  exportToCSV(advisors, columns, `advisors-${formatDate(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Export deadlines to CSV
 */
export function exportDeadlines(
  deadlines: Array<{
    title: string;
    category: string;
    dueDate: Date;
    status: string;
    recurrence: string;
    notes: string;
  }>,
  categoryLabels: Record<string, string>
): void {
  const columns = [
    { key: 'title' as const, label: 'Title' },
    { key: 'category' as const, label: 'Category', format: (v: string) => categoryLabels[v] || v },
    { key: 'dueDate' as const, label: 'Due Date', format: (v: Date) => formatDate(v) },
    { key: 'status' as const, label: 'Status', format: (v: string) => v.charAt(0).toUpperCase() + v.slice(1) },
    { key: 'recurrence' as const, label: 'Recurrence' },
    { key: 'notes' as const, label: 'Notes' },
  ];

  exportToCSV(deadlines, columns, `deadlines-${formatDate(new Date(), 'yyyy-MM-dd')}`);
}

/**
 * Generate a simple PDF-style HTML report that can be printed
 */
export function generatePrintableReport(
  title: string,
  familyName: string,
  sections: Array<{
    title: string;
    content: string;
  }>
): string {
  const reportDate = formatDate(new Date(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - ${familyName}</title>
  <style>
    @page { margin: 1in; }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1a2b4a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      color: #1a2b4a;
      margin: 0;
    }
    .header .family-name {
      font-size: 18px;
      color: #666;
      margin-top: 5px;
    }
    .header .date {
      font-size: 12px;
      color: #999;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 16px;
      color: #1a2b4a;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    .section-content {
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .money {
      font-family: 'Courier New', monospace;
      text-align: right;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="family-name">${familyName}</div>
    <div class="date">Generated on ${reportDate}</div>
  </div>

  ${sections.map(s => `
  <div class="section">
    <h2>${s.title}</h2>
    <div class="section-content">${s.content}</div>
  </div>
  `).join('')}

  <div class="footer">
    Generated by WealthSync.ai | Confidential
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `;
}

/**
 * Open printable report in new window
 */
export function openPrintableReport(html: string): void {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/**
 * Download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
