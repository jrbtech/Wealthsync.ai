import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

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
    const anthropic = getAnthropic();
    const { text, type } = await request.json();

    if (!text) {
      throw error(400, 'Text is required');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'document':
        systemPrompt = `You are a document summarization assistant for a family office platform.
Your job is to create clear, concise summaries of legal, financial, and estate planning documents.
Focus on key points, important dates, parties involved, and actionable items.
Format your response with clear sections and bullet points where appropriate.
Be precise with numbers, dates, and legal terms.`;
        userPrompt = `Please summarize the following document:\n\n${text}`;
        break;

      case 'meeting':
        systemPrompt = `You are a meeting notes assistant for a family office platform.
Your job is to clean up and organize meeting notes into a professional format.
Extract key discussion points, decisions made, and action items.
Format the output with clear sections: Summary, Key Points, Action Items, and Next Steps.
Each action item should be specific and actionable.`;
        userPrompt = `Please clean up and organize these meeting notes:\n\n${text}`;
        break;

      case 'report':
        systemPrompt = `You are a report generation assistant for a family office platform.
Your job is to create professional quarterly family office reports.
Include sections for net worth overview, asset allocation changes, upcoming deadlines,
recent advisor meetings, and recommended actions.
Use a formal but accessible tone appropriate for high-net-worth families.`;
        userPrompt = `Generate a quarterly report based on the following data:\n\n${text}`;
        break;

      default:
        systemPrompt = `You are a helpful assistant for a family office platform.
Provide clear, professional responses appropriate for high-net-worth families.`;
        userPrompt = text;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw error(500, 'Unexpected response type');
    }

    return json({
      success: true,
      result: content.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    });
  } catch (err: any) {
    console.error('AI API Error:', err);

    if (err.status === 401) {
      throw error(500, 'AI service configuration error');
    }

    throw error(500, err.message || 'Failed to process request');
  }
};
