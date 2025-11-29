import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { v4 as uuidv4 } from 'uuid';
import type {
  WealthReport,
  WealthReportType,
  ClientProfile,
  AdvisorBranding,
  WealthRisk,
  AdvisorAction,
  ComplianceDeadline,
  AssetCategory,
  ASSET_CATEGORY_LABELS
} from '$lib/types';

function getAnthropic() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY
  });
}

interface GenerateWealthReportRequest {
  client: ClientProfile;
  reportType: WealthReportType;
  advisorBranding: AdvisorBranding;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const anthropic = getAnthropic();
    const { client, reportType, advisorBranding } = await request.json() as GenerateWealthReportRequest;

    if (!client || !reportType) {
      throw error(400, 'Client and reportType are required');
    }

    // Build context for AI
    const clientContext = buildClientContext(client);

    // Generate report based on type
    let reportContent: Partial<WealthReport>;

    switch (reportType) {
      case 'wealth_audit':
        reportContent = await generateWealthAuditReport(anthropic, clientContext, client);
        break;
      case 'advisor_coordination':
        reportContent = await generateAdvisorCoordinationReport(anthropic, clientContext, client);
        break;
      case 'compliance_calendar':
        reportContent = await generateComplianceCalendarReport(anthropic, clientContext, client);
        break;
      case 'estate_summary':
        reportContent = await generateEstateSummaryReport(anthropic, clientContext, client);
        break;
      case 'quarterly_review':
        reportContent = await generateQuarterlyWealthReview(anthropic, clientContext, client);
        break;
      default:
        throw error(400, `Unknown report type: ${reportType}`);
    }

    return json({
      success: true,
      report: {
        ...reportContent,
        id: uuidv4(),
        clientId: client.id,
        firmId: client.firmId,
        type: reportType,
        status: 'ready',
        reportDate: new Date(),
        createdAt: new Date(),
        createdBy: 'system',
        viewCount: 0
      }
    });

  } catch (err: any) {
    console.error('Wealth Report Generation Error:', err);

    if (err.status === 401) {
      throw error(500, 'AI service configuration error');
    }

    throw error(500, err.message || 'Failed to generate wealth report');
  }
};

function buildClientContext(client: ClientProfile): string {
  // Calculate totals
  const totalAssets = client.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = client.liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Asset allocation
  const assetsByCategory: Record<string, number> = {};
  client.assets.forEach(asset => {
    assetsByCategory[asset.category] = (assetsByCategory[asset.category] || 0) + asset.value;
  });

  // Entity breakdown
  const entitiesWithAssets = client.entities.map(entity => {
    const entityAssets = client.assets.filter(a => a.entityId === entity.id);
    const entityLiabilities = client.liabilities.filter(l => l.entityId === entity.id);
    const entityTotal = entityAssets.reduce((s, a) => s + a.value, 0) - entityLiabilities.reduce((s, l) => s + l.balance, 0);
    return { ...entity, netValue: entityTotal, assetCount: entityAssets.length };
  });

  let context = `
CLIENT PROFILE:
- Client Name: ${client.clientName}
- Client Type: ${client.clientType}
- Status: ${client.status}
${client.email ? `- Email: ${client.email}` : ''}
${client.phone ? `- Phone: ${client.phone}` : ''}
${client.address ? `- Address: ${client.address}` : ''}

DEMOGRAPHICS:
${client.dateOfBirth ? `- Date of Birth: ${new Date(client.dateOfBirth).toLocaleDateString()}` : ''}
${client.spouseName ? `- Spouse: ${client.spouseName}` : ''}
${client.dependents?.length ? `- Dependents: ${client.dependents.map(d => `${d.name} (${d.relationship})`).join(', ')}` : ''}

FINANCIAL SUMMARY:
- Estimated Net Worth: $${netWorth.toLocaleString()}
- Total Assets: $${totalAssets.toLocaleString()}
- Total Liabilities: $${totalLiabilities.toLocaleString()}
${client.annualIncome ? `- Annual Income: $${client.annualIncome.toLocaleString()}` : ''}
${client.riskTolerance ? `- Risk Tolerance: ${client.riskTolerance}` : ''}
${client.investmentHorizon ? `- Investment Horizon: ${client.investmentHorizon}` : ''}

ASSET ALLOCATION:
${Object.entries(assetsByCategory).map(([cat, val]) => `- ${cat}: $${val.toLocaleString()} (${((val / totalAssets) * 100).toFixed(1)}%)`).join('\n')}

ENTITIES (${client.entities.length}):
${entitiesWithAssets.map(e => `- ${e.name} (${e.type}): $${e.netValue.toLocaleString()} net value, ${e.assetCount} assets`).join('\n')}

DETAILED ASSETS (${client.assets.length}):
${client.assets.map(a => `- ${a.name} (${a.category}): $${a.value.toLocaleString()}${a.custodian ? ` at ${a.custodian}` : ''}${a.entityId ? ` [Entity: ${client.entities.find(e => e.id === a.entityId)?.name || 'Unknown'}]` : ''}`).join('\n')}

LIABILITIES (${client.liabilities.length}):
${client.liabilities.map(l => `- ${l.name} (${l.category}): $${l.balance.toLocaleString()}${l.interestRate ? ` @ ${l.interestRate}%` : ''}${l.lender ? ` from ${l.lender}` : ''}`).join('\n')}

ADVISORY TEAM (${client.advisors.length}):
${client.advisors.map(a => `- ${a.name} (${a.role})${a.firm ? ` at ${a.firm}` : ''}${a.isPrimary ? ' [PRIMARY]' : ''}`).join('\n')}

${client.importantDates?.length ? `
KEY DATES & DEADLINES:
${client.importantDates.map(d => `- ${d.title}: ${new Date(d.date).toLocaleDateString()} (${d.category}, ${d.recurrence})`).join('\n')}
` : ''}

${client.goals?.length ? `
CLIENT GOALS:
${client.goals.map(g => `- ${g}`).join('\n')}
` : ''}

${client.concerns?.length ? `
CLIENT CONCERNS:
${client.concerns.map(c => `- ${c}`).join('\n')}
` : ''}

${client.notes ? `
ADDITIONAL NOTES:
${client.notes}
` : ''}
`;

  return context;
}

async function generateWealthAuditReport(
  anthropic: Anthropic,
  context: string,
  client: ClientProfile
): Promise<Partial<WealthReport>> {
  const systemPrompt = `You are an expert wealth advisor generating comprehensive wealth audit reports for high-net-worth clients.
Your reports should be detailed, professional, and designed to impress discerning clients with clear insights and actionable recommendations.
Always structure your response as valid JSON that can be parsed.
Focus on identifying risks, opportunities, and providing clear next steps.
Be specific with recommendations and include estimated financial impact where possible.`;

  const totalAssets = client.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = client.liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Calculate liquid vs illiquid
  const liquidCategories = ['cash', 'investments'];
  const liquidAssets = client.assets
    .filter(a => liquidCategories.includes(a.category))
    .reduce((sum, a) => sum + a.value, 0);

  const userPrompt = `Generate a comprehensive wealth audit report for this high-net-worth client:

${context}

Return a JSON object with this exact structure:
{
  "title": "2025 Wealth Audit: ${client.clientName}",
  "executiveSummary": "2-3 paragraph executive summary highlighting net worth, key strengths, critical risks, and recommended actions. Write in a professional, reassuring tone appropriate for a $${(netWorth / 1000000).toFixed(1)}M+ client.",
  "netWorthSummary": {
    "totalAssets": ${totalAssets},
    "totalLiabilities": ${totalLiabilities},
    "netWorth": ${netWorth},
    "liquidAssets": ${liquidAssets},
    "illiquidAssets": ${totalAssets - liquidAssets},
    "assetAllocation": {
      "cash": number,
      "investments": number,
      "real_estate": number,
      "alternatives": number,
      "other": number
    },
    "entityBreakdown": [
      {"entityName": "string", "entityType": "personal|trust|llc|foundation|other", "netValue": number}
    ]
  },
  "risks": [
    {
      "id": "unique-id",
      "severity": "critical|warning|info",
      "category": "tax|legal|insurance|liquidity|concentration|succession|compliance",
      "title": "Risk title",
      "description": "Detailed description of the risk",
      "financialImpact": "Estimated dollar impact or percentage",
      "recommendation": "Specific action to mitigate",
      "assignedAdvisor": "CPA|Estate Attorney|Wealth Manager|Insurance Advisor|etc"
    }
  ],
  "recommendations": [
    "Top 5-7 prioritized strategic recommendations"
  ]
}

Generate at least 5 risks across different categories (tax, legal, insurance, liquidity, concentration, succession).
Be specific to this client's situation - reference their actual entities, assets, and advisors.
Include realistic financial impact estimates where appropriate.`;

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
    netWorthSummary: reportData.netWorthSummary,
    risks: reportData.risks,
    recommendations: reportData.recommendations
  };
}

async function generateAdvisorCoordinationReport(
  anthropic: Anthropic,
  context: string,
  client: ClientProfile
): Promise<Partial<WealthReport>> {
  const systemPrompt = `You are an expert wealth coordinator generating advisor coordination plans for high-net-worth families.
Your plans should clearly define roles, responsibilities, and action items for each advisor on the team.
Always structure your response as valid JSON that can be parsed.
Focus on coordination, communication, and ensuring nothing falls through the cracks.`;

  const userPrompt = `Generate an advisor coordination plan for this client's advisory team:

${context}

Return a JSON object with this exact structure:
{
  "title": "Advisor Coordination Plan: ${client.clientName}",
  "executiveSummary": "2-3 paragraph summary of the coordination strategy, key priorities, and team structure",
  "advisorActions": [
    {
      "id": "unique-id",
      "priority": "urgent|high|medium|low",
      "advisorRole": "cpa|estate_attorney|wealth_manager|insurance|banker|other",
      "advisorName": "Name if known from client's team",
      "action": "Specific action to take",
      "context": "Why this action matters and background",
      "deadline": "ISO date string or null",
      "dependencies": ["Other actions this depends on"],
      "estimatedCost": "$X,XXX estimate if applicable",
      "status": "pending"
    }
  ],
  "recommendations": [
    "Top coordination recommendations for the family"
  ]
}

Generate at least 10 action items distributed across the advisory team.
Include both immediate actions (urgent/high) and longer-term initiatives (medium/low).
Reference specific assets, entities, and situations from the client's profile.
Identify dependencies between advisor actions (e.g., CPA needs info from estate attorney).`;

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
    advisorActions: reportData.advisorActions,
    recommendations: reportData.recommendations
  };
}

async function generateComplianceCalendarReport(
  anthropic: Anthropic,
  context: string,
  client: ClientProfile
): Promise<Partial<WealthReport>> {
  const systemPrompt = `You are an expert wealth compliance specialist generating 12-month compliance calendars for high-net-worth families.
Your calendars should be comprehensive, including all tax, legal, insurance, trust, and investment deadlines.
Always structure your response as valid JSON that can be parsed.
Focus on preventing costly penalties and missed opportunities.`;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const userPrompt = `Generate a 12-month compliance calendar for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "12-Month Compliance Calendar: ${client.clientName} (${nextYear})",
  "executiveSummary": "2-3 paragraph overview of key compliance requirements, critical deadlines, and estimated annual compliance costs",
  "complianceCalendar": [
    {
      "id": "unique-id",
      "month": 1-12,
      "title": "Deadline title",
      "category": "tax|legal|insurance|trust|investment|other",
      "description": "What needs to be done",
      "responsibleParty": "Who handles this (advisor role or family member)",
      "estimatedFee": number or null,
      "penalty": "What happens if missed",
      "recurrence": "one_time|annual|quarterly|monthly",
      "status": "upcoming"
    }
  ],
  "recommendations": [
    "Top recommendations for staying compliant"
  ]
}

Generate at least 15-20 calendar items across all 12 months.
Include all standard deadlines (taxes, trust distributions, insurance renewals, RMDs, etc.).
Add entity-specific deadlines based on their LLCs, trusts, and other entities.
Include estimated fees and penalties for missing deadlines.
Reference specific entities and situations from the client's profile.`;

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
    complianceCalendar: reportData.complianceCalendar,
    recommendations: reportData.recommendations
  };
}

async function generateEstateSummaryReport(
  anthropic: Anthropic,
  context: string,
  client: ClientProfile
): Promise<Partial<WealthReport>> {
  const systemPrompt = `You are an expert estate planning advisor generating estate planning summary reports for high-net-worth families.
Your reports should identify gaps in estate planning, succession issues, and wealth transfer opportunities.
Always structure your response as valid JSON that can be parsed.
Focus on protecting wealth across generations and minimizing estate taxes.`;

  const totalAssets = client.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = client.liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const userPrompt = `Generate an estate planning summary report for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "Estate Planning Summary: ${client.clientName}",
  "executiveSummary": "2-3 paragraph overview of current estate planning status, key gaps, and priority recommendations. Consider a $${(netWorth / 1000000).toFixed(1)}M estate.",
  "risks": [
    {
      "id": "unique-id",
      "severity": "critical|warning|info",
      "category": "succession|legal|tax|insurance",
      "title": "Estate planning gap or risk",
      "description": "Detailed description",
      "financialImpact": "Estimated impact on estate",
      "recommendation": "Specific action to address",
      "assignedAdvisor": "Estate Attorney|CPA|Insurance Advisor|etc"
    }
  ],
  "advisorActions": [
    {
      "id": "unique-id",
      "priority": "urgent|high|medium|low",
      "advisorRole": "estate_attorney|cpa|insurance|wealth_manager|other",
      "action": "Estate planning action",
      "context": "Why this matters",
      "estimatedCost": "$X,XXX",
      "status": "pending"
    }
  ],
  "recommendations": [
    "Top estate planning recommendations"
  ]
}

Generate at least 5 estate-related risks and 8 action items.
Consider: wills, trusts, powers of attorney, beneficiary designations, life insurance, business succession, charitable planning.
Reference specific entities and family members from the profile.`;

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
    risks: reportData.risks,
    advisorActions: reportData.advisorActions,
    recommendations: reportData.recommendations
  };
}

async function generateQuarterlyWealthReview(
  anthropic: Anthropic,
  context: string,
  client: ClientProfile
): Promise<Partial<WealthReport>> {
  const systemPrompt = `You are an expert wealth advisor generating quarterly wealth review reports for high-net-worth families.
Your reports should provide a comprehensive quarterly snapshot with progress tracking, market commentary, and strategic recommendations.
Always structure your response as valid JSON that can be parsed.
Focus on holistic wealth management across all aspects of the client's financial life.`;

  const totalAssets = client.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = client.liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const year = new Date().getFullYear();

  // Calculate liquid vs illiquid
  const liquidCategories = ['cash', 'investments'];
  const liquidAssets = client.assets
    .filter(a => liquidCategories.includes(a.category))
    .reduce((sum, a) => sum + a.value, 0);

  const userPrompt = `Generate a quarterly wealth review report for this client:

${context}

Return a JSON object with this exact structure:
{
  "title": "Q${quarter} ${year} Wealth Review: ${client.clientName}",
  "executiveSummary": "3-4 paragraph comprehensive quarterly summary covering net worth status, market outlook, key accomplishments, and priorities for next quarter",
  "netWorthSummary": {
    "totalAssets": ${totalAssets},
    "totalLiabilities": ${totalLiabilities},
    "netWorth": ${netWorth},
    "liquidAssets": ${liquidAssets},
    "illiquidAssets": ${totalAssets - liquidAssets},
    "assetAllocation": {
      "cash": number,
      "investments": number,
      "real_estate": number,
      "alternatives": number,
      "other": number
    },
    "entityBreakdown": [
      {"entityName": "string", "entityType": "personal|trust|llc|foundation|other", "netValue": number}
    ],
    "changeFromPrevious": {
      "amount": number (estimate reasonable quarterly change),
      "percentage": number,
      "period": "Q${quarter > 1 ? quarter - 1 : 4} ${quarter > 1 ? year : year - 1}"
    }
  },
  "risks": [
    {
      "id": "unique-id",
      "severity": "critical|warning|info",
      "category": "tax|legal|insurance|liquidity|concentration|succession|compliance",
      "title": "Current quarter risk",
      "description": "Description",
      "recommendation": "Action to take"
    }
  ],
  "advisorActions": [
    {
      "id": "unique-id",
      "priority": "urgent|high|medium|low",
      "advisorRole": "cpa|estate_attorney|wealth_manager|insurance|banker|other",
      "action": "Next quarter action",
      "context": "Why this matters now",
      "status": "pending"
    }
  ],
  "complianceCalendar": [
    {
      "id": "unique-id",
      "month": ${new Date().getMonth() + 1}-${Math.min(new Date().getMonth() + 4, 12)},
      "title": "Upcoming deadline",
      "category": "tax|legal|insurance|trust|investment|other",
      "description": "What needs to be done",
      "responsibleParty": "Who handles this",
      "status": "upcoming"
    }
  ],
  "recommendations": [
    "Top 5-7 recommendations for next quarter"
  ]
}

Include:
- Comprehensive net worth analysis with realistic quarterly change
- 3-5 current risks relevant to this quarter
- 5-8 action items for the advisory team
- 4-6 compliance deadlines for the next 3 months
- Strategic recommendations for the upcoming quarter`;

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
    netWorthSummary: reportData.netWorthSummary,
    risks: reportData.risks,
    advisorActions: reportData.advisorActions,
    complianceCalendar: reportData.complianceCalendar,
    recommendations: reportData.recommendations
  };
}
