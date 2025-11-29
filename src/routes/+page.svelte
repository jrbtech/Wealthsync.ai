<script lang="ts">
  import { Button } from '$lib/components/ui';
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
    Lock,
    Globe,
    TrendingUp,
    Building,
    BarChart3,
    Layers,
    Zap,
    Eye
  } from 'lucide-svelte';

  const features = [
    {
      icon: Layers,
      title: 'Consolidation',
      description: 'Aggregate accounts, assets, and legal entities into a unified view. Liquid investments, real estate, private equity, and alternative holdings.',
      color: 'accent'
    },
    {
      icon: Eye,
      title: 'Visibility',
      description: 'Real-time dashboards providing comprehensive insights. Performance tracking, asset allocation, and risk analysis across the entire portfolio.',
      color: 'navy'
    },
    {
      icon: Users,
      title: 'Coordination',
      description: 'Align advisors, family members, and staff on a single platform. Structured communication for CPAs, estate attorneys, and wealth managers.',
      color: 'emerald'
    },
    {
      icon: Shield,
      title: 'Protection',
      description: 'Bank-level encryption, SOC 2 Type II compliance, and granular access controls. Data sovereignty and privacy by design.',
      color: 'purple'
    },
    {
      icon: Sparkles,
      title: 'Automation',
      description: 'Document processing, deadline management, and report generation. Streamlined workflows for operational efficiency.',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Reporting',
      description: 'Institutional-quality reports for family meetings, tax planning, and advisor reviews. Customizable templates and scheduled delivery.',
      color: 'blue'
    }
  ];

  const featureColors: Record<string, { bg: string; icon: string }> = {
    accent: { bg: 'bg-accent-50', icon: 'text-accent-600' },
    navy: { bg: 'bg-navy-50', icon: 'text-navy-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' }
  };

  const plans = [
    {
      id: 'foundation',
      name: 'Foundation',
      price: PLAN_PRICES.foundation,
      description: 'Essential infrastructure for emerging family offices',
      features: [
        'Up to 3 family members',
        '10 advisor connections',
        '5GB secure document storage',
        'Deadline tracking',
        'Email support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: PLAN_PRICES.growth,
      description: 'Comprehensive platform for active family offices',
      popular: true,
      features: [
        'Up to 8 family members',
        'Unlimited advisor connections',
        '25GB secure document storage',
        'Document processing',
        'Priority support',
        'Custom reporting'
      ]
    },
    {
      id: 'legacy',
      name: 'Legacy',
      price: PLAN_PRICES.legacy,
      description: 'Enterprise solution for multi-generational offices',
      features: [
        'Unlimited family members',
        'Unlimited advisor connections',
        '100GB secure document storage',
        'Full automation suite',
        'Dedicated account manager',
        'Custom integrations',
        'API access'
      ]
    }
  ];

  const stats = [
    { value: '$10B+', label: 'Assets Under Management' },
    { value: '500+', label: 'Family Offices' },
    { value: '99.9%', label: 'Platform Uptime' },
    { value: '50+', label: 'Enterprise Clients' }
  ];

  const clientTypes = [
    'Single Family Offices',
    'Multi-Family Offices',
    'Private Banks',
    'Wealth Advisors',
    'Trust Companies',
    'Estate Attorneys'
  ];
</script>

<svelte:head>
  <title>WealthSync.ai | Family Office Operating System</title>
  <meta name="description" content="The operating system for families managing $50M+ in wealth. Consolidate assets, coordinate advisors, and control your legacy from one platform." />
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-200">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="/" class="flex items-center gap-3">
          <div class="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">W</span>
          </div>
          <span class="font-semibold text-navy-900 text-xl tracking-tight">WealthSync.ai</span>
        </a>

        <div class="hidden lg:flex items-center gap-10">
          <a href="#platform" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Platform</a>
          <a href="#solutions" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Solutions</a>
          <a href="#pricing" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Pricing</a>
          <a href="#security" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Security</a>
        </div>

        <div class="flex items-center gap-4">
          <a href="/auth/login" class="hidden sm:block text-navy-600 hover:text-navy-900 font-medium transition-colors">
            Sign In
          </a>
          <Button href="/auth/signup" variant="primary">Get Started</Button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section - Clean, Institutional -->
  <section class="pt-32 lg:pt-40 pb-20 lg:pb-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-4xl">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-[1.1] tracking-tight font-display">
          Unified wealth infrastructure.
          <span class="block text-navy-500">Purpose-built for family offices.</span>
        </h1>

        <p class="mt-8 text-xl lg:text-2xl text-navy-600 leading-relaxed max-w-3xl">
          A comprehensive platform for families and institutions managing significant wealth.
          Consolidate holdings, coordinate advisory teams, and maintain governance across generations.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4">
          <Button href="/auth/signup" variant="primary" size="lg">
            Schedule Consultation
            <ArrowRight class="w-5 h-5" />
          </Button>
          <Button href="#platform" variant="secondary" size="lg">
            View Platform
          </Button>
        </div>

        <div class="mt-16 pt-8 border-t border-cream-200">
          <p class="text-sm text-navy-500 uppercase tracking-wider font-medium mb-6">Serving leading family offices and institutions</p>
          <div class="flex flex-wrap gap-x-12 gap-y-4">
            {#each clientTypes as type}
              <span class="text-navy-400 font-medium">{type}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="bg-navy-900 py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {#each stats as stat}
          <div class="text-center lg:text-left">
            <p class="text-3xl lg:text-4xl font-bold text-white tracking-tight">{stat.value}</p>
            <p class="text-navy-300 mt-2">{stat.label}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Platform Section -->
  <section id="platform" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Platform Capabilities</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Comprehensive infrastructure for complex wealth
        </h2>
        <p class="mt-6 text-xl text-navy-600">
          Replace fragmented systems with an integrated platform designed for institutional-grade wealth management.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          {@const FeatureIcon = feature.icon}
          {@const colors = featureColors[feature.color]}
          <div class="bg-white rounded-2xl p-8 border border-cream-200 hover:border-cream-300 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 {colors.bg} rounded-xl flex items-center justify-center mb-6">
              <FeatureIcon class="w-6 h-6 {colors.icon}" />
            </div>
            <h3 class="text-xl font-semibold text-navy-900 mb-3">
              {feature.title}
            </h3>
            <p class="text-navy-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Problem/Solution Section -->
  <section id="solutions" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div>
          <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Current Challenges</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight mb-8 font-display">
            Operational complexity undermines wealth preservation
          </h2>

          <div class="space-y-6">
            {#each [
              "Advisory teams operate in isolation without shared context",
              "Critical documents dispersed across multiple systems",
              "Compliance deadlines and distributions require manual tracking",
              "Family members lack appropriate visibility into holdings",
              "Significant resources allocated to coordination overhead"
            ] as problem}
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div class="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
                <p class="text-navy-700">{problem}</p>
              </div>
            {/each}
          </div>
        </div>

        <div class="bg-navy-900 rounded-3xl p-10 lg:p-12">
          <p class="text-accent-400 font-semibold uppercase tracking-wider text-sm mb-4">Integrated Solution</p>
          <h3 class="text-2xl lg:text-3xl font-bold text-white mb-8 font-display">
            Unified platform for operational excellence
          </h3>

          <div class="space-y-6">
            {#each [
              "Centralized data access for all authorized stakeholders",
              "Secure document repository with version control",
              "Systematic deadline management and notifications",
              "Configurable access controls by role and entity",
              "Measurable reduction in administrative overhead"
            ] as solution}
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="w-4 h-4 text-accent-400" />
                </div>
                <p class="text-navy-200">{solution}</p>
              </div>
            {/each}
          </div>

          <div class="mt-10">
            <Button href="/auth/signup" variant="accent">
              View Implementation
              <ArrowRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Security Section -->
  <section id="security" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Security & Compliance</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Institutional-grade security architecture
        </h2>
        <p class="mt-6 text-xl text-navy-600">
          Purpose-built infrastructure meeting the rigorous requirements of family offices and institutional clients.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">256-bit Encryption</h3>
          <p class="text-navy-600">All data encrypted at rest and in transit using bank-level AES-256 encryption.</p>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">SOC 2 Type II</h3>
          <p class="text-navy-600">Independently audited security controls that meet institutional standards.</p>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Globe class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">GDPR Compliant</h3>
          <p class="text-navy-600">Full compliance with international data protection regulations.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Engagement Options</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Structured pricing aligned with your requirements
        </h2>
        <p class="mt-6 text-xl text-navy-600">
          Complimentary 14-day evaluation period. No commitment required.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each plans as plan}
          <div class="relative {plan.popular ? 'lg:-translate-y-4' : ''}">
            {#if plan.popular}
              <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-500 text-white text-sm font-medium rounded-full">
                Recommended
              </div>
            {/if}

            <div class="h-full bg-white rounded-2xl border-2 {plan.popular ? 'border-accent-500 shadow-xl' : 'border-cream-200'}">
              <div class="p-8">
                <h3 class="text-2xl font-bold text-navy-900">{plan.name}</h3>
                <p class="text-navy-500 mt-2">{plan.description}</p>

                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-4xl font-bold text-navy-900">{formatCurrency(plan.price)}</span>
                  <span class="text-navy-500">/month</span>
                </div>

                <ul class="mt-8 space-y-4">
                  {#each plan.features as feature}
                    <li class="flex items-start gap-3">
                      <Check class="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
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
                    Begin Evaluation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-12 text-center">
        <p class="text-navy-600">
          Need a custom solution? <a href="mailto:enterprise@wealthsync.ai" class="text-accent-600 font-medium hover:underline">Contact our enterprise team</a>
        </p>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="bg-navy-900 py-24 lg:py-32">
    <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
      <h2 class="text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
        Elevate your family office operations
      </h2>
      <p class="mt-6 text-xl text-navy-300">
        Serving distinguished family offices and institutions worldwide
      </p>
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/auth/signup" variant="accent" size="lg">
          Schedule Consultation
          <ArrowRight class="w-5 h-5" />
        </Button>
        <Button href="mailto:inquiries@wealthsync.ai" variant="secondary" size="lg">
          Contact Us
        </Button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-navy-950 py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h4 class="text-white font-semibold mb-4">Platform</h4>
          <ul class="space-y-3">
            <li><a href="#platform" class="text-navy-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#security" class="text-navy-400 hover:text-white transition-colors">Security</a></li>
            <li><a href="#pricing" class="text-navy-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="/auth/signup" class="text-navy-400 hover:text-white transition-colors">Get Started</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Solutions</h4>
          <ul class="space-y-3">
            <li><a href="#solutions" class="text-navy-400 hover:text-white transition-colors">Family Offices</a></li>
            <li><a href="#solutions" class="text-navy-400 hover:text-white transition-colors">Multi-Family Offices</a></li>
            <li><a href="#solutions" class="text-navy-400 hover:text-white transition-colors">Wealth Advisors</a></li>
            <li><a href="#solutions" class="text-navy-400 hover:text-white transition-colors">Institutions</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-3">
            <li><a href="mailto:inquiries@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Sales Inquiries</a></li>
            <li><a href="mailto:support@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Support</a></li>
            <li><a href="mailto:partnerships@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Partnerships</a></li>
            <li><a href="/auth/login" class="text-navy-400 hover:text-white transition-colors">Client Login</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-3">
            <li><a href="/privacy" class="text-navy-400 hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="text-navy-400 hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#security" class="text-navy-400 hover:text-white transition-colors">Security</a></li>
            <li><a href="mailto:compliance@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Compliance</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">W</span>
          </div>
          <span class="font-semibold text-white tracking-tight">WealthSync.ai</span>
        </div>

        <p class="text-navy-500 text-sm">
          {new Date().getFullYear()} WealthSync Technologies, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
