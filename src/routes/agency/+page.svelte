<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { AGENCY_PLAN_PRICES, AGENCY_PLAN_LIMITS } from '$lib/types';
  import {
    Check,
    FileText,
    Sparkles,
    ArrowRight,
    Globe,
    TrendingUp,
    BarChart3,
    Zap,
    Target,
    Clock,
    Download,
    Palette,
    Users,
    Calendar,
    PieChart,
    Award,
    Play
  } from 'lucide-svelte';

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Reports',
      description: 'Generate comprehensive SEO audits, content strategies, and competitor analyses in minutes. Claude AI creates professional reports that impress clients.',
      color: 'accent'
    },
    {
      icon: Palette,
      title: 'White-Label PDFs',
      description: 'Every report features your agency branding. Custom colors, logo, and contact info. Your clients see your brand, not ours.',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'Topical Authority Maps',
      description: 'AI analyzes your client\'s niche and generates 90-day content calendars with keyword clusters, search intent, and internal linking strategies.',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'SEO Audit Scores',
      description: 'Technical, content, and backlink scores with prioritized issues and opportunities. Clients see exactly what needs fixing.',
      color: 'emerald'
    },
    {
      icon: Users,
      title: 'Competitor Analysis',
      description: 'Benchmark against competitors with domain authority, keyword gaps, and content opportunities. Show clients their competitive landscape.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'ROI Projections',
      description: 'AI calculates traffic growth potential and revenue projections. Help clients understand the value of your services.',
      color: 'navy'
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
      id: 'starter',
      name: 'Starter',
      price: AGENCY_PLAN_PRICES.starter,
      limits: AGENCY_PLAN_LIMITS.starter,
      description: 'Perfect for freelancers and small agencies',
      features: [
        `Up to ${AGENCY_PLAN_LIMITS.starter.clients} clients`,
        `${AGENCY_PLAN_LIMITS.starter.reportsPerMonth} reports/month`,
        'White-label PDFs',
        'SEO audit reports',
        'Content calendars',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: AGENCY_PLAN_PRICES.professional,
      limits: AGENCY_PLAN_LIMITS.professional,
      description: 'For growing agencies with multiple clients',
      popular: true,
      features: [
        `Up to ${AGENCY_PLAN_LIMITS.professional.clients} clients`,
        `${AGENCY_PLAN_LIMITS.professional.reportsPerMonth} reports/month`,
        `${AGENCY_PLAN_LIMITS.professional.teamMembers} team members`,
        'All report types',
        'Custom branding',
        'Priority support',
        'API access'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: AGENCY_PLAN_PRICES.unlimited,
      limits: AGENCY_PLAN_LIMITS.unlimited,
      description: 'For agencies serious about scaling',
      features: [
        'Unlimited clients',
        'Unlimited reports',
        'Unlimited team members',
        'All features included',
        'White-glove onboarding',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  ];

  const testimonials = [
    {
      quote: "We went from spending 4 hours on each audit to generating them in 5 minutes. Our clients are blown away by the quality.",
      author: "Sarah Chen",
      role: "Founder, GrowthSEO Agency",
      avatar: "SC"
    },
    {
      quote: "The white-label PDFs look like we spent thousands on design. Our close rate on proposals went up 40%.",
      author: "Marcus Johnson",
      role: "CEO, Digital Ascent",
      avatar: "MJ"
    },
    {
      quote: "AgencyForge paid for itself with the first report we sent. Client signed a $15k/month retainer on the spot.",
      author: "Emily Rodriguez",
      role: "Director, Peak Performance Marketing",
      avatar: "ER"
    }
  ];

  const reportTypes = [
    { name: 'SEO Audit', icon: BarChart3, time: '~2 min' },
    { name: 'Content Strategy', icon: Calendar, time: '~3 min' },
    { name: 'Competitor Analysis', icon: Users, time: '~2 min' },
    { name: 'Monthly Performance', icon: TrendingUp, time: '~1 min' },
    { name: 'Quarterly Review', icon: FileText, time: '~3 min' }
  ];
</script>

<svelte:head>
  <title>AgencyForge.ai | AI-Powered Reports for SEO & Marketing Agencies</title>
  <meta name="description" content="Generate white-label SEO audits, content strategies, and competitor analyses in minutes. Impress clients and close more deals with AI-powered reports." />
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-200">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="/agency" class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="font-semibold text-navy-900 text-xl tracking-tight">AgencyForge.ai</span>
        </a>

        <div class="hidden lg:flex items-center gap-10">
          <a href="#features" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Features</a>
          <a href="#reports" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Reports</a>
          <a href="#pricing" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Pricing</a>
          <a href="#testimonials" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Testimonials</a>
        </div>

        <div class="flex items-center gap-4">
          <a href="/auth/login" class="hidden sm:block text-navy-600 hover:text-navy-900 font-medium transition-colors">
            Sign In
          </a>
          <Button href="/auth/signup?product=agency" variant="primary">Start Free Trial</Button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="pt-32 lg:pt-40 pb-20 lg:pb-32 bg-gradient-to-b from-accent-50/50 to-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-4xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full text-accent-700 text-sm font-medium mb-8">
          <Zap class="w-4 h-4" />
          Generate reports in under 5 minutes
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-[1.1] tracking-tight font-display">
          Turn 5 minutes of work into
          <span class="bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent"> $5,000 proposals</span>
        </h1>

        <p class="mt-8 text-xl lg:text-2xl text-navy-600 leading-relaxed max-w-3xl mx-auto">
          AI-powered SEO audits, content strategies, and competitor analyses.
          White-labeled with your branding. Ready to impress clients.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/auth/signup?product=agency" variant="primary" size="lg">
            Start Free 14-Day Trial
            <ArrowRight class="w-5 h-5" />
          </Button>
          <Button href="#demo" variant="secondary" size="lg">
            <Play class="w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        <p class="mt-6 text-sm text-navy-500">
          No credit card required. Cancel anytime.
        </p>
      </div>

      <!-- Report Preview -->
      <div class="mt-16 relative">
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
        <div class="bg-white rounded-2xl shadow-2xl border border-cream-200 overflow-hidden max-w-5xl mx-auto">
          <div class="bg-navy-900 text-white p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-navy-400 text-sm">AI-Generated Report</p>
                <h3 class="text-xl font-bold">SEO Audit Report - Acme Corp</h3>
              </div>
              <div class="flex gap-2">
                <div class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  Score: 72/100
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 grid grid-cols-4 gap-4">
            <div class="text-center p-4 bg-cream-50 rounded-xl">
              <p class="text-3xl font-bold text-navy-900">72</p>
              <p class="text-sm text-navy-500">Overall</p>
            </div>
            <div class="text-center p-4 bg-cream-50 rounded-xl">
              <p class="text-3xl font-bold text-orange-600">58</p>
              <p class="text-sm text-navy-500">Technical</p>
            </div>
            <div class="text-center p-4 bg-cream-50 rounded-xl">
              <p class="text-3xl font-bold text-emerald-600">81</p>
              <p class="text-sm text-navy-500">Content</p>
            </div>
            <div class="text-center p-4 bg-cream-50 rounded-xl">
              <p class="text-3xl font-bold text-accent-600">+45%</p>
              <p class="text-sm text-navy-500">Growth Potential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Social Proof Bar -->
  <section class="py-12 bg-navy-900">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="text-center md:text-left">
          <p class="text-navy-400 text-sm uppercase tracking-wider font-medium">Trusted by agencies generating</p>
          <p class="text-3xl font-bold text-white">$2M+ in client revenue</p>
        </div>
        <div class="flex gap-12">
          <div class="text-center">
            <p class="text-3xl font-bold text-white">500+</p>
            <p class="text-navy-400">Agencies</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-white">10,000+</p>
            <p class="text-navy-400">Reports Generated</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-white">4.9/5</p>
            <p class="text-navy-400">Rating</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Powerful Features</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Everything you need to wow clients
        </h2>
        <p class="mt-6 text-xl text-navy-600">
          From SEO audits to content strategies, generate professional reports that close deals.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          {@const FeatureIcon = feature.icon}
          {@const colors = featureColors[feature.color]}
          <div class="bg-white rounded-2xl p-8 border border-cream-200 hover:border-accent-200 hover:shadow-lg transition-all duration-300">
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

  <!-- Report Types Section -->
  <section id="reports" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Report Types</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display mb-6">
            5 report types, endless client value
          </h2>
          <p class="text-xl text-navy-600 mb-8">
            Each report is crafted by AI to be comprehensive, actionable, and ready to present to clients.
          </p>

          <div class="space-y-4">
            {#each reportTypes as report}
              {@const ReportIcon = report.icon}
              <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-cream-200">
                <div class="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                  <ReportIcon class="w-6 h-6 text-accent-600" />
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-navy-900">{report.name}</p>
                </div>
                <div class="flex items-center gap-2 text-sm text-navy-500">
                  <Clock class="w-4 h-4" />
                  {report.time}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl border border-cream-200 overflow-hidden">
          <div class="p-6 border-b border-cream-200">
            <div class="flex items-center gap-2 text-sm text-accent-600 font-medium mb-2">
              <Calendar class="w-4 h-4" />
              90-Day Content Calendar
            </div>
            <h3 class="text-lg font-bold text-navy-900">AI-Generated Content Strategy</h3>
          </div>
          <div class="p-6">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-navy-500 border-b border-cream-100">
                  <th class="pb-3">Week</th>
                  <th class="pb-3">Topic</th>
                  <th class="pb-3">Intent</th>
                </tr>
              </thead>
              <tbody class="text-navy-700">
                <tr class="border-b border-cream-100">
                  <td class="py-3 font-medium">1</td>
                  <td class="py-3">Complete Guide to SEO</td>
                  <td class="py-3"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Informational</span></td>
                </tr>
                <tr class="border-b border-cream-100">
                  <td class="py-3 font-medium">2</td>
                  <td class="py-3">SEO Services Pricing</td>
                  <td class="py-3"><span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Commercial</span></td>
                </tr>
                <tr class="border-b border-cream-100">
                  <td class="py-3 font-medium">3</td>
                  <td class="py-3">Local SEO Checklist</td>
                  <td class="py-3"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Informational</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-medium">4</td>
                  <td class="py-3">Get Free SEO Audit</td>
                  <td class="py-3"><span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Transactional</span></td>
                </tr>
              </tbody>
            </table>
            <p class="text-center text-sm text-navy-500 mt-4">+ 8 more weeks of content...</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section id="testimonials" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Testimonials</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Agencies love AgencyForge
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each testimonials as testimonial}
          <div class="bg-white rounded-2xl p-8 border border-cream-200">
            <div class="flex gap-1 mb-4">
              {#each Array(5) as _}
                <Award class="w-5 h-5 text-yellow-400 fill-yellow-400" />
              {/each}
            </div>
            <p class="text-navy-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-semibold text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <p class="font-semibold text-navy-900">{testimonial.author}</p>
                <p class="text-sm text-navy-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-semibold uppercase tracking-wider text-sm mb-4">Simple Pricing</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          One report pays for the whole month
        </h2>
        <p class="mt-6 text-xl text-navy-600">
          14-day free trial. No credit card required.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each plans as plan}
          <div class="relative {plan.popular ? 'lg:-translate-y-4' : ''}">
            {#if plan.popular}
              <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
            {/if}

            <div class="h-full bg-white rounded-2xl border-2 {plan.popular ? 'border-accent-500 shadow-xl' : 'border-cream-200'}">
              <div class="p-8">
                <h3 class="text-2xl font-bold text-navy-900">{plan.name}</h3>
                <p class="text-navy-500 mt-2">{plan.description}</p>

                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-4xl font-bold text-navy-900">${plan.price}</span>
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
                    href="/auth/signup?product=agency&plan={plan.id}"
                    variant={plan.popular ? 'accent' : 'secondary'}
                    class="w-full"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-12 text-center">
        <p class="text-navy-600">
          Need a custom enterprise plan? <a href="mailto:sales@agencyforge.ai" class="text-accent-600 font-medium hover:underline">Contact sales</a>
        </p>
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="bg-gradient-to-r from-navy-900 to-navy-800 py-24 lg:py-32">
    <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
      <h2 class="text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
        Stop wasting hours on manual audits
      </h2>
      <p class="mt-6 text-xl text-navy-300">
        Join 500+ agencies generating reports in minutes, not hours
      </p>
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/auth/signup?product=agency" variant="accent" size="lg">
          Start Your Free Trial
          <ArrowRight class="w-5 h-5" />
        </Button>
      </div>
      <p class="mt-6 text-sm text-navy-400">
        14 days free. No credit card required. Cancel anytime.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-navy-950 py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h4 class="text-white font-semibold mb-4">Product</h4>
          <ul class="space-y-3">
            <li><a href="#features" class="text-navy-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#reports" class="text-navy-400 hover:text-white transition-colors">Report Types</a></li>
            <li><a href="#pricing" class="text-navy-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="/auth/signup?product=agency" class="text-navy-400 hover:text-white transition-colors">Start Trial</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Resources</h4>
          <ul class="space-y-3">
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#testimonials" class="text-navy-400 hover:text-white transition-colors">Case Studies</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Company</h4>
          <ul class="space-y-3">
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">About</a></li>
            <li><a href="mailto:sales@agencyforge.ai" class="text-navy-400 hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">Careers</a></li>
            <li><a href="/auth/login" class="text-navy-400 hover:text-white transition-colors">Login</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-3">
            <li><a href="/privacy" class="text-navy-400 hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="text-navy-400 hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">Security</a></li>
            <li><a href="#" class="text-navy-400 hover:text-white transition-colors">GDPR</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
            <Sparkles class="w-4 h-4 text-white" />
          </div>
          <span class="font-semibold text-white tracking-tight">AgencyForge.ai</span>
        </div>

        <p class="text-navy-500 text-sm">
          {new Date().getFullYear()} AgencyForge Technologies, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
