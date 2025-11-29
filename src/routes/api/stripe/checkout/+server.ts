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

// Family Office Plans (WealthSync)
function getFamilyPriceIds(): Record<string, string> {
  return {
    foundation: env.STRIPE_FOUNDATION_PRICE_ID || '',
    growth: env.STRIPE_GROWTH_PRICE_ID || '',
    legacy: env.STRIPE_LEGACY_PRICE_ID || ''
  };
}

// Agency Plans (AgencyForge)
function getAgencyPriceIds(): Record<string, string> {
  return {
    starter: env.STRIPE_AGENCY_STARTER_PRICE_ID || '',
    professional: env.STRIPE_AGENCY_PROFESSIONAL_PRICE_ID || '',
    unlimited: env.STRIPE_AGENCY_UNLIMITED_PRICE_ID || ''
  };
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const stripe = getStripe();
    const { familyId, agencyId, planId, planType = 'family' } = await request.json();

    const entityId = agencyId || familyId;
    if (!entityId || !planId) {
      throw error(400, 'Entity ID and plan ID are required');
    }

    // Get the appropriate price IDs based on plan type
    const priceIds = planType === 'agency' ? getAgencyPriceIds() : getFamilyPriceIds();
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
        entityId,
        planId,
        planType
      }
    });

    return json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    throw error(500, err.message || 'Failed to create checkout session');
  }
};
