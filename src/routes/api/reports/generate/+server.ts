import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { v4 as uuidv4 } from 'uuid';
import type {
  Report,
  ReportType,
  ClientProject,
  AnalyticsData,
  SEOAuditResult,
  SEOIssue,
  SEOOpportunity,
  CompetitorAnalysis,
  ContentCalendarItem,
  AgencyBranding
} from '$lib/types';

function getAnthropic() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY
  });
}

interface GenerateReportRequest {
  project: ClientProject;
  analytics?: AnalyticsData;
  reportType: ReportType;
  agencyBranding: AgencyBranding;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const anthropic = getAnthropic();
    const { project, analytics, reportType, agencyBranding } = await request.json() as GenerateReportRequest;

    if (!project || !reportType) {
      throw error(400, 'Project and reportType are required');
    }

    // Build context for AI
    const projectContext = buildProjectContext(project, analytics);

    // Generate report based on type
    let reportContent: Partial<Report>;

    switch (reportType) {
      case 'seo_audit':
        reportContent = await generateSEOAuditReport(anthropic, projectContext, project);
        break;
      case 'content_strategy':
        reportContent = await generateContentStrategyReport(anthropic, projectContext, project);
        break;
      case 'competitor_analysis':
        reportContent = await generateCompetitorReport(anthropic, projectContext, project);
        break;
      case 'monthly_performance':
        reportContent = await generateMonthlyReport(anthropic, projectContext, project, analytics);
        break;
      case 'quarterly_review':
        reportContent = await generateQuarterlyReport(anthropic, projectContext, project, analytics);
        break;
      default:
        throw error(400, `Unknown report type: ${reportType}`);
    }

    return json({
      success: true,
      report: {
        ...reportContent,
        projectId: project.id,
        type: reportType,
        status: 'ready',
        createdBy: 'system'
      }
    });

  } catch (err: any) {
    console.error('Report Generation Error:', err);

    if (err.status === 401) {
      throw error(500, 'AI service configuration error');
    }

    throw error(500, err.message || 'Failed to generate report');
  }
};

function buildProjectContext(project: ClientProject, analytics?: AnalyticsData): string {
  let context = `
CLIENT INFORMATION:
- Client Name: ${project.clientName}
- Website URL: ${project.clientUrl}
- Industry: ${project.industry}
- Target Keywords: ${project.targetKeywords.join(', ') || 'Not specified'}
- Competitors: ${project.competitors.join(', ') || 'Not specified'}
- Monthly Budget: ${project.monthlyBudget ? `$${project.monthlyBudget.toLocaleString()}` : 'Not specified'}
- Contract Value: ${project.contractValue ? `$${project.contractValue.toLocaleString()}` : 'Not specified'}
- Notes: ${project.notes || 'None'}
`;

  if (analytics) {
    context += `
ANALYTICS DATA (${analytics.source}):
- Date Range: ${new Date(analytics.dateRange.start).toLocaleDateString()} - ${new Date(analytics.dateRange.end).toLocaleDateString()}
- Sessions: ${analytics.metrics.sessions?.toLocaleString() || 'N/A'}
- Users: ${analytics.metrics.users?.toLocaleString() || 'N/A'}
- Pageviews: ${analytics.metrics.pageviews?.toLocaleString() || 'N/A'}
- Bounce Rate: ${analytics.metrics.bounceRate ? `${analytics.metrics.bounceRate}%` : 'N/A'}
- Avg Session Duration: ${analytics.metrics.avgSessionDuration ? `${Math.round(analytics.metrics.avgSessionDuration / 60)} min` : 'N/A'}
- Organic Traffic: ${analytics.metrics.organicTraffic?.toLocaleString() || 'N/A'}
- Impressions: ${analytics.metrics.impressions?.toLocaleString() || 'N/A'}
- Clicks: ${analytics.metrics.clicks?.toLocaleString() || 'N/A'}
- CTR: ${analytics.metrics.ctr ? `${analytics.metrics.ctr}%` : 'N/A'}
- Avg Position: ${analytics.metrics.avgPosition || 'N/A'}
`;

    if (analytics.topPages?.length) {
      context += `\nTOP PAGES:\n`;
      analytics.topPages.slice(0, 10).forEach((page, i) => {
        context += `${i + 1}. ${page.url} - ${page.sessions} sessions\n`;
      });
    }

    if (analytics.topKeywords?.length) {
      context += `\nTOP KEYWORDS:\n`;
      analytics.topKeywords.slice(0, 10).forEach((kw, i) => {
        context += `${i + 1}. "${kw.keyword}" - Position ${kw.position}, ${kw.clicks} clicks, ${kw.impressions} impressions\n`;
      });
    }
  }

  return context;
}

async function generateSEOAuditReport(
  anthropic: Anthropic,
  context: string,
  project: ClientProject
): Promise<Partial<Report>> {
  const systemPrompt = `You are an expert SEO consultant generating professional audit reports for digital marketing agencies.
Your reports should be detailed, actionable, and designed to impress clients with clear ROI potential.
Always structure your response as valid JSON that can be parsed.
Be specific with recommendations and include estimated impact where possible.
Focus on high-impact, practical improvements that will drive measurable results.`;

  const userPrompt = `Generate a comprehensive SEO audit report for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "SEO Audit Report - [Client Name]",
  "executiveSummary": "2-3 paragraph executive summary highlighting key findings and opportunities",
  "seoAudit": {
    "overallScore": 0-100,
    "technicalScore": 0-100,
    "contentScore": 0-100,
    "backlinksScore": 0-100,
    "issues": [
      {
        "id": "unique-id",
        "severity": "critical|warning|info",
        "category": "technical|content|backlinks|ux",
        "title": "Issue title",
        "description": "Detailed description",
        "affectedUrls": ["url1", "url2"],
        "recommendation": "How to fix"
      }
    ],
    "opportunities": [
      {
        "id": "unique-id",
        "priority": "high|medium|low",
        "category": "content|keywords|technical|links",
        "title": "Opportunity title",
        "description": "What this opportunity means",
        "estimatedImpact": "e.g., +20% organic traffic",
        "effort": "low|medium|high"
      }
    ],
    "crawlData": {
      "totalPages": number,
      "indexedPages": number,
      "brokenLinks": number,
      "missingMeta": number,
      "slowPages": number,
      "mobileIssues": number
    },
    "generatedAt": "${new Date().toISOString()}"
  },
  "recommendations": ["List of top 5-7 prioritized recommendations"],
  "roiProjections": {
    "currentTraffic": number,
    "projectedTraffic": number,
    "trafficGrowth": "percentage as string e.g., '+45%'",
    "estimatedRevenue": "dollar amount as string e.g., '$12,500/month'",
    "assumptions": ["list of assumptions made"]
  }
}

Generate realistic, industry-appropriate data based on the client's industry and provided information.
Include at least 5 issues and 5 opportunities.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const reportData = JSON.parse(jsonStr);

  return {
    title: reportData.title,
    executiveSummary: reportData.executiveSummary,
    seoAudit: reportData.seoAudit,
    recommendations: reportData.recommendations,
    roiProjections: reportData.roiProjections
  };
}

async function generateContentStrategyReport(
  anthropic: Anthropic,
  context: string,
  project: ClientProject
): Promise<Partial<Report>> {
  const systemPrompt = `You are an expert content strategist generating professional content plans for digital marketing agencies.
Your plans should include topical authority building, search intent optimization, and a clear 90-day content calendar.
Always structure your response as valid JSON that can be parsed.
Focus on creating content that will rank and convert.`;

  const userPrompt = `Generate a comprehensive content strategy plan for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "Content Strategy Plan - [Client Name]",
  "executiveSummary": "2-3 paragraph executive summary of the content strategy",
  "contentCalendar": [
    {
      "id": "unique-id",
      "week": 1-12,
      "title": "Content piece title",
      "targetKeyword": "primary keyword",
      "secondaryKeywords": ["kw1", "kw2"],
      "searchIntent": "informational|navigational|commercial|transactional",
      "contentType": "blog_post|landing_page|pillar_page|product_page|guide|case_study",
      "wordCount": number,
      "priority": "high|medium|low",
      "notes": "Additional context or angle",
      "internalLinks": ["suggested internal links"]
    }
  ],
  "recommendations": ["List of content strategy recommendations"],
  "roiProjections": {
    "currentTraffic": number,
    "projectedTraffic": number,
    "trafficGrowth": "percentage string",
    "estimatedRevenue": "dollar string",
    "assumptions": ["list of assumptions"]
  }
}

Create a 12-week (90-day) content calendar with at least 12 content pieces.
Mix content types strategically and build topical authority.
Include pillar content and supporting cluster content.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const reportData = JSON.parse(jsonStr);

  return {
    title: reportData.title,
    executiveSummary: reportData.executiveSummary,
    contentCalendar: reportData.contentCalendar,
    recommendations: reportData.recommendations,
    roiProjections: reportData.roiProjections
  };
}

async function generateCompetitorReport(
  anthropic: Anthropic,
  context: string,
  project: ClientProject
): Promise<Partial<Report>> {
  const systemPrompt = `You are an expert competitive intelligence analyst generating professional competitor analysis reports.
Your analysis should identify gaps, opportunities, and strategic advantages.
Always structure your response as valid JSON that can be parsed.
Be specific about competitive positioning and actionable differentiation strategies.`;

  const userPrompt = `Generate a comprehensive competitor analysis for this client:

${context}

Analyze these competitors: ${project.competitors.length > 0 ? project.competitors.join(', ') : 'Identify 3-5 main competitors based on the industry and keywords'}

Return a JSON object with this exact structure:
{
  "title": "Competitor Analysis - [Client Name]",
  "executiveSummary": "2-3 paragraph executive summary of competitive landscape",
  "competitorAnalysis": [
    {
      "competitorUrl": "competitor domain",
      "domainAuthority": 0-100,
      "organicKeywords": number,
      "estimatedTraffic": number,
      "topKeywords": [
        {"keyword": "kw", "position": 1-100, "volume": number}
      ],
      "contentGaps": ["topics they cover that client doesn't"],
      "backlinksCount": number
    }
  ],
  "recommendations": ["Strategic recommendations based on analysis"],
  "roiProjections": {
    "currentTraffic": number,
    "projectedTraffic": number,
    "trafficGrowth": "percentage string",
    "estimatedRevenue": "dollar string",
    "assumptions": ["list of assumptions"]
  }
}

Analyze at least 3 competitors with realistic metrics based on the industry.
Identify content gaps and keyword opportunities.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const reportData = JSON.parse(jsonStr);

  return {
    title: reportData.title,
    executiveSummary: reportData.executiveSummary,
    competitorAnalysis: reportData.competitorAnalysis,
    recommendations: reportData.recommendations,
    roiProjections: reportData.roiProjections
  };
}

async function generateMonthlyReport(
  anthropic: Anthropic,
  context: string,
  project: ClientProject,
  analytics?: AnalyticsData
): Promise<Partial<Report>> {
  const systemPrompt = `You are an expert digital marketing analyst generating professional monthly performance reports.
Your reports should clearly show progress, wins, and next steps.
Always structure your response as valid JSON that can be parsed.
Focus on metrics that matter and actionable insights.`;

  const userPrompt = `Generate a monthly performance report for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "Monthly Performance Report - [Client Name] - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}",
  "executiveSummary": "2-3 paragraph summary of monthly performance, wins, and focus areas",
  "seoAudit": {
    "overallScore": 0-100,
    "technicalScore": 0-100,
    "contentScore": 0-100,
    "backlinksScore": 0-100,
    "issues": [],
    "opportunities": [
      {
        "id": "unique-id",
        "priority": "high|medium|low",
        "category": "content|keywords|technical|links",
        "title": "Next month opportunity",
        "description": "What to focus on",
        "estimatedImpact": "expected impact",
        "effort": "low|medium|high"
      }
    ],
    "generatedAt": "${new Date().toISOString()}"
  },
  "recommendations": ["Top priorities for next month"],
  "roiProjections": {
    "currentTraffic": number,
    "projectedTraffic": number,
    "trafficGrowth": "month-over-month growth",
    "estimatedRevenue": "dollar string",
    "assumptions": ["list of assumptions"]
  }
}

If analytics data is provided, use those actual numbers. Otherwise, generate realistic estimates.
Focus on progress made and momentum building.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const reportData = JSON.parse(jsonStr);

  return {
    title: reportData.title,
    executiveSummary: reportData.executiveSummary,
    seoAudit: reportData.seoAudit,
    recommendations: reportData.recommendations,
    roiProjections: reportData.roiProjections
  };
}

async function generateQuarterlyReport(
  anthropic: Anthropic,
  context: string,
  project: ClientProject,
  analytics?: AnalyticsData
): Promise<Partial<Report>> {
  const systemPrompt = `You are an expert digital marketing strategist generating professional quarterly business review reports.
Your reports should provide strategic insight, demonstrate ROI, and set direction for the next quarter.
Always structure your response as valid JSON that can be parsed.
Focus on business impact and strategic recommendations.`;

  const userPrompt = `Generate a quarterly business review report for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "Quarterly Business Review - [Client Name] - Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}",
  "executiveSummary": "3-4 paragraph strategic summary of quarterly performance, achievements, and strategic direction",
  "seoAudit": {
    "overallScore": 0-100,
    "technicalScore": 0-100,
    "contentScore": 0-100,
    "backlinksScore": 0-100,
    "issues": [],
    "opportunities": [],
    "generatedAt": "${new Date().toISOString()}"
  },
  "contentCalendar": [
    {
      "id": "unique-id",
      "week": 1-12,
      "title": "Strategic content piece",
      "targetKeyword": "primary keyword",
      "secondaryKeywords": [],
      "searchIntent": "informational|navigational|commercial|transactional",
      "contentType": "blog_post|landing_page|pillar_page|product_page|guide|case_study",
      "wordCount": number,
      "priority": "high|medium|low"
    }
  ],
  "recommendations": ["Strategic recommendations for next quarter"],
  "roiProjections": {
    "currentTraffic": number,
    "projectedTraffic": number,
    "trafficGrowth": "quarterly growth projection",
    "estimatedRevenue": "dollar string with quarterly projection",
    "assumptions": ["list of strategic assumptions"]
  }
}

Provide strategic, executive-level insights.
Include a high-level content roadmap for next quarter (6-8 pieces).
Focus on ROI and business outcomes.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const reportData = JSON.parse(jsonStr);

  return {
    title: reportData.title,
    executiveSummary: reportData.executiveSummary,
    seoAudit: reportData.seoAudit,
    contentCalendar: reportData.contentCalendar,
    recommendations: reportData.recommendations,
    roiProjections: reportData.roiProjections
  };
}
