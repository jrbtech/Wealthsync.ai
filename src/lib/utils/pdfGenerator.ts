import type {
  Report,
  AgencyBranding,
  ClientProject,
  SEOIssue,
  SEOOpportunity,
  ContentCalendarItem,
  CompetitorAnalysis,
  CONTENT_TYPE_LABELS,
  SEARCH_INTENT_LABELS
} from '$lib/types';
import { formatDate, formatCurrency, formatNumber } from './format';

/**
 * Generate HTML template for agency report PDF
 */
export function generateReportHTML(
  report: Report,
  project: ClientProject,
  branding: AgencyBranding
): string {
  const reportDate = formatDate(new Date(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    @page {
      margin: 0.75in;
      size: letter;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: ${branding.fontFamily};
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${adjustColor(branding.primaryColor, 20)} 100%);
      color: white;
      page-break-after: always;
      padding: 2in;
    }

    .cover-logo {
      max-width: 200px;
      max-height: 80px;
      margin-bottom: 40px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 700;
      margin: 0 0 20px 0;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 18pt;
      opacity: 0.9;
      margin: 0 0 40px 0;
    }

    .cover-client {
      font-size: 14pt;
      opacity: 0.8;
      margin-top: auto;
    }

    .cover-date {
      font-size: 12pt;
      opacity: 0.7;
      margin-top: 10px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 2px solid ${branding.primaryColor};
      margin-bottom: 30px;
    }

    .header-logo {
      max-height: 40px;
    }

    .header-info {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }

    /* Page Title */
    .page-title {
      font-size: 24pt;
      color: ${branding.primaryColor};
      margin: 0 0 30px 0;
      padding-bottom: 10px;
      border-bottom: 3px solid ${branding.secondaryColor};
    }

    /* Section Styles */
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 16pt;
      color: ${branding.primaryColor};
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
    }

    .subsection-title {
      font-size: 13pt;
      color: ${branding.primaryColor};
      margin: 20px 0 10px 0;
    }

    /* Executive Summary */
    .executive-summary {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 8px;
      border-left: 4px solid ${branding.secondaryColor};
      margin-bottom: 30px;
    }

    .executive-summary p {
      margin: 0 0 15px 0;
    }

    .executive-summary p:last-child {
      margin-bottom: 0;
    }

    /* Score Cards */
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }

    .score-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .score-value {
      font-size: 32pt;
      font-weight: 700;
      color: ${branding.primaryColor};
      margin-bottom: 5px;
    }

    .score-value.good { color: #22c55e; }
    .score-value.warning { color: #f59e0b; }
    .score-value.poor { color: #ef4444; }

    .score-label {
      font-size: 10pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Issues & Opportunities */
    .issue-list, .opportunity-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .issue-item, .opportunity-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
    }

    .issue-header, .opportunity-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .severity-badge, .priority-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-critical { background: #fee2e2; color: #dc2626; }
    .severity-warning { background: #fef3c7; color: #d97706; }
    .severity-info { background: #dbeafe; color: #2563eb; }

    .priority-high { background: #fee2e2; color: #dc2626; }
    .priority-medium { background: #fef3c7; color: #d97706; }
    .priority-low { background: #d1fae5; color: #059669; }

    .issue-title, .opportunity-title {
      font-weight: 600;
      color: #1a1a1a;
    }

    .issue-description, .opportunity-description {
      font-size: 10pt;
      color: #666;
      margin-bottom: 8px;
    }

    .issue-recommendation {
      font-size: 10pt;
      color: ${branding.primaryColor};
      font-style: italic;
    }

    .opportunity-impact {
      font-size: 10pt;
      color: #22c55e;
      font-weight: 500;
    }

    /* Content Calendar Table */
    .content-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }

    .content-table th {
      background: ${branding.primaryColor};
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }

    .content-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .content-table tr:nth-child(even) {
      background: #f9fafb;
    }

    .content-type-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      background: ${branding.secondaryColor}20;
      color: ${branding.secondaryColor};
    }

    /* Competitor Table */
    .competitor-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    .competitor-table th {
      background: ${branding.primaryColor};
      color: white;
      padding: 12px;
      text-align: left;
    }

    .competitor-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* ROI Box */
    .roi-box {
      background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${adjustColor(branding.primaryColor, 20)} 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-top: 30px;
    }

    .roi-title {
      font-size: 14pt;
      margin: 0 0 20px 0;
      opacity: 0.9;
    }

    .roi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .roi-metric {
      text-align: center;
    }

    .roi-value {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .roi-label {
      font-size: 10pt;
      opacity: 0.8;
    }

    /* Recommendations */
    .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .recommendations-list li {
      padding: 12px 15px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid ${branding.secondaryColor};
    }

    .recommendations-list li::before {
      content: counter(recommendation);
      counter-increment: recommendation;
      display: inline-block;
      width: 24px;
      height: 24px;
      background: ${branding.secondaryColor};
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-size: 11pt;
      font-weight: 600;
      margin-right: 12px;
    }

    .recommendations-list {
      counter-reset: recommendation;
    }

    /* Footer */
    .footer {
      position: fixed;
      bottom: 0.5in;
      left: 0.75in;
      right: 0.75in;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt;
      color: #999;
      display: flex;
      justify-content: space-between;
    }

    /* Page Break */
    .page-break {
      page-break-before: always;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.agencyName}" class="cover-logo">` : ''}
    <h1 class="cover-title">${report.title}</h1>
    <p class="cover-subtitle">Strategic Analysis & Recommendations</p>
    <div class="cover-client">
      <strong>Prepared for:</strong> ${project.clientName}<br>
      <a href="${project.clientUrl}" style="color: white; opacity: 0.8;">${project.clientUrl}</a>
    </div>
    <p class="cover-date">${reportDate}</p>
  </div>

  <!-- Executive Summary Page -->
  <div class="page-break">
    ${generateHeader(branding, reportDate)}
    <h1 class="page-title">Executive Summary</h1>
    <div class="executive-summary">
      ${report.executiveSummary?.split('\n\n').map(p => `<p>${p}</p>`).join('') || '<p>No executive summary available.</p>'}
    </div>

    ${report.roiProjections ? `
    <div class="roi-box">
      <h3 class="roi-title">Projected ROI Impact</h3>
      <div class="roi-grid">
        <div class="roi-metric">
          <div class="roi-value">${report.roiProjections.trafficGrowth}</div>
          <div class="roi-label">Traffic Growth</div>
        </div>
        <div class="roi-metric">
          <div class="roi-value">${report.roiProjections.estimatedRevenue}</div>
          <div class="roi-label">Estimated Monthly Revenue</div>
        </div>
      </div>
    </div>
    ` : ''}
  </div>

  ${report.seoAudit ? generateSEOAuditSection(report.seoAudit, branding, reportDate) : ''}
  ${report.contentCalendar?.length ? generateContentCalendarSection(report.contentCalendar, branding, reportDate) : ''}
  ${report.competitorAnalysis?.length ? generateCompetitorSection(report.competitorAnalysis, branding, reportDate) : ''}
  ${report.recommendations?.length ? generateRecommendationsSection(report.recommendations, branding, reportDate) : ''}

  <!-- Footer -->
  <div class="footer">
    <span>${branding.footerText || 'Confidential'}</span>
    <span>${branding.agencyName} | ${branding.contactEmail || ''}</span>
  </div>
</body>
</html>
  `;
}

function generateHeader(branding: AgencyBranding, date: string): string {
  return `
    <div class="header">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.agencyName}" class="header-logo">` : `<span style="font-weight: 600; color: ${branding.primaryColor};">${branding.agencyName}</span>`}
      <div class="header-info">
        ${branding.contactEmail ? `${branding.contactEmail}<br>` : ''}
        ${branding.contactPhone ? `${branding.contactPhone}<br>` : ''}
        ${date}
      </div>
    </div>
  `;
}

function generateSEOAuditSection(audit: Report['seoAudit'], branding: AgencyBranding, date: string): string {
  if (!audit) return '';

  const getScoreClass = (score: number) => {
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'poor';
  };

  return `
    <div class="page-break">
      ${generateHeader(branding, date)}
      <h1 class="page-title">SEO Audit Results</h1>

      <div class="score-grid">
        <div class="score-card">
          <div class="score-value ${getScoreClass(audit.overallScore)}">${audit.overallScore}</div>
          <div class="score-label">Overall Score</div>
        </div>
        <div class="score-card">
          <div class="score-value ${getScoreClass(audit.technicalScore)}">${audit.technicalScore}</div>
          <div class="score-label">Technical</div>
        </div>
        <div class="score-card">
          <div class="score-value ${getScoreClass(audit.contentScore)}">${audit.contentScore}</div>
          <div class="score-label">Content</div>
        </div>
        <div class="score-card">
          <div class="score-value ${getScoreClass(audit.backlinksScore)}">${audit.backlinksScore}</div>
          <div class="score-label">Backlinks</div>
        </div>
      </div>

      ${audit.issues?.length ? `
      <div class="section">
        <h2 class="section-title">Issues Found (${audit.issues.length})</h2>
        <ul class="issue-list">
          ${audit.issues.slice(0, 8).map(issue => `
            <li class="issue-item">
              <div class="issue-header">
                <span class="severity-badge severity-${issue.severity}">${issue.severity}</span>
                <span class="issue-title">${issue.title}</span>
              </div>
              <div class="issue-description">${issue.description}</div>
              <div class="issue-recommendation">Recommendation: ${issue.recommendation}</div>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${audit.opportunities?.length ? `
      <div class="section">
        <h2 class="section-title">Opportunities (${audit.opportunities.length})</h2>
        <ul class="opportunity-list">
          ${audit.opportunities.slice(0, 6).map(opp => `
            <li class="opportunity-item">
              <div class="opportunity-header">
                <span class="priority-badge priority-${opp.priority}">${opp.priority} priority</span>
                <span class="opportunity-title">${opp.title}</span>
              </div>
              <div class="opportunity-description">${opp.description}</div>
              <div class="opportunity-impact">Estimated Impact: ${opp.estimatedImpact}</div>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  `;
}

function generateContentCalendarSection(calendar: ContentCalendarItem[], branding: AgencyBranding, date: string): string {
  const contentTypeLabels: Record<string, string> = {
    blog_post: 'Blog Post',
    landing_page: 'Landing Page',
    pillar_page: 'Pillar Page',
    product_page: 'Product Page',
    guide: 'Guide',
    case_study: 'Case Study'
  };

  return `
    <div class="page-break">
      ${generateHeader(branding, date)}
      <h1 class="page-title">90-Day Content Calendar</h1>

      <table class="content-table">
        <thead>
          <tr>
            <th style="width: 50px;">Week</th>
            <th style="width: 30%;">Content Title</th>
            <th>Target Keyword</th>
            <th style="width: 100px;">Type</th>
            <th style="width: 70px;">Words</th>
            <th style="width: 60px;">Priority</th>
          </tr>
        </thead>
        <tbody>
          ${calendar.map(item => `
            <tr>
              <td style="text-align: center; font-weight: 600;">${item.week}</td>
              <td>${item.title}</td>
              <td><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 9pt;">${item.targetKeyword}</code></td>
              <td><span class="content-type-badge">${contentTypeLabels[item.contentType] || item.contentType}</span></td>
              <td style="text-align: right;">${item.wordCount.toLocaleString()}</td>
              <td><span class="priority-badge priority-${item.priority}">${item.priority}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateCompetitorSection(competitors: CompetitorAnalysis[], branding: AgencyBranding, date: string): string {
  return `
    <div class="page-break">
      ${generateHeader(branding, date)}
      <h1 class="page-title">Competitor Analysis</h1>

      <table class="competitor-table">
        <thead>
          <tr>
            <th>Competitor</th>
            <th>Domain Authority</th>
            <th>Organic Keywords</th>
            <th>Est. Traffic</th>
            <th>Backlinks</th>
          </tr>
        </thead>
        <tbody>
          ${competitors.map(comp => `
            <tr>
              <td><strong>${comp.competitorUrl}</strong></td>
              <td>${comp.domainAuthority || 'N/A'}</td>
              <td>${comp.organicKeywords?.toLocaleString() || 'N/A'}</td>
              <td>${comp.estimatedTraffic?.toLocaleString() || 'N/A'}</td>
              <td>${comp.backlinksCount?.toLocaleString() || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${competitors.some(c => c.contentGaps?.length) ? `
      <div class="section" style="margin-top: 30px;">
        <h2 class="section-title">Content Gap Opportunities</h2>
        ${competitors.map(comp => comp.contentGaps?.length ? `
          <h3 class="subsection-title">${comp.competitorUrl}</h3>
          <ul>
            ${comp.contentGaps.slice(0, 5).map(gap => `<li>${gap}</li>`).join('')}
          </ul>
        ` : '').join('')}
      </div>
      ` : ''}
    </div>
  `;
}

function generateRecommendationsSection(recommendations: string[], branding: AgencyBranding, date: string): string {
  return `
    <div class="page-break">
      ${generateHeader(branding, date)}
      <h1 class="page-title">Strategic Recommendations</h1>

      <ol class="recommendations-list">
        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ol>

      <div style="margin-top: 40px; padding: 25px; background: #f8f9fa; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0 0 10px 0; color: ${branding.primaryColor};">Ready to Get Started?</h3>
        <p style="margin: 0; color: #666;">Contact us to discuss implementation and next steps.</p>
        ${branding.contactEmail ? `<p style="margin: 15px 0 0 0;"><a href="mailto:${branding.contactEmail}" style="color: ${branding.secondaryColor}; font-weight: 600;">${branding.contactEmail}</a></p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Adjust color brightness
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

/**
 * Open report in new window for printing
 */
export function openReportForPrint(html: string): void {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
