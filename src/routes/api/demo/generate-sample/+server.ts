import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { jsPDF } from 'jspdf';

interface DemoRequest {
  clientName: string;
  netWorth: number;
  email: string;
}

function getAnthropic() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY
  });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { clientName, netWorth, email } = await request.json() as DemoRequest;

    if (!clientName || !netWorth || !email) {
      throw error(400, 'Missing required fields');
    }

    const anthropic = getAnthropic();

    // Generate sample wealth audit analysis
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are a wealth advisor generating a sample wealth audit report. Be professional and impressive. Generate realistic but fictional analysis data. IMPORTANT: Return ONLY valid JSON, no markdown code blocks.`,
      messages: [{
        role: 'user',
        content: `Generate a sample wealth audit summary for:
Client: ${clientName}
Net Worth: $${netWorth.toLocaleString()}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "executiveSummary": "A 2 paragraph professional summary of the wealth audit findings",
  "assetAllocation": { "investments": 45, "realEstate": 25, "cash": 15, "alternatives": 10, "other": 5 },
  "risks": [
    { "severity": "critical", "title": "Risk title", "impact": "$500,000", "recommendation": "What to do" }
  ],
  "topRecommendations": ["First recommendation", "Second recommendation", "Third recommendation", "Fourth recommendation", "Fifth recommendation"]
}

The assetAllocation values must be numbers that sum to 100.
Generate 4 realistic risks (2 critical, 2 warning) and 5 actionable recommendations.
Return ONLY the JSON object, nothing else.`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let jsonStr = content.text.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Find JSON object boundaries
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.slice(startIdx, endIdx + 1);
    }

    const reportData = JSON.parse(jsonStr);

    // Generate PDF using jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;
    let yPos = margin;

    // Helper to add text with wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 14): number => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, x, y);
        y += lineHeight;
      });
      return y;
    };

    // Cover page
    pdf.setFillColor(15, 23, 42); // navy-900
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('WEALTHSYNC', margin, 80);

    pdf.setFontSize(32);
    pdf.text('Wealth Audit Report', margin, 280);

    pdf.setFontSize(18);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Prepared for ${clientName}`, margin, 320);

    pdf.setFontSize(11);
    pdf.setTextColor(150, 150, 150);
    pdf.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), margin, pageHeight - 100);
    pdf.text('CONFIDENTIAL - SAMPLE REPORT', margin, pageHeight - 80);

    // Page 2: Executive Summary
    pdf.addPage();
    yPos = margin;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(20);
    pdf.text('Executive Summary', margin, yPos);
    yPos += 40;

    // Net Worth Display
    pdf.setFillColor(15, 23, 42);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 80, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.text(`$${netWorth.toLocaleString()}`, margin + 20, yPos + 45);
    pdf.setFontSize(10);
    pdf.text('TOTAL NET WORTH', margin + 20, yPos + 65);
    yPos += 100;

    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(11);
    yPos = addWrappedText(reportData.executiveSummary, margin, yPos, pageWidth - (margin * 2));

    // Page 3: Asset Allocation
    pdf.addPage();
    yPos = margin;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(20);
    pdf.text('Asset Allocation', margin, yPos);
    yPos += 40;

    pdf.setFontSize(11);
    const allocations = reportData.assetAllocation;
    Object.entries(allocations).forEach(([category, percent]) => {
      pdf.setTextColor(60, 60, 60);
      const label = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      pdf.text(label, margin, yPos);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${percent}%`, margin + 150, yPos);

      // Progress bar
      pdf.setFillColor(230, 230, 230);
      pdf.rect(margin + 200, yPos - 10, 200, 14, 'F');
      pdf.setFillColor(6, 182, 212); // accent color
      pdf.rect(margin + 200, yPos - 10, (percent as number) * 2, 14, 'F');

      yPos += 30;
    });

    // Page 4: Risk Assessment
    pdf.addPage();
    yPos = margin;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(20);
    pdf.text('Risk Assessment', margin, yPos);
    yPos += 40;

    reportData.risks.forEach((risk: { severity: string; title: string; impact: string; recommendation: string }, idx: number) => {
      if (yPos > pageHeight - 150) {
        pdf.addPage();
        yPos = margin;
      }

      // Severity indicator
      if (risk.severity === 'critical') {
        pdf.setFillColor(196, 30, 58);
      } else {
        pdf.setFillColor(204, 132, 0);
      }
      pdf.rect(margin, yPos, 4, 60, 'F');

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.text(risk.title, margin + 15, yPos + 15);

      pdf.setTextColor(196, 30, 58);
      pdf.setFontSize(10);
      pdf.text(`Estimated Impact: ${risk.impact}`, margin + 15, yPos + 32);

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      yPos = addWrappedText(`Recommendation: ${risk.recommendation}`, margin + 15, yPos + 48, pageWidth - (margin * 2) - 20);
      yPos += 20;
    });

    // Page 5: Recommendations
    pdf.addPage();
    yPos = margin;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(20);
    pdf.text('Strategic Recommendations', margin, yPos);
    yPos += 40;

    reportData.topRecommendations.forEach((rec: string, idx: number) => {
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = margin;
      }

      // Number circle
      pdf.setFillColor(15, 23, 42);
      pdf.circle(margin + 10, yPos + 5, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`${idx + 1}`, margin + 7, yPos + 9);

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      yPos = addWrappedText(rec, margin + 30, yPos + 10, pageWidth - (margin * 2) - 40);
      yPos += 15;
    });

    // Footer on last page
    yPos = pageHeight - 100;
    pdf.setFillColor(248, 248, 248);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 60, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text('This is a SAMPLE REPORT generated by WealthSync.ai', margin + 10, yPos + 25);
    pdf.text('Start your free trial at wealthsync.ai to generate full client reports', margin + 10, yPos + 40);

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WealthSync-Sample-Report.pdf"`
      }
    });

  } catch (err: unknown) {
    console.error('Demo report generation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate sample report';
    throw error(500, errorMessage);
  }
};
