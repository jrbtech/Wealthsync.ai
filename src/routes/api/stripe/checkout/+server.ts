import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const stripe = getStripe();
    const body = await request.json();

    // Support both direct priceId and legacy planId approach
    let priceId = body.priceId;

    if (!priceId && body.planId) {
      // Legacy support: map planId to env var
      const planMap: Record<string, string | undefined> = {
        foundation: env.STRIPE_FOUNDATION_PRICE_ID,
        pro: env.STRIPE_FOUNDATION_PRICE_ID, // alias
        wealthsync: env.STRIPE_FOUNDATION_PRICE_ID // alias
      };
      priceId = planMap[body.planId];
    }

    // Default to the main WealthSync Pro price
    if (!priceId) {
      priceId = env.STRIPE_FOUNDATION_PRICE_ID;
    }

    if (!priceId) {
      throw error(400, 'No price ID configured');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${url.origin}/dashboard?success=true`,
      cancel_url: `${url.origin}/?canceled=true`,
      metadata: {
        userId: body.userId || '',
        email: body.email || ''
      }
    });

    return json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    throw error(500, err.message || 'Failed to create checkout session');
  }
};
