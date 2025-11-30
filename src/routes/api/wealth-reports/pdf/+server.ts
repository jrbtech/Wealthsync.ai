import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { jsPDF } from 'jspdf';
import type { WealthReport, ClientProfile, AdvisorBranding, WealthRisk, AdvisorAction, ComplianceDeadline } from '$lib/types';

interface GenerateWealthPDFRequest {
  report: WealthReport;
  client: ClientProfile;
  branding: AdvisorBranding;
}

const assetCategoryLabels: Record<string, string> = {
  cash: 'Cash & Equivalents',
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

const riskCategoryLabels: Record<string, string> = {
  tax: 'Tax Exposure',
  legal: 'Legal Risk',
  insurance: 'Insurance Gap',
  liquidity: 'Liquidity Constraint',
  concentration: 'Concentration Risk',
  succession: 'Succession Planning',
  compliance: 'Regulatory Compliance'
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { report, client, branding } = await request.json() as GenerateWealthPDFRequest;

    if (!report || !client || !branding) {
      throw error(400, 'Report, client, and branding are required');
    }

    // Generate PDF using jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;

    // Helper to add wrapped text
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 14): number => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin - 20) {
          pdf.addPage();
          y = margin + 30;
        }
        pdf.text(line, x, y);
        y += lineHeight;
      });
      return y;
    };

    // Helper to format currency
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    // Helper to format date
    const formatDate = (date: Date | string): string => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Parse hex color to RGB
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 15, g: 23, b: 42 };
    };

    const primaryColor = hexToRgb(branding.primaryColor || '#0f172a');
    const accentColor = hexToRgb(branding.accentColor || '#06b6d4');

    // ===== COVER PAGE =====
    pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(branding.firmName || 'WealthSync Advisory', margin, 80);

    pdf.setFontSize(32);
    pdf.text(report.title || 'Wealth Audit Report', margin, 280);

    pdf.setFontSize(18);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Prepared for ${client.clientName}`, margin, 330);

    pdf.setFontSize(11);
    pdf.setTextColor(150, 150, 150);
    pdf.text(formatDate(report.reportDate), margin, pageHeight - 100);
    pdf.text('CONFIDENTIAL', margin, pageHeight - 80);

    // ===== EXECUTIVE SUMMARY PAGE =====
    pdf.addPage();
    let yPos = margin;

    // Header
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
    pdf.text(`${client.clientName} | ${formatDate(report.reportDate)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 30;

    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 30;

    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.text('Executive Summary', margin, yPos);
    yPos += 40;

    // Net Worth Display
    if (report.netWorthSummary) {
      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 100, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.text(formatCurrency(report.netWorthSummary.netWorth), margin + 20, yPos + 50);

      pdf.setFontSize(10);
      pdf.text('TOTAL NET WORTH', margin + 20, yPos + 70);

      // Metrics row
      const metricWidth = (pageWidth - (margin * 2) - 40) / 3;
      pdf.setFontSize(16);
      pdf.text(formatCurrency(report.netWorthSummary.totalAssets), margin + 20, yPos + 90);
      pdf.text(formatCurrency(report.netWorthSummary.totalLiabilities), margin + 20 + metricWidth, yPos + 90);
      pdf.text(formatCurrency(report.netWorthSummary.liquidAssets), margin + 20 + (metricWidth * 2), yPos + 90);

      yPos += 120;
    }

    // Executive Summary Text
    if (report.executiveSummary) {
      yPos += 20;
      pdf.setFillColor(248, 248, 248);
      const summaryLines = pdf.splitTextToSize(report.executiveSummary, pageWidth - (margin * 2) - 30);
      const summaryHeight = summaryLines.length * 14 + 30;
      pdf.rect(margin, yPos, pageWidth - (margin * 2), Math.min(summaryHeight, 200), 'F');

      pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.rect(margin, yPos, 3, Math.min(summaryHeight, 200), 'F');

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      yPos = addWrappedText(report.executiveSummary, margin + 20, yPos + 20, pageWidth - (margin * 2) - 40);
    }

    // ===== ASSET ALLOCATION PAGE =====
    if (report.netWorthSummary?.assetAllocation) {
      pdf.addPage();
      yPos = margin;

      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
      yPos += 30;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Asset Allocation', margin, yPos);
      yPos += 40;

      const totalAssets = report.netWorthSummary.totalAssets || 1;
      const allocations = report.netWorthSummary.assetAllocation;

      Object.entries(allocations).forEach(([category, value]) => {
        if (value === 0) return;

        const percent = (value / totalAssets) * 100;

        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(11);
        pdf.text(assetCategoryLabels[category] || category, margin, yPos);

        pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.text(formatCurrency(value), margin + 180, yPos);

        // Progress bar background
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin + 280, yPos - 10, 180, 14, 'F');

        // Progress bar fill
        pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        pdf.rect(margin + 280, yPos - 10, percent * 1.8, 14, 'F');

        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(9);
        pdf.text(`${percent.toFixed(1)}%`, margin + 470, yPos);

        yPos += 35;
      });

      // Entity Breakdown
      if (report.netWorthSummary.entityBreakdown?.length) {
        yPos += 30;
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.text('Entity Structure', margin, yPos);
        yPos += 25;

        // Table header
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        pdf.text('ENTITY', margin + 10, yPos + 17);
        pdf.text('TYPE', margin + 200, yPos + 17);
        pdf.text('NET VALUE', pageWidth - margin - 80, yPos + 17);
        yPos += 25;

        report.netWorthSummary.entityBreakdown.forEach((entity) => {
          pdf.setTextColor(30, 30, 30);
          pdf.setFontSize(10);
          pdf.text(entity.entityName, margin + 10, yPos + 17);
          pdf.setTextColor(100, 100, 100);
          pdf.text(entity.entityType.toUpperCase(), margin + 200, yPos + 17);
          pdf.setTextColor(30, 30, 30);
          pdf.text(formatCurrency(entity.netValue), pageWidth - margin - 80, yPos + 17);
          pdf.setDrawColor(240, 240, 240);
          pdf.line(margin, yPos + 25, pageWidth - margin, yPos + 25);
          yPos += 30;
        });
      }
    }

    // ===== RISK ASSESSMENT PAGE =====
    if (report.risks?.length) {
      pdf.addPage();
      yPos = margin;

      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
      yPos += 30;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Risk Assessment', margin, yPos);
      yPos += 20;

      // Summary counts
      const criticalCount = report.risks.filter(r => r.severity === 'critical').length;
      const warningCount = report.risks.filter(r => r.severity === 'warning').length;
      const infoCount = report.risks.filter(r => r.severity === 'info').length;

      pdf.setFontSize(10);
      pdf.setTextColor(196, 30, 58);
      pdf.text(`${criticalCount} Critical`, margin, yPos + 20);
      pdf.setTextColor(204, 132, 0);
      pdf.text(`${warningCount} Elevated`, margin + 80, yPos + 20);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`${infoCount} Informational`, margin + 160, yPos + 20);
      yPos += 50;

      // Risk items
      report.risks.slice(0, 6).forEach((risk) => {
        if (yPos > pageHeight - 150) {
          pdf.addPage();
          yPos = margin + 30;
        }

        // Severity indicator
        if (risk.severity === 'critical') {
          pdf.setFillColor(196, 30, 58);
        } else if (risk.severity === 'warning') {
          pdf.setFillColor(204, 132, 0);
        } else {
          pdf.setFillColor(37, 99, 235);
        }
        pdf.rect(margin, yPos, 4, 70, 'F');

        // Badges
        pdf.setFontSize(8);
        if (risk.severity === 'critical') {
          pdf.setFillColor(252, 232, 236);
          pdf.setTextColor(196, 30, 58);
        } else if (risk.severity === 'warning') {
          pdf.setFillColor(254, 243, 224);
          pdf.setTextColor(204, 132, 0);
        } else {
          pdf.setFillColor(232, 240, 254);
          pdf.setTextColor(37, 99, 235);
        }
        pdf.rect(margin + 15, yPos, 50, 14, 'F');
        pdf.text(risk.severity.toUpperCase(), margin + 20, yPos + 10);

        pdf.setFillColor(245, 245, 245);
        pdf.setTextColor(85, 85, 85);
        pdf.rect(margin + 70, yPos, 80, 14, 'F');
        pdf.text(riskCategoryLabels[risk.category] || risk.category, margin + 75, yPos + 10);

        // Title
        pdf.setTextColor(26, 26, 26);
        pdf.setFontSize(12);
        pdf.text(risk.title, margin + 15, yPos + 30);

        // Description
        pdf.setTextColor(68, 68, 68);
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(risk.description, pageWidth - (margin * 2) - 30);
        pdf.text(descLines.slice(0, 2), margin + 15, yPos + 45);

        // Impact
        if (risk.financialImpact) {
          pdf.setTextColor(196, 30, 58);
          pdf.setFontSize(9);
          pdf.text(`Impact: ${risk.financialImpact}`, margin + 15, yPos + 65);
        }

        yPos += 90;
      });
    }

    // ===== ADVISOR ACTIONS PAGE =====
    if (report.advisorActions?.length) {
      pdf.addPage();
      yPos = margin;

      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
      yPos += 30;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Advisory Team Coordination', margin, yPos);
      yPos += 40;

      report.advisorActions.slice(0, 8).forEach((action) => {
        if (yPos > pageHeight - 100) {
          pdf.addPage();
          yPos = margin + 30;
        }

        // Priority badge
        pdf.setFontSize(8);
        if (action.priority === 'urgent') {
          pdf.setFillColor(252, 232, 236);
          pdf.setTextColor(196, 30, 58);
        } else if (action.priority === 'high') {
          pdf.setFillColor(254, 243, 224);
          pdf.setTextColor(204, 132, 0);
        } else if (action.priority === 'medium') {
          pdf.setFillColor(232, 240, 254);
          pdf.setTextColor(37, 99, 235);
        } else {
          pdf.setFillColor(232, 245, 232);
          pdf.setTextColor(46, 125, 50);
        }
        pdf.rect(margin, yPos, 50, 14, 'F');
        pdf.text(action.priority.toUpperCase(), margin + 5, yPos + 10);

        // Advisor tag
        pdf.setFillColor(240, 240, 240);
        pdf.setTextColor(85, 85, 85);
        pdf.rect(margin + 55, yPos, 80, 14, 'F');
        pdf.text(advisorSpecialtyLabels[action.advisorRole] || action.advisorRole, margin + 60, yPos + 10);

        // Action text
        pdf.setTextColor(26, 26, 26);
        pdf.setFontSize(11);
        pdf.text(action.action, margin, yPos + 30);

        // Context
        pdf.setTextColor(102, 102, 102);
        pdf.setFontSize(9);
        const contextLines = pdf.splitTextToSize(action.context, pageWidth - (margin * 2));
        pdf.text(contextLines.slice(0, 2), margin, yPos + 45);

        yPos += 70;
      });
    }

    // ===== COMPLIANCE CALENDAR PAGE =====
    if (report.complianceCalendar?.length) {
      pdf.addPage();
      yPos = margin;

      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
      yPos += 30;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Compliance Calendar', margin, yPos);
      yPos += 40;

      // Group by month
      const byMonth: Record<number, ComplianceDeadline[]> = {};
      report.complianceCalendar.forEach(item => {
        if (!byMonth[item.month]) byMonth[item.month] = [];
        byMonth[item.month].push(item);
      });

      Object.entries(byMonth).slice(0, 6).forEach(([month, items]) => {
        if (yPos > pageHeight - 100) {
          pdf.addPage();
          yPos = margin + 30;
        }

        // Month header
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text(monthNames[parseInt(month) - 1] || 'Month', margin + 10, yPos + 17);
        yPos += 30;

        items.slice(0, 3).forEach(item => {
          pdf.setTextColor(26, 26, 26);
          pdf.setFontSize(10);
          pdf.text(item.title, margin + 10, yPos + 12);

          pdf.setTextColor(102, 102, 102);
          pdf.setFontSize(9);
          pdf.text(item.responsibleParty, margin + 10, yPos + 25);

          if (item.penalty) {
            pdf.setTextColor(196, 30, 58);
            pdf.text(`Non-compliance: ${item.penalty}`, margin + 200, yPos + 12);
          }

          yPos += 35;
        });

        yPos += 10;
      });
    }

    // ===== RECOMMENDATIONS PAGE =====
    if (report.recommendations?.length) {
      pdf.addPage();
      yPos = margin;

      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
      yPos += 30;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Strategic Recommendations', margin, yPos);
      yPos += 40;

      report.recommendations.forEach((rec, idx) => {
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = margin + 30;
        }

        // Number circle
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.circle(margin + 12, yPos + 8, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(`${idx + 1}`, margin + 9, yPos + 12);

        // Recommendation text
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(11);
        yPos = addWrappedText(rec, margin + 35, yPos + 5, pageWidth - (margin * 2) - 50);
        yPos += 15;
      });

      // Contact section
      yPos += 30;
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 80, 'F');

      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.setFontSize(12);
      pdf.text('Questions Regarding This Analysis', (pageWidth / 2), yPos + 25, { align: 'center' });

      pdf.setTextColor(102, 102, 102);
      pdf.setFontSize(10);
      pdf.text('Please contact your advisory team to discuss these recommendations.', (pageWidth / 2), yPos + 45, { align: 'center' });

      if (branding.contactEmail) {
        pdf.text(branding.contactEmail, (pageWidth / 2), yPos + 60, { align: 'center' });
      }
    }

    // ===== DISCLAIMER PAGE =====
    pdf.addPage();
    yPos = margin;

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(branding.firmName || 'WealthSync Advisory', margin, yPos);
    yPos += 50;

    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.text('Important Disclosures', margin, yPos);
    yPos += 30;

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const disclaimer = branding.disclaimerText ||
      'This report is for informational purposes only and does not constitute financial, legal, or tax advice. The information contained herein is based on data provided and publicly available information. Past performance is not indicative of future results. All investments involve risk, including the potential loss of principal. You should consult with qualified professionals before making any financial decisions. This document is confidential and intended solely for the recipient.';

    yPos = addWrappedText(disclaimer, margin, yPos, pageWidth - (margin * 2), 16);

    yPos += 30;
    pdf.text(branding.footerText || 'Confidential - Prepared exclusively for client use', margin, yPos);

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(report.title)}.pdf"`,
        'Content-Length': String(pdfBuffer.byteLength)
      }
    });

  } catch (err: unknown) {
    console.error('Wealth PDF Generation Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate wealth report PDF';
    throw error(500, errorMessage);
  }
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}
