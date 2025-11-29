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

function getPriceIds(): Record<string, string> {
  return {
    foundation: env.STRIPE_FOUNDATION_PRICE_ID || '',
    growth: env.STRIPE_GROWTH_PRICE_ID || '',
    legacy: env.STRIPE_LEGACY_PRICE_ID || ''
  };
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const stripe = getStripe();
    const { familyId, planId } = await request.json();

    if (!familyId || !planId) {
      throw error(400, 'Family ID and plan ID are required');
    }

    const priceIds = getPriceIds();
    const priceId = priceIds[planId];
    if (!priceId) {
      throw error(400, 'Invalid plan ID');
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
      success_url: `${url.origin}/settings/billing?success=true`,
      cancel_url: `${url.origin}/settings/billing?canceled=true`,
      metadata: {
        familyId,
        planId
      }
    });

    return json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    throw error(500, err.message || 'Failed to create checkout session');
  }
};
