import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
  });
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const stripe = getStripe();
    const { familyId, customerId } = await request.json();

    if (!customerId) {
      throw error(400, 'Customer ID is required');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${url.origin}/settings/billing`
    });

    return json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err);
    throw error(500, err.message || 'Failed to create portal session');
  }
};
