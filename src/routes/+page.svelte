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
    ChevronRight,
    Zap,
    Lock,
    Globe,
    TrendingUp,
    Building,
    Star
  } from 'lucide-svelte';

  const features = [
    {
      icon: Users,
      title: 'Advisor Coordination',
      description: 'Keep all your advisors on the same page. Track contacts, schedule meetings, and share documents effortlessly.',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Deadline Tracking',
      description: 'Never miss a tax deadline, trust distribution, or policy renewal. Automated reminders keep you ahead.',
      color: 'orange'
    },
    {
      icon: FileText,
      title: 'Document Vault',
      description: 'Secure, organized storage for all your important documents. From estate plans to tax returns.',
      color: 'emerald'
    },
    {
      icon: PieChart,
      title: 'Wealth Dashboard',
      description: 'Track net worth across all entities. Real-time visibility into your complete financial picture.',
      color: 'purple'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Tools',
      description: 'Summarize complex documents, clean up meeting notes, and generate quarterly reports automatically.',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption, SOC 2 compliance, and multi-factor authentication protect your data.',
      color: 'red'
    }
  ];

  const featureColors: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
    orange: { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', border: 'border-orange-200' },
    emerald: { bg: 'from-emerald-50 to-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-200' },
    purple: { bg: 'from-purple-50 to-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
    cyan: { bg: 'from-cyan-50 to-cyan-100', icon: 'text-cyan-600', border: 'border-cyan-200' },
    red: { bg: 'from-red-50 to-red-100', icon: 'text-red-600', border: 'border-red-200' }
  };

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
      author: "Family Office Principal",
      detail: "$125M AUM",
      rating: 5
    },
    {
      quote: "Finally, a tool that speaks our language. Our CPA, estate attorney, and wealth manager are all on the same page now.",
      author: "Private Client",
      detail: "$75M Net Worth",
      rating: 5
    }
  ];

  const stats = [
    { value: '$10B+', label: 'Assets Managed' },
    { value: '500+', label: 'Family Offices' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'Support' }
  ];

  const trustedBy = [
    'Multi-generational families',
    'Single family offices',
    'Wealth managers',
    'Estate attorneys'
  ];
</script>

<svelte:head>
  <title>WealthSync - Family Office Operating System</title>
  <meta name="description" content="The operating system for families managing $50M+ in wealth. One dashboard to track everything, coordinate everyone, and govern your legacy." />
</svelte:head>

<div class="min-h-screen bg-cream-100">
  <!-- Navigation - Premium Glass Effect -->
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cream-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-18">
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/30 transition-shadow">
            <span class="text-navy-950 font-bold text-xl">W</span>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-navy-900 text-lg tracking-tight">WealthSync</span>
            <span class="text-[10px] text-accent-600 font-medium uppercase tracking-widest hidden sm:block">Family Office</span>
          </div>
        </a>

        <div class="flex items-center gap-6">
          <a href="#features" class="text-navy-500 hover:text-navy-900 font-medium hidden sm:block transition-colors">
            Features
          </a>
          <a href="#pricing" class="text-navy-500 hover:text-navy-900 font-medium hidden sm:block transition-colors">
            Pricing
          </a>
          <a href="/auth/login" class="text-navy-500 hover:text-navy-900 font-medium transition-colors">
            Sign In
          </a>
          <Button href="/auth/signup" variant="primary" size="sm">Get Started</Button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero - Premium Masttro-inspired -->
  <section class="relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-gradient-to-br from-cream-100 via-white to-cream-50"></div>
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-navy-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 border border-accent-200 rounded-full mb-8">
            <Zap class="w-4 h-4 text-accent-600" />
            <span class="text-sm font-medium text-accent-700">The #1 Family Office Platform</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-[1.1] tracking-tight">
            Your Wealth,
            <br />
            <span class="text-gradient bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">Synchronized.</span>
          </h1>

          <p class="mt-8 text-xl text-navy-600 leading-relaxed max-w-xl">
            The operating system for families managing $50M+ in wealth.
            One dashboard to track everything, coordinate everyone, and govern your legacy.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="/auth/signup" variant="accent" size="lg">
              Start Free Trial
              <ArrowRight class="w-5 h-5" />
            </Button>
            <Button href="#demo" variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>

          <div class="mt-10 flex items-center gap-6">
            <div class="flex -space-x-3">
              {#each [1, 2, 3, 4] as i}
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 border-2 border-white flex items-center justify-center text-xs font-medium text-navy-600">
                  {String.fromCharCode(64 + i)}
                </div>
              {/each}
            </div>
            <div class="text-sm">
              <p class="font-semibold text-navy-900">Trusted by 500+ families</p>
              <p class="text-navy-500">Managing over $10B in assets</p>
            </div>
          </div>
        </div>

        <!-- Hero Visual - Premium Dashboard Preview -->
        <div class="relative">
          <div class="bg-gradient-to-br from-navy-900 to-navy-950 rounded-3xl p-8 shadow-2xl shadow-navy-900/20">
            <!-- Mock Dashboard Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div class="px-4 py-1.5 bg-white/10 rounded-full text-xs text-white/70">wealthsync.ai/dashboard</div>
            </div>

            <!-- Mock Net Worth Display -->
            <div class="mb-6">
              <p class="text-navy-400 text-sm mb-1">Total Net Worth</p>
              <p class="text-4xl font-bold text-white" style="font-variant-numeric: tabular-nums;">$127,450,000</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                  <TrendingUp class="w-3 h-3 text-emerald-400" />
                  <span class="text-xs font-medium text-emerald-400">+12.4%</span>
                </div>
                <span class="text-xs text-navy-400">vs last year</span>
              </div>
            </div>

            <!-- Mock Stats -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-2xl font-bold text-white">8</p>
                <p class="text-xs text-navy-400">Advisors</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-2xl font-bold text-white">24</p>
                <p class="text-xs text-navy-400">Documents</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-2xl font-bold text-white">5</p>
                <p class="text-xs text-navy-400">Entities</p>
              </div>
            </div>
          </div>

          <!-- Floating Cards -->
          <div class="absolute -right-8 top-1/4 bg-white rounded-2xl p-4 shadow-xl border border-cream-200 hidden lg:block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-navy-900">Tax deadline filed</p>
                <p class="text-xs text-navy-500">2 days ago</p>
              </div>
            </div>
          </div>

          <div class="absolute -left-8 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl border border-cream-200 hidden lg:block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <Sparkles class="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-navy-900">AI Summary Ready</p>
                <p class="text-xs text-navy-500">Q3 Trust Review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="bg-navy-950 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat}
          <div class="text-center">
            <p class="text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
            <p class="text-sm text-navy-400 mt-1">{stat.label}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Problem Section - Premium Design -->
  <section class="bg-white py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-4">The Problem</p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-6">
          You're the middleman between 10+ advisors
        </h2>
        <p class="text-xl text-navy-500">
          And it's costing you time, money, and peace of mind.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each [
          { icon: Clock, text: "Your wealth manager doesn't talk to your CPA" },
          { icon: FileText, text: "Your estate attorney needs documents from your banker" },
          { icon: Calendar, text: "You miss critical tax deadlines because nobody reminded you" },
          { icon: Users, text: "Family members don't know what's happening with the estate" },
          { icon: Shield, text: "Sensitive documents scattered across email, Dropbox, and file cabinets" },
          { icon: PieChart, text: "Paying $100K-500K/year just to coordinate everyone" }
        ] as problem}
          {@const ProblemIcon = problem.icon}
          <div class="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100/50 hover:shadow-lg transition-shadow">
            <div class="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm">
              <ProblemIcon class="w-5 h-5 text-red-500" />
            </div>
            <p class="text-navy-700 font-medium">{problem.text}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features - Premium Design -->
  <section id="features" class="py-24 bg-cream-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-4">Features</p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-6">
          One platform. Total clarity.
        </h2>
        <p class="text-xl text-navy-500">
          Everything you need to run your family office, without the overhead.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each features as feature}
          {@const FeatureIcon = feature.icon}
          {@const colors = featureColors[feature.color]}
          <div class="bg-white rounded-2xl p-8 border border-cream-200 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
            <div class="p-3 bg-gradient-to-br {colors.bg} rounded-xl w-fit mb-5 border {colors.border}">
              <FeatureIcon class="w-6 h-6 {colors.icon}" />
            </div>
            <h3 class="text-xl font-semibold text-navy-900 mb-3">
              {feature.title}
            </h3>
            <p class="text-navy-500 leading-relaxed">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials - Premium Design -->
  <section class="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-950 py-24 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-400/5 rounded-full blur-3xl"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div class="text-center mb-16">
        <p class="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">Testimonials</p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Trusted by leading families
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {#each testimonials as testimonial}
          <div class="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div class="flex gap-1 mb-6">
              {#each Array(testimonial.rating) as _}
                <Star class="w-5 h-5 text-gold-400 fill-gold-400" />
              {/each}
            </div>
            <p class="text-xl text-white leading-relaxed mb-8">
              "{testimonial.quote}"
            </p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                <span class="text-navy-950 font-bold">{testimonial.author.charAt(0)}</span>
              </div>
              <div>
                <p class="text-white font-semibold">{testimonial.author}</p>
                <p class="text-navy-400 text-sm">{testimonial.detail}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing - Premium Design -->
  <section id="pricing" class="py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-4">Pricing</p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-6">
          Simple, transparent pricing
        </h2>
        <p class="text-xl text-navy-500">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {#each plans as plan}
          <div class="relative {plan.popular ? 'lg:-translate-y-4' : ''}">
            {#if plan.popular}
              <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-accent-500 to-accent-600 text-navy-950 text-sm font-semibold rounded-full shadow-lg shadow-accent-500/25">
                Most Popular
              </div>
            {/if}

            <div class="h-full bg-white rounded-3xl border-2 {plan.popular ? 'border-accent-500 shadow-xl shadow-accent-500/10' : 'border-cream-200'} overflow-hidden">
              <div class="p-8">
                <h3 class="text-2xl font-bold text-navy-900">{plan.name}</h3>
                <p class="text-navy-500 mt-1">{plan.description}</p>

                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-5xl font-bold text-navy-900">{formatCurrency(plan.price)}</span>
                  <span class="text-navy-500">/month</span>
                </div>

                <ul class="mt-8 space-y-4">
                  {#each plan.features as feature}
                    <li class="flex items-start gap-3">
                      <div class="p-0.5 bg-accent-100 rounded-full mt-0.5">
                        <Check class="w-4 h-4 text-accent-600" />
                      </div>
                      <span class="text-navy-600">{feature}</span>
                    </li>
                  {/each}
                </ul>

                <div class="mt-8">
                  <Button
                    href="/auth/signup?plan={plan.id}"
                    variant={plan.popular ? 'accent' : 'secondary'}
                    class="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA - Premium Design -->
  <section class="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-950 py-24 relative overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
        Ready to take control of your family office?
      </h2>
      <p class="text-xl text-navy-300 mb-10">
        Join families managing over $10 billion in combined assets on WealthSync.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/auth/signup" variant="accent" size="lg">
          Start Free Trial
          <ArrowRight class="w-5 h-5" />
        </Button>
        <Button href="mailto:hello@wealthsync.ai" variant="secondary" size="lg">
          Talk to Sales
        </Button>
      </div>
    </div>
  </section>

  <!-- Footer - Premium Design -->
  <footer class="bg-navy-950 border-t border-white/5 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
            <span class="text-navy-950 font-bold text-xl">W</span>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-white text-lg tracking-tight">WealthSync</span>
            <span class="text-[10px] text-accent-400 font-medium uppercase tracking-widest">Family Office</span>
          </div>
        </div>

        <div class="flex items-center gap-8 text-sm text-navy-400">
          <a href="/privacy" class="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" class="hover:text-white transition-colors">Terms</a>
          <a href="/security" class="hover:text-white transition-colors">Security</a>
          <a href="mailto:hello@wealthsync.ai" class="hover:text-white transition-colors">Contact</a>
        </div>

        <p class="text-sm text-navy-500">
          &copy; {new Date().getFullYear()} WealthSync. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
