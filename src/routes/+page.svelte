<script lang="ts">
  import { Button, Card } from '$lib/components/ui';
  import { formatCurrency } from '$lib/utils/format';
  import { PLAN_PRICES } from '$lib/types';
  import {
    Check,
    Users,
    Calendar,
    FileText,
    PieChart,
    Sparkles,
    Shield,
    Clock,
    ArrowRight,
    ChevronRight
  } from 'lucide-svelte';

  const features = [
    {
      icon: Users,
      title: 'Advisor Coordination',
      description: 'Keep all your advisors on the same page. Track contacts, schedule meetings, and share documents effortlessly.'
    },
    {
      icon: Calendar,
      title: 'Deadline Tracking',
      description: 'Never miss a tax deadline, trust distribution, or policy renewal. Automated reminders keep you ahead.'
    },
    {
      icon: FileText,
      title: 'Document Vault',
      description: 'Secure, organized storage for all your important documents. From estate plans to tax returns.'
    },
    {
      icon: PieChart,
      title: 'Wealth Dashboard',
      description: 'Track net worth across all entities. Real-time visibility into your complete financial picture.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Tools',
      description: 'Summarize complex documents, clean up meeting notes, and generate quarterly reports automatically.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption, SOC 2 compliance, and multi-factor authentication protect your data.'
    }
  ];

  const plans = [
    {
      id: 'foundation',
      name: 'Foundation',
      price: PLAN_PRICES.foundation,
      description: 'For families just starting to organize',
      features: [
        '3 family members',
        '10 advisor connections',
        '5GB document storage',
        'Deadline tracking',
        'Email support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: PLAN_PRICES.growth,
      description: 'For growing family offices',
      popular: true,
      features: [
        '8 family members',
        'Unlimited advisors',
        '25GB document storage',
        'AI document summarization',
        'Priority support',
        'Custom reports'
      ]
    },
    {
      id: 'legacy',
      name: 'Legacy',
      price: PLAN_PRICES.legacy,
      description: 'For established family offices',
      features: [
        'Unlimited family members',
        'Unlimited advisors',
        '100GB document storage',
        'AI-powered reports',
        'Dedicated account manager',
        'Custom integrations',
        'API access'
      ]
    }
  ];

  const testimonials = [
    {
      quote: "We were paying $30K/month for a fractional family office president. WealthSync does 80% of what they did for $3K/month.",
      author: "Family Office",
      detail: "$125M AUM"
    },
    {
      quote: "Finally, a tool that speaks our language. Our CPA, estate attorney, and wealth manager are all on the same page now.",
      author: "Private Client",
      detail: "$75M Net Worth"
    }
  ];
</script>

<svelte:head>
  <title>WealthSync - Family Office Operating System</title>
  <meta name="description" content="The operating system for families managing $50M+ in wealth. One dashboard to track everything, coordinate everyone, and govern your legacy." />
</svelte:head>

<div class="min-h-screen bg-cream-200">
  <!-- Navigation -->
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
            <span class="text-gold-400 font-serif font-bold text-lg">W</span>
          </div>
          <span class="font-serif font-semibold text-navy-800 text-xl">WealthSync</span>
        </a>

        <div class="flex items-center gap-4">
          <a href="#pricing" class="text-cream-700 hover:text-navy-800 font-medium hidden sm:block">
            Pricing
          </a>
          <a href="/auth/login" class="text-cream-700 hover:text-navy-800 font-medium">
            Sign In
          </a>
          <Button href="/auth/signup" size="sm">Get Started</Button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <div class="max-w-3xl">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-navy-800 leading-tight">
          Stop Juggling Your Advisors.
          <span class="text-gold-600">Start Coordinating Them.</span>
        </h1>

        <p class="mt-6 text-xl text-cream-700 leading-relaxed">
          WealthSync is the operating system for families managing $50M+ in wealth.
          One dashboard to track everything, coordinate everyone, and govern your legacy.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4">
          <Button href="/auth/signup" size="lg" class="text-base">
            Start Free Trial
            <ArrowRight class="w-5 h-5" />
          </Button>
          <Button href="#demo" variant="secondary" size="lg" class="text-base">
            Watch Demo
          </Button>
        </div>

        <p class="mt-6 text-sm text-cream-600">
          No credit card required. 14-day free trial.
        </p>
      </div>
    </div>

    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-navy-50 to-transparent opacity-50 -z-10"></div>
  </section>

  <!-- Problem Section -->
  <section class="bg-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-serif font-bold text-navy-800 mb-4">
          You're the middleman between 10+ advisors
        </h2>
        <p class="text-xl text-cream-600">
          And it's costing you time, money, and peace of mind.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each [
          { icon: Clock, text: "Your wealth manager doesn't talk to your CPA" },
          { icon: FileText, text: "Your estate attorney needs documents from your banker" },
          { icon: Calendar, text: "You miss critical tax deadlines because nobody reminded you" },
          { icon: Users, text: "Family members don't know what's happening with the estate" },
          { icon: Shield, text: "Sensitive documents scattered across email, Dropbox, and file cabinets" },
          { icon: PieChart, text: "Paying $100K-500K/year just to coordinate everyone" }
        ] as problem}
          <div class="flex items-start gap-4 p-6 rounded-xl bg-red-50 border border-red-100">
            <div class="flex-shrink-0 p-2 bg-red-100 rounded-lg">
              <svelte:component this={problem.icon} class="w-5 h-5 text-red-600" />
            </div>
            <p class="text-cream-800">{problem.text}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-serif font-bold text-navy-800 mb-4">
          One platform. All your advisors. Total clarity.
        </h2>
        <p class="text-xl text-cream-600">
          Everything you need to run your family office, without the overhead.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          <Card variant="hover" class="h-full">
            <div class="p-2 bg-navy-100 rounded-lg w-fit mb-4">
              <svelte:component this={feature.icon} class="w-6 h-6 text-navy-800" />
            </div>
            <h3 class="text-xl font-serif font-semibold text-navy-800 mb-2">
              {feature.title}
            </h3>
            <p class="text-cream-600">
              {feature.description}
            </p>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="bg-navy-800 py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {#each testimonials as testimonial}
          <div class="bg-navy-700/50 rounded-2xl p-8 border border-navy-600">
            <p class="text-xl text-white leading-relaxed mb-6">
              "{testimonial.quote}"
            </p>
            <div>
              <p class="text-gold-400 font-medium">{testimonial.author}</p>
              <p class="text-navy-300 text-sm">{testimonial.detail}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-serif font-bold text-navy-800 mb-4">
          Simple, transparent pricing
        </h2>
        <p class="text-xl text-cream-600">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each plans as plan}
          <Card
            padding="none"
            class="{plan.popular ? 'ring-2 ring-gold-500 scale-105' : ''}"
          >
            {#if plan.popular}
              <div class="bg-gold-500 text-navy-900 text-center py-2 text-sm font-medium rounded-t-xl">
                Most Popular
              </div>
            {/if}

            <div class="p-8">
              <h3 class="text-2xl font-serif font-semibold text-navy-800">{plan.name}</h3>
              <p class="text-cream-600 mt-1">{plan.description}</p>

              <div class="mt-6">
                <span class="text-4xl font-bold text-navy-800">{formatCurrency(plan.price)}</span>
                <span class="text-cream-600">/month</span>
              </div>

              <ul class="mt-8 space-y-4">
                {#each plan.features as feature}
                  <li class="flex items-start gap-3">
                    <Check class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span class="text-cream-700">{feature}</span>
                  </li>
                {/each}
              </ul>

              <div class="mt-8">
                <Button
                  href="/auth/signup?plan={plan.id}"
                  variant={plan.popular ? 'gold' : 'primary'}
                  class="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="bg-navy-800 py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
        Ready to take control of your family office?
      </h2>
      <p class="text-xl text-navy-200 mb-8">
        Join families managing over $10 billion in combined assets on WealthSync.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/auth/signup" variant="gold" size="lg" class="text-base">
          Start Free Trial
          <ArrowRight class="w-5 h-5" />
        </Button>
        <Button href="mailto:hello@wealthsync.ai" variant="secondary" size="lg" class="text-base">
          Talk to Sales
        </Button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-cream-100 border-t border-cream-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
            <span class="text-gold-400 font-serif font-bold text-lg">W</span>
          </div>
          <span class="font-serif font-semibold text-navy-800 text-xl">WealthSync</span>
        </div>

        <div class="flex items-center gap-6 text-sm text-cream-600">
          <a href="/privacy" class="hover:text-navy-800">Privacy</a>
          <a href="/terms" class="hover:text-navy-800">Terms</a>
          <a href="/security" class="hover:text-navy-800">Security</a>
          <a href="mailto:hello@wealthsync.ai" class="hover:text-navy-800">Contact</a>
        </div>

        <p class="text-sm text-cream-500">
          &copy; {new Date().getFullYear()} WealthSync. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
