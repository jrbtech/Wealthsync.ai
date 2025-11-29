import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteer from 'puppeteer';
import type { Report, ClientProject, AgencyBranding } from '$lib/types';
import { generateReportHTML } from '$lib/utils/pdfGenerator';

interface GeneratePDFRequest {
  report: Report;
  project: ClientProject;
  branding: AgencyBranding;
}

export const POST: RequestHandler = async ({ request }) => {
  let browser;

  try {
    const { report, project, branding } = await request.json() as GeneratePDFRequest;

    if (!report || !project || !branding) {
      throw error(400, 'Report, project, and branding are required');
    }

    // Generate HTML
    const html = generateReportHTML(report, project, branding);

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
    console.error('PDF Generation Error:', err);

    if (browser) {
      await browser.close();
    }

    throw error(500, err.message || 'Failed to generate PDF');
  }
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}
