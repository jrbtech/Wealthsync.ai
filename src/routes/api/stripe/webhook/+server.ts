import { json, error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

let adminDb: Firestore | null = null;

function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  let adminApp: App;
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: publicEnv.PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  return adminDb;
}

export const POST: RequestHandler = async ({ request }) => {
  const stripe = getStripe();
  const db = getAdminDb();
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    throw error(400, 'Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    throw error(400, `Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const familyId = session.metadata?.familyId;
        const planId = session.metadata?.planId;

        if (familyId && planId) {
          await db.collection('families').doc(familyId).update({
            plan: planId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            updatedAt: new Date()
          });

          console.log(`Family ${familyId} upgraded to ${planId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find family by customer ID
        const familiesSnapshot = await db
          .collection('families')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!familiesSnapshot.empty) {
          const familyDoc = familiesSnapshot.docs[0];

          // Get the new price to determine plan
          const priceId = subscription.items.data[0]?.price.id;
          let plan = 'foundation';

          if (priceId === env.STRIPE_GROWTH_PRICE_ID) {
            plan = 'growth';
          } else if (priceId === env.STRIPE_LEGACY_PRICE_ID) {
            plan = 'legacy';
          }

          await familyDoc.ref.update({
            plan,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            updatedAt: new Date()
          });

          console.log(`Family ${familyDoc.id} subscription updated to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find family by customer ID
        const familiesSnapshotDel = await db
          .collection('families')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!familiesSnapshotDel.empty) {
          const familyDocDel = familiesSnapshotDel.docs[0];

          await familyDocDel.ref.update({
            plan: 'foundation', // Downgrade to free plan
            stripeSubscriptionId: null,
            subscriptionStatus: 'canceled',
            updatedAt: new Date()
          });

          console.log(`Family ${familyDocDel.id} subscription canceled`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find family and log payment
        const familiesSnapshotPaid = await db
          .collection('families')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!familiesSnapshotPaid.empty) {
          const familyDocPaid = familiesSnapshotPaid.docs[0];

          await db
            .collection('families')
            .doc(familyDocPaid.id)
            .collection('payments')
            .add({
              invoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              paidAt: new Date()
            });

          console.log(`Payment recorded for family ${familyDocPaid.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find family and log failed payment
        const familiesSnapshotFailed = await db
          .collection('families')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!familiesSnapshotFailed.empty) {
          const familyDocFailed = familiesSnapshotFailed.docs[0];

          await familyDocFailed.ref.update({
            paymentFailed: true,
            lastPaymentFailure: new Date(),
            updatedAt: new Date()
          });

          // TODO: Send email notification about failed payment

          console.log(`Payment failed for family ${familyDocFailed.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    throw error(500, err.message || 'Webhook handler failed');
  }
};
