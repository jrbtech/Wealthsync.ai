<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { formatCurrency } from '$lib/utils/format';
  import { WEALTH_ADVISOR_PLAN_PRICES } from '$lib/types';
  import {
    Check,
    Users,
    Calendar,
    FileText,
    PieChart,
    Shield,
    Clock,
    ArrowRight,
    Lock,
    Globe,
    TrendingUp,
    Building,
    BarChart3,
    Layers,
    Eye,
    Download,
    AlertTriangle
  } from 'lucide-svelte';

  const capabilities = [
    {
      icon: PieChart,
      title: 'Wealth Analysis',
      description: 'Comprehensive net worth assessment with asset allocation, entity structure, and portfolio composition. Institutional-grade analysis for discerning clients.',
      color: 'accent'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Assessment',
      description: 'Systematic identification of tax, legal, insurance, liquidity, and succession exposures. Each finding includes quantified impact and remediation guidance.',
      color: 'navy'
    },
    {
      icon: Users,
      title: 'Team Coordination',
      description: 'Structured action plans delineating responsibilities across CPAs, estate counsel, wealth managers, and insurance advisors. Clear accountability and timelines.',
      color: 'emerald'
    },
    {
      icon: Calendar,
      title: 'Compliance Management',
      description: 'Twelve-month regulatory calendar covering tax obligations, trust distributions, insurance renewals, and filing requirements. Systematic deadline oversight.',
      color: 'purple'
    },
    {
      icon: Download,
      title: 'White-Label Delivery',
      description: 'Professionally formatted documents bearing your firm credentials and visual identity. Ready for immediate client presentation.',
      color: 'orange'
    },
    {
      icon: Clock,
      title: 'Operational Efficiency',
      description: 'Reduce report preparation from days to minutes. Reallocate professional resources from documentation to advisory activities.',
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

  const reportTypes = [
    {
      title: 'Wealth Audit',
      description: 'Complete net worth analysis with asset allocation, entity structure, risk assessment, and strategic recommendations for wealth preservation.',
      pages: '6 pages'
    },
    {
      title: 'Advisory Coordination',
      description: 'Detailed action items for each professional advisor with priorities, interdependencies, timeline, and estimated engagement costs.',
      pages: '4 pages'
    },
    {
      title: 'Compliance Calendar',
      description: 'Twelve-month schedule of tax deadlines, trust distributions, insurance renewals, regulatory filings, and review obligations.',
      pages: '3 pages'
    },
    {
      title: 'Estate Analysis',
      description: 'Gap assessment for testamentary documents, trust structures, powers of attorney, beneficiary designations, and succession planning.',
      pages: '5 pages'
    },
    {
      title: 'Quarterly Review',
      description: 'Period-over-period analysis with net worth changes, portfolio performance, risk updates, and priorities for the upcoming quarter.',
      pages: '6 pages'
    }
  ];

  const metrics = [
    { value: 'Minutes', label: 'Report Generation' },
    { value: 'Hours', label: 'Time Recovered' },
    { value: 'Unlimited', label: 'Client Reports' },
    { value: 'White-Label', label: 'Firm Branding' }
  ];

  const clientSegments = [
    'Registered Investment Advisors',
    'Estate Planning Counsel',
    'Tax Advisory Practices',
    'Family Office Principals',
    'Trust Companies',
    'Private Banking Groups'
  ];

  const endorsements = [
    {
      quote: "The transition from manual preparation to systematic generation has fundamentally changed our capacity for client service. Report quality exceeds our previous internal standards.",
      author: "Managing Director",
      firm: "Multi-Family Office",
      location: "New York"
    },
    {
      quote: "Our clients recognize the elevated professionalism immediately. The comprehensive analysis supports our advisory fee structure and demonstrates measurable value.",
      author: "Principal",
      firm: "Independent RIA",
      location: "San Francisco"
    },
    {
      quote: "The risk identification methodology surfaces considerations we previously addressed reactively. This systematic approach materially reduces our professional liability exposure.",
      author: "Partner",
      firm: "Estate Planning Practice",
      location: "Chicago"
    }
  ];
</script>

<svelte:head>
  <title>WealthSync | Client Reporting for Wealth Advisors</title>
  <meta name="description" content="Institutional-quality wealth analysis and client reporting for RIAs, estate counsel, and tax advisors serving substantial private clients." />
</svelte:head>

<div class="min-h-screen bg-white">
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-200">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="/" class="flex items-center gap-3">
          <div class="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center">
            <span class="text-white font-semibold text-lg tracking-tight">W</span>
          </div>
          <span class="font-semibold text-navy-900 text-xl tracking-tight">WealthSync</span>
        </a>

        <div class="hidden lg:flex items-center gap-10">
          <a href="#methodology" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Methodology</a>
          <a href="#reports" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Reports</a>
          <a href="#engagement" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Engagement</a>
          <a href="#security" class="text-navy-600 hover:text-navy-900 font-medium transition-colors">Security</a>
        </div>

        <div class="flex items-center gap-4">
          <a href="/auth/login" class="hidden sm:block text-navy-600 hover:text-navy-900 font-medium transition-colors">
            Sign In
          </a>
          <Button href="/auth/signup" variant="primary">Request Access</Button>
        </div>
      </div>
    </div>
  </nav>

  <section class="pt-32 lg:pt-40 pb-20 lg:pb-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-4xl">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-6">
          Wealth Advisory Infrastructure
        </p>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-[1.08] tracking-tight font-display">
          Institutional reporting
          <span class="block text-navy-500">for private wealth practices</span>
        </h1>

        <p class="mt-8 text-xl lg:text-2xl text-navy-600 leading-relaxed max-w-3xl">
          Comprehensive wealth analysis and client documentation prepared to institutional standards.
          Net worth assessment, risk identification, advisory coordination, and compliance management
          delivered through your firm's professional identity.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4">
          <Button href="/auth/signup" variant="primary" size="lg">
            Schedule Consultation
            <ArrowRight class="w-5 h-5" />
          </Button>
          <Button href="#methodology" variant="secondary" size="lg">
            View Methodology
          </Button>
        </div>

        <div class="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-cream-200">
          {#each metrics as metric}
            <div>
              <p class="text-2xl lg:text-3xl font-bold text-navy-900 tracking-tight">{metric.value}</p>
              <p class="text-navy-500 mt-1">{metric.label}</p>
            </div>
          {/each}
        </div>

        <div class="mt-16 pt-8 border-t border-cream-200">
          <p class="text-sm text-navy-400 uppercase tracking-wider font-medium mb-6">Serving Leading Practices</p>
          <div class="flex flex-wrap gap-x-10 gap-y-3">
            {#each clientSegments as segment}
              <span class="text-navy-500">{segment}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-navy-900 py-20">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl">
        <p class="text-accent-400 font-medium tracking-wide text-sm mb-4">The Challenge</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-white tracking-tight font-display leading-tight">
          Professional time allocated to documentation rather than advisory
        </h2>
        <p class="mt-6 text-xl text-navy-300 leading-relaxed">
          Wealth practices dedicate substantial professional hours to report preparation,
          data consolidation, and document formatting. This administrative burden
          constrains capacity for substantive client engagement and strategic counsel.
        </p>
      </div>
    </div>
  </section>

  <section id="methodology" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Methodology</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Systematic approach to wealth documentation
        </h2>
        <p class="mt-6 text-lg text-navy-600">
          A structured process transforming client data into institutional-quality deliverables.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center relative">
          <div class="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-6">1</div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">Data Consolidation</h3>
          <p class="text-navy-600">Client information, asset schedules, entity structures, and advisory team composition entered or imported systematically.</p>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center relative">
          <div class="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-6">2</div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">Analysis Generation</h3>
          <p class="text-navy-600">Automated assessment of portfolio composition, risk exposures, coordination requirements, and compliance obligations.</p>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-cream-200 text-center relative">
          <div class="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-6">3</div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">Document Delivery</h3>
          <p class="text-navy-600">Professionally formatted reports bearing firm credentials, prepared for immediate client presentation or archival.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="reports" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Report Categories</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Five report types. Comprehensive coverage.
        </h2>
        <p class="mt-6 text-lg text-navy-600">
          Each report category addresses distinct client documentation requirements.
          Generate any combination as circumstances require.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each reportTypes as report}
          <div class="bg-white rounded-xl p-8 border border-cream-200 hover:border-cream-300 hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-navy-900">{report.title}</h3>
              <span class="text-xs font-medium text-navy-500 bg-cream-100 px-2.5 py-1 rounded">{report.pages}</span>
            </div>
            <p class="text-navy-600 leading-relaxed">{report.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Platform Capabilities</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Infrastructure for institutional-quality delivery
        </h2>
        <p class="mt-6 text-lg text-navy-600">
          Purpose-built capabilities supporting the documentation requirements of sophisticated wealth practices.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each capabilities as capability}
          {@const CapabilityIcon = capability.icon}
          {@const colors = featureColors[capability.color]}
          <div class="bg-white rounded-xl p-8 border border-cream-200 hover:border-cream-300 hover:shadow-md transition-all duration-300">
            <div class="w-12 h-12 {colors.bg} rounded-xl flex items-center justify-center mb-6">
              <CapabilityIcon class="w-6 h-6 {colors.icon}" />
            </div>
            <h3 class="text-lg font-semibold text-navy-900 mb-3">
              {capability.title}
            </h3>
            <p class="text-navy-600 leading-relaxed">
              {capability.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Practitioner Perspective</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Observations from leading practices
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each endorsements as endorsement}
          <div class="bg-cream-50 rounded-xl p-8 border border-cream-200">
            <p class="text-navy-700 leading-relaxed mb-6">"{endorsement.quote}"</p>
            <div>
              <p class="font-semibold text-navy-900">{endorsement.author}</p>
              <p class="text-navy-500 text-sm">{endorsement.firm}</p>
              <p class="text-navy-400 text-sm">{endorsement.location}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section id="security" class="py-24 lg:py-32 bg-cream-50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Security Architecture</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Enterprise-grade data protection
        </h2>
        <p class="mt-6 text-lg text-navy-600">
          Infrastructure designed to meet the security expectations of institutional clients and regulatory requirements.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">256-bit Encryption</h3>
          <p class="text-navy-600">Data encrypted at rest and in transit using AES-256 encryption standards.</p>
        </div>

        <div class="bg-white rounded-xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">SOC 2 Type II</h3>
          <p class="text-navy-600">Independently audited security controls meeting institutional compliance standards.</p>
        </div>

        <div class="bg-white rounded-xl p-8 border border-cream-200 text-center">
          <div class="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Globe class="w-7 h-7 text-navy-600" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-3">Regulatory Compliance</h3>
          <p class="text-navy-600">Architecture designed for GDPR and international data protection requirements.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="engagement" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <p class="text-accent-600 font-medium tracking-wide text-sm mb-4">Engagement Terms</p>
        <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight font-display">
          Straightforward engagement structure
        </h2>
        <p class="mt-6 text-lg text-navy-600">
          Fourteen-day evaluation period. No commitment required to assess platform capabilities.
        </p>
      </div>

      <div class="max-w-lg mx-auto">
        <div class="bg-white rounded-2xl border-2 border-navy-200 overflow-hidden">
          <div class="bg-navy-900 text-white text-center py-4">
            <p class="font-medium tracking-wide">Professional Engagement</p>
          </div>
          <div class="p-10">
            <div class="text-center mb-8">
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-5xl font-bold text-navy-900">{formatCurrency(WEALTH_ADVISOR_PLAN_PRICES.professional)}</span>
                <span class="text-navy-500">per month</span>
              </div>
            </div>

            <ul class="space-y-4 mb-10">
              {#each [
                'Unlimited client documentation',
                'All report categories included',
                'White-label firm branding',
                'Systematic risk assessment',
                'Advisory team coordination',
                'Compliance calendar generation',
                'Unlimited authorized users',
                'Priority technical support',
                'Data export capabilities',
                'Dedicated onboarding assistance'
              ] as feature}
                <li class="flex items-start gap-3">
                  <Check class="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                  <span class="text-navy-600">{feature}</span>
                </li>
              {/each}
            </ul>

            <Button href="/auth/signup" variant="primary" class="w-full" size="lg">
              Begin Evaluation
              <ArrowRight class="w-5 h-5" />
            </Button>

            <p class="mt-4 text-center text-navy-500 text-sm">
              No payment information required for evaluation period
            </p>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <p class="text-navy-600">
          Require custom integration or enterprise terms? <a href="mailto:enterprise@wealthsync.ai" class="text-accent-600 font-medium hover:underline">Contact our team</a>
        </p>
      </div>
    </div>
  </section>

  <section class="bg-navy-900 py-24 lg:py-32">
    <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
      <h2 class="text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
        Elevate your client documentation
      </h2>
      <p class="mt-6 text-xl text-navy-300">
        Institutional-quality wealth reporting infrastructure for leading practices
      </p>
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/auth/signup" variant="accent" size="lg">
          Schedule Consultation
          <ArrowRight class="w-5 h-5" />
        </Button>
        <Button href="mailto:inquiries@wealthsync.ai" variant="secondary" size="lg">
          Contact Our Team
        </Button>
      </div>
    </div>
  </section>

  <footer class="bg-navy-950 py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h4 class="text-white font-semibold mb-4">Platform</h4>
          <ul class="space-y-3">
            <li><a href="#methodology" class="text-navy-400 hover:text-white transition-colors">Methodology</a></li>
            <li><a href="#reports" class="text-navy-400 hover:text-white transition-colors">Report Categories</a></li>
            <li><a href="#engagement" class="text-navy-400 hover:text-white transition-colors">Engagement</a></li>
            <li><a href="#security" class="text-navy-400 hover:text-white transition-colors">Security</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Practice Areas</h4>
          <ul class="space-y-3">
            <li><a href="/auth/signup" class="text-navy-400 hover:text-white transition-colors">Investment Advisory</a></li>
            <li><a href="/auth/signup" class="text-navy-400 hover:text-white transition-colors">Estate Planning</a></li>
            <li><a href="/auth/signup" class="text-navy-400 hover:text-white transition-colors">Tax Advisory</a></li>
            <li><a href="/auth/signup" class="text-navy-400 hover:text-white transition-colors">Family Office</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-3">
            <li><a href="mailto:support@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Support</a></li>
            <li><a href="mailto:inquiries@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Inquiries</a></li>
            <li><a href="mailto:inquiries@wealthsync.ai" class="text-navy-400 hover:text-white transition-colors">Consultation</a></li>
            <li><a href="/auth/login" class="text-navy-400 hover:text-white transition-colors">Sign In</a></li>
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
            <span class="text-white font-semibold">W</span>
          </div>
          <span class="font-semibold text-white tracking-tight">WealthSync</span>
        </div>

        <p class="text-navy-500 text-sm">
          {new Date().getFullYear()} WealthSync Technologies, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
