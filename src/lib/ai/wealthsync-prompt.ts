import { env } from '$env/dynamic/private';

export interface ClientData {
  name: string;
  netWorth: number;
  assets: {
    category: string;
    value: number;
    name: string;
  }[];
  liabilities: {
    category: string;
    balance: number;
    name: string;
  }[];
  goals?: string[];
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

export interface WealthAnalysis {
  allocations: Record<string, number>;
  risks: {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    title: string;
    description: string;
    recommendation: string;
  }[];
  rebalance: {
    action: string;
    from: string;
    to: string;
    amount: number;
    rationale: string;
  }[];
  alerts: {
    type: 'tax' | 'compliance' | 'opportunity' | 'risk';
    message: string;
    urgency: 'immediate' | 'soon' | 'monitor';
  }[];
}

export async function analyzeClient(data: ClientData): Promise<WealthAnalysis> {
  const prompt = `WealthSync Pro: Live RIA monitoring. Client JSON: ${JSON.stringify(data)}. Output ONLY JSON: {allocations: {...}, risks: [...], rebalance: [...], alerts: [...]}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY || '',
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content[0];

  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  let jsonStr = content.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr) as WealthAnalysis;
}

export function buildWealthAuditPrompt(clientName: string, netWorth: number, context: string): string {
  return `You are an expert wealth advisor generating a comprehensive wealth audit report.

CLIENT: ${clientName}
NET WORTH: $${netWorth.toLocaleString()}

${context}

Generate a detailed analysis including:
1. Asset allocation assessment
2. Risk identification (tax, legal, insurance, liquidity, concentration)
3. Rebalancing recommendations
4. Compliance alerts and deadlines
5. Strategic recommendations

Return as structured JSON with: allocations, risks, rebalance, alerts, recommendations`;
}

export function buildAdvisorCoordinationPrompt(clientName: string, advisors: { name: string; role: string }[]): string {
  return `Generate an advisor coordination plan for ${clientName}.

Advisory Team:
${advisors.map(a => `- ${a.name} (${a.role})`).join('\n')}

Create specific action items for each advisor with:
- Priority (urgent/high/medium/low)
- Detailed action description
- Context and rationale
- Dependencies on other advisors
- Estimated timeline

Return as JSON with advisorActions array.`;
}

export function buildComplianceCalendarPrompt(clientName: string, entities: { name: string; type: string }[]): string {
  const nextYear = new Date().getFullYear() + 1;

  return `Generate a 12-month compliance calendar for ${clientName} for ${nextYear}.

Entities:
${entities.map(e => `- ${e.name} (${e.type})`).join('\n')}

Include all relevant deadlines:
- Tax filings and estimated payments
- Trust distributions and reporting
- Insurance renewals
- Regulatory filings
- Annual reviews

Return as JSON with complianceCalendar array, each item having: month, title, category, description, responsibleParty, penalty.`;
}
