import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { jsPDF } from 'jspdf';
import type { Report, ClientProject, AgencyBranding } from '$lib/types';

interface GeneratePDFRequest {
  report: Report;
  project: ClientProject;
  branding: AgencyBranding;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { report, project, branding } = await request.json() as GeneratePDFRequest;

    if (!report || !project || !branding) {
      throw error(400, 'Report, project, and branding are required');
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

    // ===== COVER PAGE =====
    pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(branding.agencyName || 'Report', margin, 80);

    pdf.setFontSize(32);
    pdf.text(report.title || 'Client Report', margin, 280);

    pdf.setFontSize(18);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Prepared for ${project.clientName}`, margin, 330);

    pdf.setFontSize(11);
    pdf.setTextColor(150, 150, 150);
    const reportDate = new Date(report.createdAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    pdf.text(reportDate, margin, pageHeight - 100);
    pdf.text('CONFIDENTIAL', margin, pageHeight - 80);

    // ===== EXECUTIVE SUMMARY PAGE =====
    if (report.executiveSummary) {
      pdf.addPage();
      let yPos = margin;

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.agencyName || 'Report', margin, yPos);
      yPos += 30;

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Executive Summary', margin, yPos);
      yPos += 40;

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      yPos = addWrappedText(report.executiveSummary, margin, yPos, pageWidth - (margin * 2));
    }

    // ===== SECTIONS =====
    if (report.sections && report.sections.length > 0) {
      for (const section of report.sections) {
        pdf.addPage();
        let yPos = margin;

        // Header
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(branding.agencyName || 'Report', margin, yPos);
        yPos += 30;

        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 30;

        // Section title
        pdf.setFontSize(18);
        pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.text(section.title, margin, yPos);
        yPos += 30;

        // Section content
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(11);
        yPos = addWrappedText(section.content, margin, yPos, pageWidth - (margin * 2));

        // Subsections
        if (section.subsections) {
          for (const sub of section.subsections) {
            yPos += 20;
            if (yPos > pageHeight - 100) {
              pdf.addPage();
              yPos = margin + 30;
            }

            pdf.setFontSize(14);
            pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
            pdf.text(sub.title, margin, yPos);
            yPos += 25;

            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(11);
            yPos = addWrappedText(sub.content, margin, yPos, pageWidth - (margin * 2));
          }
        }
      }
    }

    // ===== RECOMMENDATIONS =====
    if (report.recommendations && report.recommendations.length > 0) {
      pdf.addPage();
      let yPos = margin;

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(branding.agencyName || 'Report', margin, yPos);
      yPos += 30;

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 30;

      pdf.setFontSize(20);
      pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      pdf.text('Recommendations', margin, yPos);
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
    }

    // ===== DISCLAIMER PAGE =====
    pdf.addPage();
    let yPos = margin;

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(branding.agencyName || 'Report', margin, yPos);
    yPos += 50;

    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    pdf.text('Disclaimer', margin, yPos);
    yPos += 30;

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const disclaimer = 'This report is for informational purposes only. The information contained herein is based on data provided and publicly available information. You should consult with qualified professionals before making any decisions based on this report.';
    yPos = addWrappedText(disclaimer, margin, yPos, pageWidth - (margin * 2), 16);

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
    console.error('PDF Generation Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
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
