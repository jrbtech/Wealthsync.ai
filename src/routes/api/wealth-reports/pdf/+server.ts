import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteer from 'puppeteer';
import type { WealthReport, ClientProfile, AdvisorBranding } from '$lib/types';
import { generateWealthReportHTML } from '$lib/utils/wealthPdfGenerator';

interface GenerateWealthPDFRequest {
  report: WealthReport;
  client: ClientProfile;
  branding: AdvisorBranding;
}

export const POST: RequestHandler = async ({ request }) => {
  let browser;

  try {
    const { report, client, branding } = await request.json() as GenerateWealthPDFRequest;

    if (!report || !client || !branding) {
      throw error(400, 'Report, client, and branding are required');
    }

    // Generate HTML
    const html = generateWealthReportHTML(report, client, branding);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.75in',
        left: '0.5in'
      },
      displayHeaderFooter: false
    });

    await browser.close();

    // Return PDF as binary
    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(report.title)}.pdf"`,
        'Content-Length': String(pdfBuffer.length)
      }
    });

  } catch (err: any) {
    console.error('Wealth PDF Generation Error:', err);

    if (browser) {
      await browser.close();
    }

    throw error(500, err.message || 'Failed to generate wealth report PDF');
  }
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}
