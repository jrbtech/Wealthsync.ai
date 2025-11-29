import type {
  WealthReport,
  AdvisorBranding,
  ClientProfile,
  WealthRisk,
  AdvisorAction,
  ComplianceDeadline
} from '$lib/types';
import { formatDate, formatCurrency, formatNumber } from './format';

const assetCategoryLabels: Record<string, string> = {
  cash: 'Cash and Equivalents',
  investments: 'Marketable Securities',
  real_estate: 'Real Property',
  alternatives: 'Alternative Investments',
  other: 'Other Assets'
};

const advisorSpecialtyLabels: Record<string, string> = {
  cpa: 'Tax Advisor',
  estate_attorney: 'Estate Counsel',
  wealth_manager: 'Investment Advisor',
  insurance: 'Insurance Advisor',
  banker: 'Private Banker',
  other: 'Other Professional'
};

const deadlineCategoryLabels: Record<string, string> = {
  tax: 'Tax',
  legal: 'Legal',
  insurance: 'Insurance',
  trust: 'Trust',
  investment: 'Investment',
  other: 'Other'
};

const entityTypeLabels: Record<string, string> = {
  personal: 'Individual',
  trust: 'Trust',
  llc: 'Limited Liability Company',
  foundation: 'Private Foundation',
  other: 'Other Entity'
};

const riskCategoryLabels: Record<string, string> = {
  tax: 'Tax Exposure',
  legal: 'Legal Risk',
  insurance: 'Insurance Gap',
  liquidity: 'Liquidity Constraint',
  concentration: 'Concentration Risk',
  succession: 'Succession Planning',
  compliance: 'Regulatory Compliance'
};

export function generateWealthReportHTML(
  report: WealthReport,
  client: ClientProfile,
  branding: AdvisorBranding
): string {
  const reportDate = formatDate(new Date(report.reportDate), 'MMMM d, yyyy');
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    @page {
      margin: 0.875in 0.75in;
      size: letter;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Times New Roman', Georgia, serif;
      line-height: 1.5;
      color: #1a1a1a;
      font-size: 11pt;
      -webkit-font-smoothing: antialiased;
    }

    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5in 1.5in;
      background: ${branding.primaryColor};
      color: white;
      page-break-after: always;
    }

    .cover-header {
      text-align: left;
    }

    .cover-logo {
      max-width: 180px;
      max-height: 60px;
      margin-bottom: 0.5in;
    }

    .cover-firm-name {
      font-size: 14pt;
      font-weight: 400;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 400;
      line-height: 1.15;
      margin-bottom: 0.3in;
      letter-spacing: -0.01em;
    }

    .cover-client {
      font-size: 18pt;
      font-weight: 400;
      opacity: 0.9;
      border-top: 1px solid rgba(255,255,255,0.3);
      padding-top: 0.25in;
      margin-top: 0.25in;
    }

    .cover-footer {
      text-align: left;
    }

    .cover-date {
      font-size: 11pt;
      opacity: 0.8;
      margin-bottom: 0.1in;
    }

    .cover-confidential {
      font-size: 9pt;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 12pt;
      border-bottom: 0.5pt solid #d0d0d0;
      margin-bottom: 24pt;
    }

    .header-left {
      font-size: 9pt;
      color: #666;
    }

    .header-firm {
      font-weight: 600;
      color: ${branding.primaryColor};
    }

    .header-right {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }

    .page-title {
      font-size: 20pt;
      font-weight: 400;
      color: ${branding.primaryColor};
      margin-bottom: 24pt;
      letter-spacing: -0.01em;
    }

    .section {
      margin-bottom: 30pt;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 600;
      color: ${branding.primaryColor};
      margin-bottom: 12pt;
      padding-bottom: 6pt;
      border-bottom: 0.5pt solid #e0e0e0;
      letter-spacing: 0.02em;
    }

    .subsection-title {
      font-size: 11pt;
      font-weight: 600;
      color: #333;
      margin: 18pt 0 9pt 0;
    }

    .executive-summary {
      background: #f8f8f8;
      padding: 20pt;
      border-left: 3pt solid ${branding.primaryColor};
      margin-bottom: 30pt;
    }

    .executive-summary p {
      margin-bottom: 12pt;
      text-align: justify;
      line-height: 1.6;
    }

    .executive-summary p:last-child {
      margin-bottom: 0;
    }

    .networth-display {
      background: ${branding.primaryColor};
      color: white;
      padding: 30pt;
      text-align: center;
      margin-bottom: 30pt;
    }

    .networth-amount {
      font-size: 36pt;
      font-weight: 400;
      letter-spacing: -0.02em;
      margin-bottom: 6pt;
    }

    .networth-label {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      opacity: 0.85;
    }

    .networth-change {
      margin-top: 12pt;
      font-size: 11pt;
      opacity: 0.9;
    }

    .metrics-row {
      display: flex;
      justify-content: space-between;
      border-top: 1pt solid rgba(255,255,255,0.2);
      margin-top: 20pt;
      padding-top: 20pt;
    }

    .metric-item {
      text-align: center;
      flex: 1;
    }

    .metric-value {
      font-size: 18pt;
      font-weight: 400;
      margin-bottom: 3pt;
    }

    .metric-label {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.8;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 24pt;
    }

    .data-table th {
      background: #f5f5f5;
      color: #333;
      padding: 10pt 12pt;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1pt solid #ddd;
    }

    .data-table td {
      padding: 10pt 12pt;
      border-bottom: 0.5pt solid #eee;
      vertical-align: top;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table .numeric {
      text-align: right;
      font-family: 'Courier New', monospace;
    }

    .entity-badge {
      display: inline-block;
      padding: 2pt 8pt;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f0f0f0;
      color: #555;
    }

    .allocation-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12pt;
      margin-bottom: 24pt;
    }

    .allocation-item {
      flex: 1;
      min-width: 120pt;
      background: #fafafa;
      padding: 15pt;
      border: 0.5pt solid #e5e5e5;
    }

    .allocation-value {
      font-size: 16pt;
      font-weight: 400;
      color: ${branding.primaryColor};
      margin-bottom: 3pt;
    }

    .allocation-label {
      font-size: 9pt;
      color: #666;
    }

    .allocation-percent {
      font-size: 10pt;
      color: #888;
      margin-top: 6pt;
    }

    .finding-item {
      background: #fff;
      border: 0.5pt solid #e0e0e0;
      padding: 15pt;
      margin-bottom: 12pt;
      page-break-inside: avoid;
    }

    .finding-header {
      display: flex;
      align-items: flex-start;
      gap: 10pt;
      margin-bottom: 10pt;
    }

    .severity-indicator {
      width: 4pt;
      height: 100%;
      min-height: 40pt;
      flex-shrink: 0;
    }

    .severity-critical { background: #c41e3a; }
    .severity-warning { background: #cc8400; }
    .severity-info { background: #2563eb; }

    .finding-content {
      flex: 1;
    }

    .finding-badges {
      display: flex;
      gap: 8pt;
      margin-bottom: 8pt;
    }

    .finding-badge {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2pt 6pt;
    }

    .badge-critical { background: #fce8ec; color: #c41e3a; }
    .badge-warning { background: #fef3e0; color: #cc8400; }
    .badge-info { background: #e8f0fe; color: #2563eb; }
    .badge-category { background: #f5f5f5; color: #555; }

    .finding-title {
      font-size: 11pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 6pt;
    }

    .finding-description {
      font-size: 10pt;
      color: #444;
      margin-bottom: 10pt;
      line-height: 1.5;
    }

    .finding-impact {
      font-size: 10pt;
      color: #c41e3a;
      margin-bottom: 8pt;
    }

    .finding-recommendation {
      font-size: 10pt;
      color: #333;
      background: #f8f8f8;
      padding: 10pt;
      border-left: 2pt solid ${branding.primaryColor};
    }

    .finding-meta {
      font-size: 9pt;
      color: #888;
      margin-top: 8pt;
      font-style: italic;
    }

    .action-item {
      display: flex;
      gap: 15pt;
      background: #fff;
      border: 0.5pt solid #e0e0e0;
      padding: 12pt;
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }

    .action-priority {
      width: 70pt;
      flex-shrink: 0;
      text-align: center;
    }

    .priority-badge {
      display: inline-block;
      padding: 3pt 8pt;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .priority-urgent { background: #fce8ec; color: #c41e3a; }
    .priority-high { background: #fef3e0; color: #cc8400; }
    .priority-medium { background: #e8f0fe; color: #2563eb; }
    .priority-low { background: #e8f5e8; color: #2e7d32; }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: 10pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4pt;
    }

    .action-context {
      font-size: 9pt;
      color: #666;
      line-height: 1.5;
    }

    .action-meta {
      font-size: 9pt;
      color: #888;
      margin-top: 8pt;
    }

    .advisor-tag {
      display: inline-block;
      background: #f0f0f0;
      padding: 1pt 6pt;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .calendar-section {
      margin-bottom: 30pt;
    }

    .calendar-month {
      margin-bottom: 20pt;
      page-break-inside: avoid;
    }

    .calendar-month-header {
      font-size: 12pt;
      font-weight: 600;
      color: ${branding.primaryColor};
      margin-bottom: 10pt;
      padding-bottom: 6pt;
      border-bottom: 1pt solid ${branding.primaryColor};
    }

    .calendar-item {
      padding: 8pt 0;
      border-bottom: 0.5pt solid #eee;
      font-size: 10pt;
    }

    .calendar-item:last-child {
      border-bottom: none;
    }

    .calendar-title {
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 2pt;
    }

    .calendar-details {
      font-size: 9pt;
      color: #666;
    }

    .calendar-penalty {
      font-size: 9pt;
      color: #c41e3a;
      font-style: italic;
    }

    .recommendations-list {
      list-style: none;
      counter-reset: recommendation;
    }

    .recommendations-list li {
      padding: 12pt 12pt 12pt 45pt;
      margin-bottom: 10pt;
      background: #fafafa;
      border-left: 2pt solid ${branding.primaryColor};
      position: relative;
      font-size: 10pt;
      line-height: 1.5;
    }

    .recommendations-list li::before {
      content: counter(recommendation);
      counter-increment: recommendation;
      position: absolute;
      left: 12pt;
      top: 12pt;
      width: 20pt;
      height: 20pt;
      background: ${branding.primaryColor};
      color: white;
      font-size: 10pt;
      font-weight: 600;
      text-align: center;
      line-height: 20pt;
    }

    .page-footer {
      position: fixed;
      bottom: 0.5in;
      left: 0.75in;
      right: 0.75in;
      padding-top: 10pt;
      border-top: 0.5pt solid #ddd;
      font-size: 8pt;
      color: #888;
      display: flex;
      justify-content: space-between;
    }

    .disclaimer {
      font-size: 8pt;
      color: #888;
      background: #fafafa;
      padding: 12pt;
      margin-top: 30pt;
      line-height: 1.5;
      font-style: italic;
    }

    .page-break {
      page-break-before: always;
    }

    .summary-metrics {
      display: flex;
      gap: 15pt;
      margin: 20pt 0;
    }

    .summary-metric {
      flex: 1;
      background: #f8f8f8;
      padding: 15pt;
      text-align: center;
    }

    .summary-metric-value {
      font-size: 14pt;
      font-weight: 400;
      color: ${branding.primaryColor};
      margin-bottom: 3pt;
    }

    .summary-metric-label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-header">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.firmName}" class="cover-logo">` : `<div class="cover-firm-name">${branding.firmName}</div>`}
    </div>

    <div class="cover-content">
      <h1 class="cover-title">${report.title}</h1>
      <div class="cover-client">
        Prepared for ${client.clientName}
      </div>
    </div>

    <div class="cover-footer">
      <div class="cover-date">${reportDate}</div>
      <div class="cover-confidential">Confidential</div>
    </div>
  </div>

  <div class="page-break">
    ${generateHeader(branding, reportDate, client.clientName)}
    <h1 class="page-title">Executive Summary</h1>
    <div class="executive-summary">
      ${report.executiveSummary?.split('\n\n').map(p => `<p>${p}</p>`).join('') || '<p>Summary not available.</p>'}
    </div>

    ${report.netWorthSummary ? `
    <div class="networth-display">
      <div class="networth-amount">${formatCurrency(report.netWorthSummary.netWorth)}</div>
      <div class="networth-label">Total Net Worth</div>
      ${report.netWorthSummary.changeFromPrevious ? `
      <div class="networth-change">
        ${report.netWorthSummary.changeFromPrevious.amount >= 0 ? '+' : ''}${formatCurrency(report.netWorthSummary.changeFromPrevious.amount)}
        (${report.netWorthSummary.changeFromPrevious.percentage >= 0 ? '+' : ''}${report.netWorthSummary.changeFromPrevious.percentage.toFixed(1)}%)
        from ${report.netWorthSummary.changeFromPrevious.period}
      </div>
      ` : ''}
      <div class="metrics-row">
        <div class="metric-item">
          <div class="metric-value">${formatCurrency(report.netWorthSummary.totalAssets)}</div>
          <div class="metric-label">Total Assets</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">${formatCurrency(report.netWorthSummary.totalLiabilities)}</div>
          <div class="metric-label">Total Liabilities</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">${formatCurrency(report.netWorthSummary.liquidAssets)}</div>
          <div class="metric-label">Liquid Assets</div>
        </div>
      </div>
    </div>
    ` : ''}
  </div>

  ${report.netWorthSummary ? generateAssetAllocationSection(report.netWorthSummary, branding, reportDate, client.clientName) : ''}
  ${report.risks?.length ? generateRisksSection(report.risks, branding, reportDate, client.clientName) : ''}
  ${report.advisorActions?.length ? generateAdvisorActionsSection(report.advisorActions, branding, reportDate, client.clientName) : ''}
  ${report.complianceCalendar?.length ? generateComplianceCalendarSection(report.complianceCalendar, branding, reportDate, client.clientName) : ''}
  ${report.recommendations?.length ? generateRecommendationsSection(report.recommendations, branding, reportDate, client.clientName) : ''}

  <div class="page-footer">
    <span>${branding.footerText || 'Confidential'}</span>
    <span>${branding.firmName}</span>
  </div>
</body>
</html>
  `;
}

function generateHeader(branding: AdvisorBranding, date: string, clientName: string): string {
  return `
    <div class="page-header">
      <div class="header-left">
        <span class="header-firm">${branding.firmName}</span>
      </div>
      <div class="header-right">
        ${clientName}<br>
        ${date}
      </div>
    </div>
  `;
}

function generateAssetAllocationSection(
  netWorth: WealthReport['netWorthSummary'],
  branding: AdvisorBranding,
  date: string,
  clientName: string
): string {
  if (!netWorth) return '';

  const totalAssets = netWorth.totalAssets || 1;

  return `
    <div class="page-break">
      ${generateHeader(branding, date, clientName)}
      <h1 class="page-title">Asset Allocation and Entity Structure</h1>

      <div class="section">
        <h2 class="section-title">Portfolio Composition</h2>
        <div class="allocation-grid">
          ${Object.entries(netWorth.assetAllocation || {}).map(([category, value]) => `
            <div class="allocation-item">
              <div class="allocation-value">${formatCurrency(value)}</div>
              <div class="allocation-label">${assetCategoryLabels[category] || category}</div>
              <div class="allocation-percent">${((value / totalAssets) * 100).toFixed(1)}% of total</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${netWorth.entityBreakdown?.length ? `
      <div class="section">
        <h2 class="section-title">Entity Structure</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Type</th>
              <th style="text-align: right;">Net Value</th>
              <th style="text-align: right;">Allocation</th>
            </tr>
          </thead>
          <tbody>
            ${netWorth.entityBreakdown.map(entity => `
              <tr>
                <td>${entity.entityName}</td>
                <td><span class="entity-badge">${entityTypeLabels[entity.entityType] || entity.entityType}</span></td>
                <td class="numeric">${formatCurrency(entity.netValue)}</td>
                <td class="numeric">${((entity.netValue / netWorth.netWorth) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="summary-metrics">
        <div class="summary-metric">
          <div class="summary-metric-value">${formatCurrency(netWorth.liquidAssets)}</div>
          <div class="summary-metric-label">Liquid Assets</div>
        </div>
        <div class="summary-metric">
          <div class="summary-metric-value">${((netWorth.liquidAssets / totalAssets) * 100).toFixed(1)}%</div>
          <div class="summary-metric-label">Liquidity Ratio</div>
        </div>
        <div class="summary-metric">
          <div class="summary-metric-value">${formatCurrency(netWorth.illiquidAssets)}</div>
          <div class="summary-metric-label">Illiquid Assets</div>
        </div>
      </div>
    </div>
  `;
}

function generateRisksSection(
  risks: WealthRisk[],
  branding: AdvisorBranding,
  date: string,
  clientName: string
): string {
  const sortedRisks = [...risks].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const criticalCount = risks.filter(r => r.severity === 'critical').length;
  const warningCount = risks.filter(r => r.severity === 'warning').length;
  const infoCount = risks.filter(r => r.severity === 'info').length;

  return `
    <div class="page-break">
      ${generateHeader(branding, date, clientName)}
      <h1 class="page-title">Risk Assessment</h1>

      <div class="summary-metrics">
        <div class="summary-metric">
          <div class="summary-metric-value" style="color: #c41e3a;">${criticalCount}</div>
          <div class="summary-metric-label">Critical Findings</div>
        </div>
        <div class="summary-metric">
          <div class="summary-metric-value" style="color: #cc8400;">${warningCount}</div>
          <div class="summary-metric-label">Elevated Concerns</div>
        </div>
        <div class="summary-metric">
          <div class="summary-metric-value" style="color: #2563eb;">${infoCount}</div>
          <div class="summary-metric-label">Informational</div>
        </div>
      </div>

      <div class="section">
        ${sortedRisks.slice(0, 8).map(risk => `
          <div class="finding-item">
            <div class="finding-header">
              <div class="severity-indicator severity-${risk.severity}"></div>
              <div class="finding-content">
                <div class="finding-badges">
                  <span class="finding-badge badge-${risk.severity}">${risk.severity === 'critical' ? 'Critical' : risk.severity === 'warning' ? 'Elevated' : 'Informational'}</span>
                  <span class="finding-badge badge-category">${riskCategoryLabels[risk.category] || risk.category}</span>
                </div>
                <div class="finding-title">${risk.title}</div>
                <div class="finding-description">${risk.description}</div>
                ${risk.financialImpact ? `<div class="finding-impact">Estimated Impact: ${risk.financialImpact}</div>` : ''}
                <div class="finding-recommendation"><strong>Recommendation:</strong> ${risk.recommendation}</div>
                ${risk.assignedAdvisor ? `<div class="finding-meta">Assigned to: ${advisorSpecialtyLabels[risk.assignedAdvisor] || risk.assignedAdvisor}</div>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateAdvisorActionsSection(
  actions: AdvisorAction[],
  branding: AdvisorBranding,
  date: string,
  clientName: string
): string {
  const sortedActions = [...actions].sort((a, b) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });

  return `
    <div class="page-break">
      ${generateHeader(branding, date, clientName)}
      <h1 class="page-title">Advisory Team Coordination</h1>

      <p style="margin-bottom: 20pt; color: #666; font-size: 10pt; line-height: 1.5;">
        The following action items have been identified for the professional advisory team.
        Each item is assigned to the appropriate specialist with context and timeline considerations.
      </p>

      <div class="section">
        ${sortedActions.slice(0, 12).map(action => `
          <div class="action-item">
            <div class="action-priority">
              <span class="priority-badge priority-${action.priority}">${action.priority}</span>
            </div>
            <div class="action-content">
              <div class="action-title">${action.action}</div>
              <div class="action-context">${action.context}</div>
              <div class="action-meta">
                <span class="advisor-tag">${advisorSpecialtyLabels[action.advisorRole] || action.advisorRole}</span>
                ${action.advisorName ? ` ${action.advisorName}` : ''}
                ${action.deadline ? ` | Due: ${formatDate(new Date(action.deadline), 'MMM d, yyyy')}` : ''}
                ${action.estimatedCost ? ` | Estimated: ${action.estimatedCost}` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateComplianceCalendarSection(
  calendar: ComplianceDeadline[],
  branding: AdvisorBranding,
  date: string,
  clientName: string
): string {
  const byMonth: Record<number, ComplianceDeadline[]> = {};
  calendar.forEach(item => {
    if (!byMonth[item.month]) byMonth[item.month] = [];
    byMonth[item.month].push(item);
  });

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return `
    <div class="page-break">
      ${generateHeader(branding, date, clientName)}
      <h1 class="page-title">Compliance Calendar</h1>

      <p style="margin-bottom: 20pt; color: #666; font-size: 10pt; line-height: 1.5;">
        A twelve-month schedule of regulatory obligations, filing requirements, and review deadlines.
        Each item indicates the responsible party and consequences for non-compliance.
      </p>

      <div class="calendar-section">
        ${Object.entries(byMonth).slice(0, 12).map(([month, items]) => `
          <div class="calendar-month">
            <div class="calendar-month-header">${monthNames[parseInt(month)]}</div>
            ${items.map(item => `
              <div class="calendar-item">
                <div class="calendar-title">${item.title}</div>
                <div class="calendar-details">${item.responsibleParty}</div>
                ${item.penalty ? `<div class="calendar-penalty">Non-compliance: ${item.penalty}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <div class="disclaimer">
        ${branding.disclaimerText || 'This calendar is for informational purposes only. Consult with qualified professionals to confirm all applicable deadlines and requirements for your specific situation.'}
      </div>
    </div>
  `;
}

function generateRecommendationsSection(
  recommendations: string[],
  branding: AdvisorBranding,
  date: string,
  clientName: string
): string {
  return `
    <div class="page-break">
      ${generateHeader(branding, date, clientName)}
      <h1 class="page-title">Strategic Recommendations</h1>

      <ol class="recommendations-list">
        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ol>

      <div style="margin-top: 40pt; padding: 25pt; background: #f8f8f8; text-align: center;">
        <p style="margin-bottom: 10pt; font-size: 12pt; color: ${branding.primaryColor}; font-weight: 600;">
          Questions Regarding This Analysis
        </p>
        <p style="margin: 0; color: #666; font-size: 10pt;">
          Please contact your advisory team to discuss these recommendations.
        </p>
        ${branding.contactEmail ? `<p style="margin-top: 12pt; font-size: 10pt;">${branding.contactEmail}</p>` : ''}
        ${branding.contactPhone ? `<p style="margin-top: 3pt; font-size: 10pt; color: #888;">${branding.contactPhone}</p>` : ''}
      </div>

      <div class="disclaimer">
        ${branding.disclaimerText || 'This report is for informational purposes only and does not constitute financial, legal, or tax advice. Consult with qualified professionals before making any financial decisions.'}
      </div>
    </div>
  `;
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

export function openWealthReportForPrint(html: string): void {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
