<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Card, Spinner, Badge } from '$lib/components/ui';
  import { AppShell } from '$lib/components/layout';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import {
    Download,
    ArrowLeft,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    Calendar,
    PieChart,
    TrendingUp,
    Building
  } from 'lucide-svelte';
  import type { WealthReport, ClientProfile, WealthRisk, AdvisorAction } from '$lib/types';

  const reportId = $derived($page.params.id);

  let isLoading = $state(true);
  let report = $state<WealthReport | null>(null);
  let client = $state<ClientProfile | null>(null);
  let error = $state<string | null>(null);
  let isDownloading = $state(false);

  onMount(async () => {
    try {
      // In production, fetch from Firestore
      // For demo, we'll show a placeholder or load from URL params
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        report = data.report;
        client = data.client;
      } else {
        // Demo mode - show sample data
        client = {
          id: 'demo',
          firmId: 'firm1',
          clientName: 'Sample Client Report',
          clientType: 'family',
          status: 'active',
          estimatedNetWorth: 15000000,
          entities: [
            { id: 'e1', name: 'Family Trust', type: 'trust' },
            { id: 'e2', name: 'Holdings LLC', type: 'llc' }
          ],
          assets: [
            { id: 'a1', name: 'Investment Portfolio', category: 'investments', value: 8000000, lastUpdated: new Date() },
            { id: 'a2', name: 'Real Estate', category: 'real_estate', value: 4000000, lastUpdated: new Date() },
            { id: 'a3', name: 'Cash', category: 'cash', value: 2000000, lastUpdated: new Date() },
            { id: 'a4', name: 'Private Equity', category: 'alternatives', value: 1500000, lastUpdated: new Date() }
          ],
          liabilities: [
            { id: 'l1', name: 'Mortgage', category: 'mortgage', balance: 500000, lastUpdated: new Date() }
          ],
          advisors: [
            { id: 'ad1', name: 'John Smith', firm: 'Smith CPA', role: 'cpa' },
            { id: 'ad2', name: 'Jane Doe', firm: 'Doe Law', role: 'estate_attorney' }
          ],
          createdAt: new Date(),
          createdBy: 'user1',
          lastUpdated: new Date()
        } as unknown as ClientProfile;

        report = {
          id: reportId,
          firmId: 'firm1',
          clientId: 'demo',
          type: 'wealth_audit',
          title: 'Wealth Audit Report',
          status: 'ready',
          reportDate: new Date(),
          executiveSummary: 'This comprehensive wealth audit provides a detailed analysis of the client\'s financial position, identifying key risks and opportunities for wealth preservation and growth. The analysis reveals a well-diversified portfolio with strong liquidity, though several areas warrant attention to optimize tax efficiency and succession planning.',
          netWorthSummary: {
            totalAssets: 15500000,
            totalLiabilities: 500000,
            netWorth: 15000000,
            liquidAssets: 10000000,
            illiquidAssets: 5500000,
            assetAllocation: {
              cash: 2000000,
              investments: 8000000,
              real_estate: 4000000,
              alternatives: 1500000,
              other: 0
            },
            entityBreakdown: [
              { entityName: 'Family Trust', entityType: 'trust', netValue: 10000000 },
              { entityName: 'Holdings LLC', entityType: 'llc', netValue: 5000000 }
            ]
          },
          risks: [
            {
              id: 'r1',
              severity: 'critical',
              category: 'tax',
              title: 'Estate Tax Exposure',
              description: 'Current estate structure may result in significant estate tax liability upon transfer.',
              financialImpact: '$2.1M potential liability',
              recommendation: 'Consider establishing irrevocable life insurance trust (ILIT) and reviewing gifting strategies.',
              assignedAdvisor: 'Estate Attorney'
            },
            {
              id: 'r2',
              severity: 'warning',
              category: 'concentration',
              title: 'Portfolio Concentration Risk',
              description: 'Significant allocation to single sector may expose portfolio to elevated volatility.',
              financialImpact: '15% additional downside risk',
              recommendation: 'Diversify across sectors and consider hedging strategies.',
              assignedAdvisor: 'Wealth Manager'
            },
            {
              id: 'r3',
              severity: 'warning',
              category: 'insurance',
              title: 'Liability Coverage Gap',
              description: 'Current umbrella policy may be insufficient given net worth and asset profile.',
              financialImpact: '$5M potential exposure',
              recommendation: 'Review and increase umbrella coverage to $10M minimum.',
              assignedAdvisor: 'Insurance Advisor'
            }
          ],
          recommendations: [
            'Engage estate attorney to review and update testamentary documents',
            'Implement systematic rebalancing strategy with quarterly reviews',
            'Establish donor-advised fund for charitable giving optimization',
            'Review beneficiary designations across all accounts and policies',
            'Consider Roth conversion strategy during lower income years'
          ],
          createdAt: new Date(),
          createdBy: 'system',
          viewCount: 0
        } as unknown as WealthReport;
      }
    } catch (err) {
      console.error('Error loading report:', err);
      error = 'Failed to load report';
    } finally {
      isLoading = false;
    }
  });

  async function downloadPDF() {
    if (!report || !client) return;

    isDownloading = true;
    try {
      const response = await fetch('/api/wealth-reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          client,
          branding: {
            primaryColor: '#0f172a',
            secondaryColor: '#1e40af',
            accentColor: '#10b981',
            fontFamily: 'Georgia, serif',
            firmName: 'WealthSync Advisory',
            contactEmail: 'advisor@wealthsync.ai',
            footerText: 'Confidential - Prepared exclusively for client use'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.clientName.replace(/\s+/g, '-')}-Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      isDownloading = false;
    }
  }

  type BadgeVariant = 'navy' | 'gold' | 'emerald' | 'red' | 'gray' | 'blue' | 'purple' | 'orange' | 'cyan';

  function getSeverityColor(severity: string): BadgeVariant {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'orange';
      default: return 'blue';
    }
  }

  const assetCategoryLabels: Record<string, string> = {
    cash: 'Cash & Equivalents',
    investments: 'Investments',
    real_estate: 'Real Estate',
    alternatives: 'Alternatives',
    other: 'Other'
  };
</script>

<svelte:head>
  <title>{report?.title || 'Report'} | WealthSync</title>
</svelte:head>

<AppShell>
  {#if isLoading}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <Spinner size="lg" />
        <p class="mt-4 text-navy-600">Loading report...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <AlertTriangle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-navy-900 font-semibold">{error}</p>
        <Button href="/dashboard" variant="secondary" class="mt-4">
          <ArrowLeft class="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  {:else if report && client}
    <div class="p-6 lg:p-8 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <Button href="/wealth-clients" variant="ghost" size="sm">
            <ArrowLeft class="w-4 h-4" />
          </Button>
          <div>
            <h1 class="text-2xl lg:text-3xl font-semibold text-navy-900 tracking-tight">{report.title}</h1>
            <p class="text-navy-600 mt-1">
              {client.clientName} | {formatDate(new Date(report.reportDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <Button variant="primary" onclick={downloadPDF} disabled={isDownloading}>
          {#if isDownloading}
            <Spinner class="w-4 h-4" />
            Generating PDF...
          {:else}
            <Download class="w-5 h-5" />
            Download PDF
          {/if}
        </Button>
      </div>

      <!-- Net Worth Summary -->
      {#if report.netWorthSummary}
        <div class="bg-navy-900 text-white rounded-2xl p-8 mb-8">
          <div class="text-center mb-8">
            <p class="text-navy-400 text-sm uppercase tracking-wider mb-2">Total Net Worth</p>
            <p class="text-4xl lg:text-5xl font-bold tracking-tight">
              {formatCurrency(report.netWorthSummary.netWorth)}
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-navy-700">
            <div class="text-center">
              <p class="text-2xl font-semibold text-emerald-400">
                {formatCurrency(report.netWorthSummary.totalAssets, { compact: true })}
              </p>
              <p class="text-sm text-navy-400 mt-1">Total Assets</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-semibold text-red-400">
                {formatCurrency(report.netWorthSummary.totalLiabilities, { compact: true })}
              </p>
              <p class="text-sm text-navy-400 mt-1">Liabilities</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-semibold text-accent-400">
                {formatCurrency(report.netWorthSummary.liquidAssets, { compact: true })}
              </p>
              <p class="text-sm text-navy-400 mt-1">Liquid Assets</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-semibold text-white">
                {((report.netWorthSummary.liquidAssets / report.netWorthSummary.totalAssets) * 100).toFixed(0)}%
              </p>
              <p class="text-sm text-navy-400 mt-1">Liquidity Ratio</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Executive Summary -->
      {#if report.executiveSummary}
        <Card class="p-6 mb-8">
          <h2 class="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <FileText class="w-5 h-5 text-navy-600" />
            Executive Summary
          </h2>
          <p class="text-navy-700 leading-relaxed">{report.executiveSummary}</p>
        </Card>
      {/if}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Asset Allocation -->
        {#if report.netWorthSummary?.assetAllocation}
          <Card class="p-6">
            <h2 class="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <PieChart class="w-5 h-5 text-navy-600" />
              Asset Allocation
            </h2>
            <div class="space-y-4">
              {#each Object.entries(report.netWorthSummary.assetAllocation) as [category, value]}
                {@const percent = (value / report.netWorthSummary!.totalAssets) * 100}
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-navy-700">{assetCategoryLabels[category] || category}</span>
                    <span class="font-medium text-navy-900">{formatCurrency(value)}</span>
                  </div>
                  <div class="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-accent-500 rounded-full transition-all duration-500"
                      style="width: {percent}%"
                    ></div>
                  </div>
                  <p class="text-xs text-navy-500 mt-1">{percent.toFixed(1)}% of portfolio</p>
                </div>
              {/each}
            </div>
          </Card>
        {/if}

        <!-- Entity Structure -->
        {#if report.netWorthSummary?.entityBreakdown}
          <Card class="p-6">
            <h2 class="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Building class="w-5 h-5 text-navy-600" />
              Entity Structure
            </h2>
            <div class="space-y-3">
              {#each report.netWorthSummary.entityBreakdown as entity}
                <div class="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                  <div>
                    <p class="font-medium text-navy-900">{entity.entityName}</p>
                    <p class="text-sm text-navy-500 capitalize">{entity.entityType}</p>
                  </div>
                  <p class="font-semibold text-navy-900">{formatCurrency(entity.netValue)}</p>
                </div>
              {/each}
            </div>
          </Card>
        {/if}
      </div>

      <!-- Risk Assessment -->
      {#if report.risks && report.risks.length > 0}
        <Card class="p-6 mb-8">
          <h2 class="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-navy-600" />
            Risk Assessment
          </h2>
          <div class="space-y-4">
            {#each report.risks as risk}
              <div class="border border-cream-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class="w-1 h-full min-h-[60px] rounded-full {risk.severity === 'critical' ? 'bg-red-500' : risk.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}"></div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                      <span class="text-sm text-navy-500 capitalize">{risk.category}</span>
                    </div>
                    <h3 class="font-semibold text-navy-900 mb-1">{risk.title}</h3>
                    <p class="text-sm text-navy-600 mb-2">{risk.description}</p>
                    {#if risk.financialImpact}
                      <p class="text-sm text-red-600 font-medium mb-2">Impact: {risk.financialImpact}</p>
                    {/if}
                    <div class="bg-cream-50 p-3 rounded-lg">
                      <p class="text-sm text-navy-700"><strong>Recommendation:</strong> {risk.recommendation}</p>
                    </div>
                    {#if risk.assignedAdvisor}
                      <p class="text-xs text-navy-500 mt-2">Assigned to: {risk.assignedAdvisor}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      <!-- Recommendations -->
      {#if report.recommendations && report.recommendations.length > 0}
        <Card class="p-6">
          <h2 class="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-navy-600" />
            Strategic Recommendations
          </h2>
          <ol class="space-y-3">
            {#each report.recommendations as rec, idx}
              <li class="flex items-start gap-3 p-3 bg-cream-50 rounded-lg">
                <span class="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {idx + 1}
                </span>
                <p class="text-navy-700">{rec}</p>
              </li>
            {/each}
          </ol>
        </Card>
      {/if}
    </div>
  {/if}
</AppShell>
