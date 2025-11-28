<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Badge, Spinner } from '$lib/components/ui';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { PLAN_PRICES, PLAN_LIMITS } from '$lib/types';
  import type { PlanType } from '$lib/types';
  import { Check, ArrowLeft, CreditCard, Calendar, Users, Briefcase } from 'lucide-svelte';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(false);

  const plans: { id: PlanType; name: string; features: string[] }[] = [
    {
      id: 'foundation',
      name: 'Foundation',
      features: [
        '3 family members',
        '10 advisor connections',
        'Document vault (5GB)',
        'Deadline tracking',
        'Email support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      features: [
        '8 family members',
        'Unlimited advisors',
        'Document vault (25GB)',
        'AI document summarization',
        'Priority support'
      ]
    },
    {
      id: 'legacy',
      name: 'Legacy',
      features: [
        'Unlimited family members',
        'Unlimited advisors',
        'Document vault (100GB)',
        'AI-powered reports',
        'Dedicated account manager',
        'Custom integrations'
      ]
    }
  ];

  async function handleUpgrade(planId: PlanType) {
    if (!family) return;

    // In production, this would redirect to Stripe Checkout
    loading = true;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: family.id,
          planId
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      showError('Failed to start checkout. Please try again.');
    } finally {
      loading = false;
    }
  }

  async function handleManageBilling() {
    if (!family?.stripeCustomerId) {
      showError('No billing account found');
      return;
    }

    loading = true;

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: family.id,
          customerId: family.stripeCustomerId
        })
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      showError('Failed to open billing portal. Please try again.');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Billing - WealthSync</title>
</svelte:head>

<AppShell title="Billing & Plan">
  <div class="mb-6">
    <Button href="/settings" variant="ghost" size="sm">
      <ArrowLeft class="w-4 h-4" />
      Back to Settings
    </Button>
  </div>

  <!-- Current Plan -->
  <Card class="mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-sm text-cream-600">Current Plan</p>
        <div class="flex items-center gap-2 mt-1">
          <h2 class="text-2xl font-serif font-semibold text-navy-800 capitalize">
            {family?.plan || 'Foundation'}
          </h2>
          <Badge variant="gold">Active</Badge>
        </div>
        <p class="text-cream-600 mt-1">
          {formatCurrency(PLAN_PRICES[family?.plan || 'foundation'])}/month
        </p>
      </div>

      {#if family?.stripeCustomerId}
        <Button variant="secondary" onclick={handleManageBilling} {loading}>
          <CreditCard class="w-4 h-4" />
          Manage Billing
        </Button>
      {/if}
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-cream-200">
      <div>
        <p class="text-sm text-cream-600">Family Members</p>
        <p class="text-lg font-semibold text-navy-800">
          {PLAN_LIMITS[family?.plan || 'foundation'].familyMembers === Infinity
            ? 'Unlimited'
            : PLAN_LIMITS[family?.plan || 'foundation'].familyMembers}
        </p>
      </div>
      <div>
        <p class="text-sm text-cream-600">Advisors</p>
        <p class="text-lg font-semibold text-navy-800">
          {PLAN_LIMITS[family?.plan || 'foundation'].advisors === Infinity
            ? 'Unlimited'
            : PLAN_LIMITS[family?.plan || 'foundation'].advisors}
        </p>
      </div>
      <div>
        <p class="text-sm text-cream-600">Next Billing</p>
        <p class="text-lg font-semibold text-navy-800">
          {formatDate(new Date())}
        </p>
      </div>
      <div>
        <p class="text-sm text-cream-600">Status</p>
        <p class="text-lg font-semibold text-emerald-600">Active</p>
      </div>
    </div>
  </Card>

  <!-- Plan Comparison -->
  <h2 class="text-xl font-serif font-semibold text-navy-800 mb-4">Available Plans</h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each plans as plan}
      {@const isCurrentPlan = family?.plan === plan.id}
      {@const price = PLAN_PRICES[plan.id]}

      <Card
        padding="none"
        class="{isCurrentPlan ? 'ring-2 ring-navy-800' : ''} {plan.id === 'growth' ? 'border-gold-500 border-2' : ''}"
      >
        {#if plan.id === 'growth'}
          <div class="bg-gold-500 text-navy-900 text-center py-1 text-sm font-medium">
            Most Popular
          </div>
        {/if}

        <div class="p-6">
          <h3 class="text-xl font-serif font-semibold text-navy-800">{plan.name}</h3>
          <div class="mt-2">
            <span class="text-3xl font-bold text-navy-800">{formatCurrency(price)}</span>
            <span class="text-cream-600">/month</span>
          </div>

          <ul class="mt-6 space-y-3">
            {#each plan.features as feature}
              <li class="flex items-start gap-2">
                <Check class="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span class="text-cream-700">{feature}</span>
              </li>
            {/each}
          </ul>

          <div class="mt-6">
            {#if isCurrentPlan}
              <Button variant="secondary" class="w-full" disabled>
                Current Plan
              </Button>
            {:else}
              <Button
                variant={plan.id === 'growth' ? 'gold' : 'primary'}
                class="w-full"
                onclick={() => handleUpgrade(plan.id)}
                {loading}
              >
                {price > PLAN_PRICES[family?.plan || 'foundation'] ? 'Upgrade' : 'Downgrade'}
              </Button>
            {/if}
          </div>
        </div>
      </Card>
    {/each}
  </div>

  <!-- FAQ -->
  <Card class="mt-8">
    <h3 class="font-semibold text-navy-800 mb-4">Billing FAQ</h3>

    <div class="space-y-4">
      <div>
        <p class="font-medium text-navy-800">How does billing work?</p>
        <p class="text-sm text-cream-600 mt-1">
          You'll be billed monthly on the anniversary of your subscription start date.
          Upgrades take effect immediately, and you'll be charged a prorated amount.
        </p>
      </div>

      <div>
        <p class="font-medium text-navy-800">Can I cancel anytime?</p>
        <p class="text-sm text-cream-600 mt-1">
          Yes, you can cancel your subscription at any time. Your account will remain active
          until the end of your current billing period.
        </p>
      </div>

      <div>
        <p class="font-medium text-navy-800">What payment methods do you accept?</p>
        <p class="text-sm text-cream-600 mt-1">
          We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers
          for annual plans.
        </p>
      </div>
    </div>
  </Card>
</AppShell>
