<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Badge, Button, Spinner, Modal } from '$lib/components/ui';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import {
    getClientProject,
    getAgency,
    createReport,
    updateReport
  } from '$lib/firebase/services';
  import { generateReportHTML, openReportForPrint } from '$lib/utils/pdfGenerator';
  import { formatDate } from '$lib/utils/format';
  import {
    ArrowLeft,
    FileText,
    BarChart3,
    Users,
    TrendingUp,
    Calendar,
    Sparkles,
    Download,
    Eye,
    Check,
    Loader,
    AlertCircle,
    Globe,
    Target,
    ChevronRight
  } from 'lucide-svelte';
  import type { ClientProject, Report, ReportType, AgencyBranding } from '$lib/types';
  import { REPORT_TYPE_LABELS, DEFAULT_AGENCY_BRANDING } from '$lib/types';

  const projectId = $derived($page.params.id);
  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(true);
  let generating = $state(false);
  let project = $state<ClientProject | null>(null);
  let branding = $state<AgencyBranding>(DEFAULT_AGENCY_BRANDING);
  let generatedReport = $state<Partial<Report> | null>(null);
  let selectedReportType = $state<ReportType>('seo_audit');
  let error = $state<string | null>(null);

  const reportTypes: { type: ReportType; icon: any; description: string }[] = [
    {
      type: 'seo_audit',
      icon: BarChart3,
      description: 'Comprehensive SEO analysis with scores, issues, and opportunities'
    },
    {
      type: 'content_strategy',
      icon: Calendar,
      description: '90-day content calendar with topical authority building'
    },
    {
      type: 'competitor_analysis',
      icon: Users,
      description: 'Deep dive into competitor positioning and content gaps'
    },
    {
      type: 'monthly_performance',
      icon: TrendingUp,
      description: 'Monthly progress report with KPIs and next steps'
    },
    {
      type: 'quarterly_review',
      icon: FileText,
      description: 'Strategic quarterly business review with ROI analysis'
    }
  ];

  onMount(async () => {
    if (!family?.id || !projectId) return;

    try {
      const [projectData, agencyData] = await Promise.all([
        getClientProject(family.id, projectId),
        getAgency(family.id)
      ]);

      if (!projectData) {
        error = 'Client project not found';
        return;
      }

      project = projectData;
      if (agencyData?.branding) {
        branding = agencyData.branding;
      }
    } catch (err) {
      console.error('Error loading project:', err);
      error = 'Failed to load project data';
    } finally {
      loading = false;
    }
  });

  async function generateReport() {
    if (!project || !family?.id || !user?.id) return;

    generating = true;
    error = null;

    try {
      // Call the AI report generation API
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          reportType: selectedReportType,
          agencyBranding: branding
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      generatedReport = data.report;

      // Save the report to the database
      const savedReport = await createReport(family.id, {
        projectId: project.id,
        type: selectedReportType,
        title: data.report.title,
        status: 'ready',
        executiveSummary: data.report.executiveSummary,
        seoAudit: data.report.seoAudit,
        contentCalendar: data.report.contentCalendar,
        competitorAnalysis: data.report.competitorAnalysis,
        roiProjections: data.report.roiProjections,
        recommendations: data.report.recommendations,
        createdBy: user.id
      });

      generatedReport = { ...generatedReport, id: savedReport.id };

    } catch (err: any) {
      console.error('Error generating report:', err);
      error = err.message || 'Failed to generate report';
    } finally {
      generating = false;
    }
  }

  function previewReport() {
    if (!generatedReport || !project) return;

    const html = generateReportHTML(
      generatedReport as Report,
      project,
      branding
    );
    openReportForPrint(html);
  }

  async function downloadPDF() {
    if (!generatedReport || !project) return;

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: generatedReport,
          project,
          branding
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedReport.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading PDF:', err);
      error = 'Failed to download PDF';
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }

  function getScoreBg(score: number): string {
    if (score >= 70) return 'bg-emerald-50';
    if (score >= 50) return 'bg-orange-50';
    return 'bg-red-50';
  }
</script>

<svelte:head>
  <title>Generate Report - {project?.clientName || 'Client'} - AgencyForge.ai</title>
</svelte:head>

<AppShell>
  {#if loading}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <Spinner size="lg" />
        <p class="mt-4 text-cream-600">Loading project</p>
      </div>
    </div>
  {:else if error && !project}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-600" />
        </div>
        <h2 class="text-xl font-semibold text-navy-900 mb-2">Error</h2>
        <p class="text-navy-600 mb-4">{error}</p>
        <Button href="/clients" variant="primary">
          <ArrowLeft class="w-4 h-4" />
          Back to Clients
        </Button>
      </div>
    </div>
  {:else if project}
    <!-- Header -->
    <div class="mb-8">
      <Button href="/clients" variant="ghost" size="sm" class="mb-4">
        <ArrowLeft class="w-4 h-4" />
        Back to Clients
      </Button>

      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <Globe class="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p class="text-sm text-cream-600">Generate Report for</p>
              <h1 class="text-2xl lg:text-3xl font-bold text-navy-900">{project.clientName}</h1>
            </div>
          </div>
          <p class="text-navy-500">{project.clientUrl}</p>
        </div>
      </div>
    </div>

    {#if !generatedReport}
      <!-- Report Type Selection -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-navy-900 mb-4">Select Report Type</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each reportTypes as rt}
            {@const Icon = rt.icon}
            <button
              onclick={() => selectedReportType = rt.type}
              class="text-left p-5 rounded-xl border-2 transition-all duration-200 {
                selectedReportType === rt.type
                  ? 'border-accent-500 bg-accent-50'
                  : 'border-cream-200 bg-white hover:border-cream-300 hover:bg-cream-50'
              }"
            >
              <div class="flex items-start gap-4">
                <div class="p-2.5 rounded-xl {
                  selectedReportType === rt.type ? 'bg-accent-100' : 'bg-cream-100'
                }">
                  <Icon class="w-5 h-5 {
                    selectedReportType === rt.type ? 'text-accent-600' : 'text-cream-600'
                  }" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-navy-900 mb-1">
                    {REPORT_TYPE_LABELS[rt.type]}
                  </h3>
                  <p class="text-sm text-cream-600">{rt.description}</p>
                </div>
                {#if selectedReportType === rt.type}
                  <div class="p-1 bg-accent-500 rounded-full">
                    <Check class="w-4 h-4 text-white" />
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Client Info Summary -->
      <div class="bg-white rounded-2xl border border-cream-200 p-6 mb-8">
        <h3 class="font-semibold text-navy-900 mb-4">Client Information</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p class="text-xs text-cream-500 uppercase tracking-wider mb-1">Industry</p>
            <p class="font-medium text-navy-900">{project.industry}</p>
          </div>
          <div>
            <p class="text-xs text-cream-500 uppercase tracking-wider mb-1">Target Keywords</p>
            <p class="font-medium text-navy-900">{project.targetKeywords.length} keywords</p>
          </div>
          <div>
            <p class="text-xs text-cream-500 uppercase tracking-wider mb-1">Competitors</p>
            <p class="font-medium text-navy-900">{project.competitors.length} tracked</p>
          </div>
          <div>
            <p class="text-xs text-cream-500 uppercase tracking-wider mb-1">Start Date</p>
            <p class="font-medium text-navy-900">{formatDate(project.startDate, 'MMM d, yyyy')}</p>
          </div>
        </div>

        {#if project.targetKeywords.length > 0}
          <div class="mt-4 pt-4 border-t border-cream-100">
            <p class="text-xs text-cream-500 uppercase tracking-wider mb-2">Target Keywords</p>
            <div class="flex flex-wrap gap-2">
              {#each project.targetKeywords as keyword}
                <span class="px-3 py-1 bg-cream-100 text-navy-700 rounded-full text-sm">
                  {keyword}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Generate Button -->
      <div class="flex justify-center">
        <Button
          onclick={generateReport}
          variant="primary"
          size="lg"
          disabled={generating}
          class="min-w-[200px]"
        >
          {#if generating}
            <Loader class="w-5 h-5 animate-spin" />
            Generating Report...
          {:else}
            <Sparkles class="w-5 h-5" />
            Generate {REPORT_TYPE_LABELS[selectedReportType]}
          {/if}
        </Button>
      </div>

      {#if error}
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p class="text-red-700">{error}</p>
        </div>
      {/if}
    {:else}
      <!-- Generated Report Preview -->
      <div class="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <!-- Report Header -->
        <div class="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-8">
          <div class="flex items-start justify-between">
            <div>
              <Badge variant="cyan" class="mb-3">Report Ready</Badge>
              <h2 class="text-2xl font-bold mb-2">{generatedReport.title}</h2>
              <p class="text-navy-300">Generated on {formatDate(new Date(), 'MMMM d, yyyy')}</p>
            </div>
            <div class="flex gap-3">
              <Button onclick={previewReport} variant="secondary">
                <Eye class="w-4 h-4" />
                Preview
              </Button>
              <Button onclick={downloadPDF} variant="primary">
                <Download class="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="p-8 border-b border-cream-200">
          <h3 class="text-lg font-semibold text-navy-900 mb-4">Executive Summary</h3>
          <div class="prose prose-navy max-w-none">
            {#if generatedReport.executiveSummary}
              {#each generatedReport.executiveSummary.split('\n\n') as paragraph}
                <p class="text-navy-700 mb-4">{paragraph}</p>
              {/each}
            {/if}
          </div>
        </div>

        <!-- SEO Scores -->
        {#if generatedReport.seoAudit}
          <div class="p-8 border-b border-cream-200">
            <h3 class="text-lg font-semibold text-navy-900 mb-6">SEO Audit Scores</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-6 rounded-xl {getScoreBg(generatedReport.seoAudit.overallScore)}">
                <p class="text-4xl font-bold {getScoreColor(generatedReport.seoAudit.overallScore)}">
                  {generatedReport.seoAudit.overallScore}
                </p>
                <p class="text-sm text-navy-600 mt-1">Overall</p>
              </div>
              <div class="text-center p-6 rounded-xl {getScoreBg(generatedReport.seoAudit.technicalScore)}">
                <p class="text-4xl font-bold {getScoreColor(generatedReport.seoAudit.technicalScore)}">
                  {generatedReport.seoAudit.technicalScore}
                </p>
                <p class="text-sm text-navy-600 mt-1">Technical</p>
              </div>
              <div class="text-center p-6 rounded-xl {getScoreBg(generatedReport.seoAudit.contentScore)}">
                <p class="text-4xl font-bold {getScoreColor(generatedReport.seoAudit.contentScore)}">
                  {generatedReport.seoAudit.contentScore}
                </p>
                <p class="text-sm text-navy-600 mt-1">Content</p>
              </div>
              <div class="text-center p-6 rounded-xl {getScoreBg(generatedReport.seoAudit.backlinksScore)}">
                <p class="text-4xl font-bold {getScoreColor(generatedReport.seoAudit.backlinksScore)}">
                  {generatedReport.seoAudit.backlinksScore}
                </p>
                <p class="text-sm text-navy-600 mt-1">Backlinks</p>
              </div>
            </div>

            <!-- Issues -->
            {#if generatedReport.seoAudit.issues?.length}
              <div class="mt-8">
                <h4 class="font-medium text-navy-900 mb-4">Issues Found ({generatedReport.seoAudit.issues.length})</h4>
                <div class="space-y-3">
                  {#each generatedReport.seoAudit.issues.slice(0, 5) as issue}
                    <div class="p-4 bg-cream-50 rounded-xl">
                      <div class="flex items-center gap-2 mb-2">
                        <Badge variant={issue.severity === 'critical' ? 'red' : issue.severity === 'warning' ? 'orange' : 'blue'}>
                          {issue.severity}
                        </Badge>
                        <span class="font-medium text-navy-900">{issue.title}</span>
                      </div>
                      <p class="text-sm text-navy-600">{issue.description}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Content Calendar Preview -->
        {#if generatedReport.contentCalendar?.length}
          <div class="p-8 border-b border-cream-200">
            <h3 class="text-lg font-semibold text-navy-900 mb-6">Content Calendar Preview</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-cream-200">
                    <th class="text-left py-3 px-4 text-sm font-medium text-cream-600">Week</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-cream-600">Content</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-cream-600">Keyword</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-cream-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {#each generatedReport.contentCalendar.slice(0, 6) as item}
                    <tr class="border-b border-cream-100">
                      <td class="py-3 px-4 font-medium text-navy-900">Week {item.week}</td>
                      <td class="py-3 px-4 text-navy-700">{item.title}</td>
                      <td class="py-3 px-4">
                        <code class="px-2 py-1 bg-cream-100 rounded text-sm">{item.targetKeyword}</code>
                      </td>
                      <td class="py-3 px-4">
                        <Badge variant="gray">{item.contentType.replace('_', ' ')}</Badge>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}

        <!-- ROI Projections -->
        {#if generatedReport.roiProjections}
          <div class="p-8 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 class="text-lg font-semibold text-navy-900 mb-6">ROI Projections</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p class="text-sm text-cream-600 mb-1">Traffic Growth</p>
                <p class="text-2xl font-bold text-emerald-600">{generatedReport.roiProjections.trafficGrowth}</p>
              </div>
              <div>
                <p class="text-sm text-cream-600 mb-1">Est. Monthly Revenue</p>
                <p class="text-2xl font-bold text-emerald-600">{generatedReport.roiProjections.estimatedRevenue}</p>
              </div>
              <div>
                <p class="text-sm text-cream-600 mb-1">Current Traffic</p>
                <p class="text-2xl font-bold text-navy-900">{generatedReport.roiProjections.currentTraffic?.toLocaleString()}</p>
              </div>
              <div>
                <p class="text-sm text-cream-600 mb-1">Projected Traffic</p>
                <p class="text-2xl font-bold text-navy-900">{generatedReport.roiProjections.projectedTraffic?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Actions -->
        <div class="p-8 bg-cream-50 flex items-center justify-between">
          <Button href="/clients" variant="ghost">
            <ArrowLeft class="w-4 h-4" />
            Back to Clients
          </Button>
          <div class="flex gap-3">
            <Button onclick={() => generatedReport = null} variant="secondary">
              Generate Another Report
            </Button>
            <Button href="/reports/{generatedReport.id}" variant="primary">
              View Full Report
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</AppShell>
