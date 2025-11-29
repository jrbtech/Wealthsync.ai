<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card, Input, Modal, Spinner, Badge } from '$lib/components/ui';
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import {
    Plus,
    Search,
    FileText,
    Download,
    MoreVertical,
    Users,
    DollarSign,
    Building,
    ChevronRight,
    Trash2,
    Edit,
    Eye
  } from 'lucide-svelte';
  import type { ClientProfile, WealthReport, WealthReportType, AdvisorBranding, DEFAULT_ADVISOR_BRANDING } from '$lib/types';

  // Mock data for demo
  let clients: ClientProfile[] = [
    {
      id: '1',
      firmId: 'firm1',
      clientName: 'The Smith Family',
      clientType: 'family',
      status: 'active',
      email: 'john.smith@example.com',
      estimatedNetWorth: 25000000,
      entities: [
        { id: 'e1', name: 'Smith Family Trust', type: 'trust' },
        { id: 'e2', name: 'Smith Holdings LLC', type: 'llc' },
        { id: 'e3', name: 'Personal Assets', type: 'personal' }
      ],
      assets: [
        { id: 'a1', name: 'Investment Portfolio', category: 'investments', value: 12000000, lastUpdated: new Date() },
        { id: 'a2', name: 'Primary Residence', category: 'real_estate', value: 5000000, lastUpdated: new Date() },
        { id: 'a3', name: 'Cash & Equivalents', category: 'cash', value: 3000000, lastUpdated: new Date() },
        { id: 'a4', name: 'Private Equity', category: 'alternatives', value: 4000000, lastUpdated: new Date() },
        { id: 'a5', name: 'Art Collection', category: 'other', value: 2000000, lastUpdated: new Date() }
      ],
      liabilities: [
        { id: 'l1', name: 'Mortgage', category: 'mortgage', balance: 1000000, lastUpdated: new Date() }
      ],
      advisors: [
        { id: 'ad1', name: 'Michael Chen', firm: 'Chen & Associates', role: 'cpa' },
        { id: 'ad2', name: 'Sarah Williams', firm: 'Williams Law', role: 'estate_attorney' },
        { id: 'ad3', name: 'David Park', firm: 'Park Wealth', role: 'wealth_manager' }
      ],
      createdAt: new Date('2024-01-15'),
      createdBy: 'user1',
      lastUpdated: new Date()
    },
    {
      id: '2',
      firmId: 'firm1',
      clientName: 'Robert & Maria Johnson',
      clientType: 'family',
      status: 'active',
      email: 'rjohnson@example.com',
      estimatedNetWorth: 8500000,
      entities: [
        { id: 'e4', name: 'Johnson Revocable Trust', type: 'trust' },
        { id: 'e5', name: 'Personal Assets', type: 'personal' }
      ],
      assets: [
        { id: 'a6', name: 'Retirement Accounts', category: 'investments', value: 4500000, lastUpdated: new Date() },
        { id: 'a7', name: 'Rental Properties', category: 'real_estate', value: 3000000, lastUpdated: new Date() },
        { id: 'a8', name: 'Checking & Savings', category: 'cash', value: 500000, lastUpdated: new Date() },
        { id: 'a9', name: 'Business Interest', category: 'alternatives', value: 1000000, lastUpdated: new Date() }
      ],
      liabilities: [
        { id: 'l2', name: 'Investment Property Loan', category: 'mortgage', balance: 500000, lastUpdated: new Date() }
      ],
      advisors: [
        { id: 'ad4', name: 'Lisa Thompson', firm: 'Thompson CPA', role: 'cpa' },
        { id: 'ad5', name: 'James Wilson', firm: 'Wilson Estate Law', role: 'estate_attorney' }
      ],
      createdAt: new Date('2024-03-20'),
      createdBy: 'user1',
      lastUpdated: new Date()
    },
    {
      id: '3',
      firmId: 'firm1',
      clientName: 'The Patterson Trust',
      clientType: 'trust',
      status: 'active',
      email: 'patterson.trustee@example.com',
      estimatedNetWorth: 45000000,
      entities: [
        { id: 'e6', name: 'Patterson Family Trust', type: 'trust' },
        { id: 'e7', name: 'Patterson Foundation', type: 'foundation' },
        { id: 'e8', name: 'Patterson Ventures LLC', type: 'llc' }
      ],
      assets: [
        { id: 'a10', name: 'Public Securities', category: 'investments', value: 20000000, lastUpdated: new Date() },
        { id: 'a11', name: 'Commercial Real Estate', category: 'real_estate', value: 15000000, lastUpdated: new Date() },
        { id: 'a12', name: 'Cash Reserves', category: 'cash', value: 5000000, lastUpdated: new Date() },
        { id: 'a13', name: 'Hedge Funds', category: 'alternatives', value: 7000000, lastUpdated: new Date() }
      ],
      liabilities: [
        { id: 'l3', name: 'Commercial Loans', category: 'loan', balance: 2000000, lastUpdated: new Date() }
      ],
      advisors: [
        { id: 'ad6', name: 'Katherine Moore', firm: 'Moore & Partners', role: 'cpa' },
        { id: 'ad7', name: 'Richard Davis', firm: 'Davis Estate Law', role: 'estate_attorney' },
        { id: 'ad8', name: 'Elizabeth Brown', firm: 'Brown Wealth Advisors', role: 'wealth_manager' },
        { id: 'ad9', name: 'Thomas Anderson', firm: 'Anderson Insurance', role: 'insurance' }
      ],
      createdAt: new Date('2023-11-01'),
      createdBy: 'user1',
      lastUpdated: new Date()
    }
  ];

  let recentReports: WealthReport[] = [];
  let searchQuery = '';
  let isLoading = false;
  let showNewClientModal = false;
  let showGenerateReportModal = false;
  let selectedClient: ClientProfile | null = null;
  let selectedReportType: WealthReportType = 'wealth_audit';
  let isGenerating = false;

  const reportTypes: { value: WealthReportType; label: string; description: string }[] = [
    { value: 'wealth_audit', label: 'Comprehensive Wealth Analysis', description: 'Net worth assessment with risk evaluation and strategic recommendations' },
    { value: 'advisor_coordination', label: 'Advisory Team Coordination', description: 'Actionable directives for each professional advisor' },
    { value: 'compliance_calendar', label: 'Regulatory Compliance Calendar', description: 'Twelve-month deadline and filing schedule' },
    { value: 'estate_summary', label: 'Estate Planning Assessment', description: 'Succession planning gap analysis and recommendations' },
    { value: 'quarterly_review', label: 'Quarterly Performance Review', description: 'Period-over-period analysis with forward guidance' }
  ];

  $: filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: totalAUM = clients.reduce((sum, c) => sum + c.estimatedNetWorth, 0);

  function openGenerateReport(client: ClientProfile) {
    selectedClient = client;
    showGenerateReportModal = true;
  }

  async function generateReport() {
    if (!selectedClient) return;

    isGenerating = true;

    try {
      // Call the API
      const response = await fetch('/api/wealth-reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          reportType: selectedReportType,
          advisorBranding: {
            primaryColor: '#0f172a',
            secondaryColor: '#1e40af',
            accentColor: '#10b981',
            fontFamily: 'Georgia, serif',
            firmName: 'Your Wealth Advisory',
            contactEmail: 'advisor@example.com',
            footerText: 'Confidential - Prepared exclusively for client use'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();

      // Now generate PDF
      const pdfResponse = await fetch('/api/wealth-reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: data.report,
          client: selectedClient,
          branding: {
            primaryColor: '#0f172a',
            secondaryColor: '#1e40af',
            accentColor: '#10b981',
            fontFamily: 'Georgia, serif',
            firmName: 'Your Wealth Advisory',
            contactEmail: 'advisor@example.com',
            footerText: 'Confidential - Prepared exclusively for client use'
          }
        })
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedClient.clientName.replace(/\s+/g, '-')}-${selectedReportType}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showGenerateReportModal = false;
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      isGenerating = false;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'emerald';
      case 'prospect': return 'blue';
      case 'inactive': return 'slate';
      default: return 'slate';
    }
  }
</script>

<svelte:head>
  <title>Client Portfolio | WealthSync</title>
</svelte:head>

<AppShell>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-semibold text-navy-900 tracking-tight">Client Portfolio</h1>
        <p class="text-navy-600 mt-1">Consolidated wealth reporting and analysis</p>
      </div>
      <Button variant="primary" on:click={() => showNewClientModal = true}>
        <Plus class="w-5 h-5" />
        New Client
      </Button>
    </div>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card class="p-6 border-l-4 border-l-navy-800">
        <div>
          <p class="text-sm font-medium text-navy-500 uppercase tracking-wide">Active Relationships</p>
          <p class="text-2xl font-semibold text-navy-900 mt-1">{clients.length}</p>
        </div>
      </Card>

      <Card class="p-6 border-l-4 border-l-navy-800">
        <div>
          <p class="text-sm font-medium text-navy-500 uppercase tracking-wide">Assets Under Advisory</p>
          <p class="text-2xl font-semibold text-navy-900 mt-1">{formatCurrency(totalAUM, true)}</p>
        </div>
      </Card>

      <Card class="p-6 border-l-4 border-l-navy-800">
        <div>
          <p class="text-sm font-medium text-navy-500 uppercase tracking-wide">Reports Delivered</p>
          <p class="text-2xl font-semibold text-navy-900 mt-1">{recentReports.length}</p>
        </div>
      </Card>

      <Card class="p-6 border-l-4 border-l-navy-800">
        <div>
          <p class="text-sm font-medium text-navy-500 uppercase tracking-wide">Legal Entities</p>
          <p class="text-2xl font-semibold text-navy-900 mt-1">{clients.reduce((sum, c) => sum + c.entities.length, 0)}</p>
        </div>
      </Card>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
        <input
          type="text"
          placeholder="Search by name or email"
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white"
        />
      </div>
    </div>

    <!-- Client List -->
    <div class="space-y-3">
      {#each filteredClients as client}
        <Card class="p-6 hover:shadow-md transition-shadow border border-cream-100">
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h3 class="text-lg font-semibold text-navy-900 tracking-tight">{client.clientName}</h3>
                <Badge variant={getStatusColor(client.status)}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <p class="text-navy-500 text-xs uppercase tracking-wide">Net Worth</p>
                  <p class="font-semibold text-navy-900 mt-0.5">{formatCurrency(client.estimatedNetWorth)}</p>
                </div>
                <div>
                  <p class="text-navy-500 text-xs uppercase tracking-wide">Entities</p>
                  <p class="font-semibold text-navy-900 mt-0.5">{client.entities.length}</p>
                </div>
                <div>
                  <p class="text-navy-500 text-xs uppercase tracking-wide">Asset Classes</p>
                  <p class="font-semibold text-navy-900 mt-0.5">{client.assets.length}</p>
                </div>
                <div>
                  <p class="text-navy-500 text-xs uppercase tracking-wide">Advisors</p>
                  <p class="font-semibold text-navy-900 mt-0.5">{client.advisors.length}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button variant="secondary" size="sm" href="/wealth-clients/{client.id}">
                <Eye class="w-4 h-4" />
                Details
              </Button>
              <Button variant="primary" size="sm" on:click={() => openGenerateReport(client)}>
                <FileText class="w-4 h-4" />
                New Report
              </Button>
            </div>
          </div>
        </Card>
      {/each}

      {#if filteredClients.length === 0}
        <Card class="p-12 text-center border border-cream-100">
          <div class="w-14 h-14 bg-navy-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users class="w-7 h-7 text-navy-400" />
          </div>
          <h3 class="text-lg font-semibold text-navy-900 mb-2">No Clients Found</h3>
          <p class="text-navy-600 mb-6 max-w-sm mx-auto">
            {searchQuery ? 'No results match your search criteria' : 'Begin by adding your first client relationship'}
          </p>
          {#if !searchQuery}
            <Button variant="primary" on:click={() => showNewClientModal = true}>
              <Plus class="w-5 h-5" />
              New Client
            </Button>
          {/if}
        </Card>
      {/if}
    </div>
  </div>

  <!-- Generate Report Modal -->
  <Modal bind:open={showGenerateReportModal} title="Prepare Report">
    {#if selectedClient}
      <div class="space-y-6">
        <div class="bg-navy-50 rounded-lg p-4 border border-navy-100">
          <p class="text-xs text-navy-500 uppercase tracking-wide">Selected Client</p>
          <p class="font-semibold text-navy-900 mt-1">{selectedClient.clientName}</p>
          <p class="text-sm text-navy-600 mt-0.5">{formatCurrency(selectedClient.estimatedNetWorth)} estimated net worth</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-navy-700 mb-3">Select Report Type</label>
          <div class="space-y-2">
            {#each reportTypes as type}
              <label class="flex items-start gap-3 p-4 border border-cream-200 rounded-lg cursor-pointer hover:border-navy-300 transition-colors {selectedReportType === type.value ? 'border-navy-600 bg-navy-50' : ''}">
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  bind:group={selectedReportType}
                  class="mt-0.5"
                />
                <div>
                  <p class="font-medium text-navy-900">{type.label}</p>
                  <p class="text-sm text-navy-500 mt-0.5">{type.description}</p>
                </div>
              </label>
            {/each}
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-cream-100">
          <Button variant="secondary" class="flex-1" on:click={() => showGenerateReportModal = false}>
            Cancel
          </Button>
          <Button
            variant="primary"
            class="flex-1"
            on:click={generateReport}
            disabled={isGenerating}
          >
            {#if isGenerating}
              <Spinner class="w-5 h-5" />
              Preparing Report
            {:else}
              <FileText class="w-5 h-5" />
              Generate Report
            {/if}
          </Button>
        </div>
      </div>
    {/if}
  </Modal>

  <!-- Add Client Modal (simplified for demo) -->
  <Modal bind:open={showNewClientModal} title="New Client Relationship">
    <div class="space-y-4">
      <p class="text-navy-600">
        Client intake functionality is available in the full platform. Sample client profiles have been provided for demonstration purposes.
      </p>
      <Button variant="secondary" class="w-full" on:click={() => showNewClientModal = false}>
        Close
      </Button>
    </div>
  </Modal>
</AppShell>
