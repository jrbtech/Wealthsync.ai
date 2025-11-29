<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Badge, Button, Spinner, Modal, Input, Select, Textarea } from '$lib/components/ui';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import {
    getClientProjects,
    createClientProject,
    updateClientProject,
    deleteClientProject,
    getReports,
    getAgencyStats
  } from '$lib/firebase/services';
  import { formatCurrency, formatDate, formatRelativeDate } from '$lib/utils/format';
  import {
    Plus,
    Globe,
    FileText,
    TrendingUp,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Trash2,
    Edit,
    BarChart3,
    Users,
    Clock,
    Sparkles,
    Building,
    Target
  } from 'lucide-svelte';
  import type { ClientProject, Report, IndustryType, ProjectStatus } from '$lib/types';
  import { INDUSTRY_LABELS, PROJECT_STATUS_LABELS } from '$lib/types';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(true);
  let projects = $state<ClientProject[]>([]);
  let recentReports = $state<Report[]>([]);
  let stats = $state({ totalClients: 0, activeClients: 0, totalReports: 0, reportsThisMonth: 0 });

  // Filters
  let searchQuery = $state('');
  let statusFilter = $state<ProjectStatus | 'all'>('all');

  // Modal state
  let showNewProjectModal = $state(false);
  let showEditProjectModal = $state(false);
  let editingProject = $state<ClientProject | null>(null);
  let saving = $state(false);

  // New project form
  let newProject = $state({
    clientName: '',
    clientUrl: '',
    industry: 'other' as IndustryType,
    status: 'active' as ProjectStatus,
    targetKeywords: '',
    competitors: '',
    notes: '',
    monthlyBudget: '',
    contractValue: ''
  });

  const filteredProjects = $derived(() => {
    return projects.filter(p => {
      const matchesSearch = searchQuery === '' ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientUrl.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  });

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [projectsData, reportsData, statsData] = await Promise.all([
        getClientProjects(family.id),
        getReports(family.id),
        getAgencyStats(family.id)
      ]);

      projects = projectsData;
      recentReports = reportsData.slice(0, 5);
      stats = statsData;
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      loading = false;
    }
  });

  async function handleCreateProject() {
    if (!family?.id || !user?.id) return;
    saving = true;

    try {
      const projectData: Omit<ClientProject, 'id' | 'createdAt'> = {
        clientName: newProject.clientName,
        clientUrl: newProject.clientUrl.startsWith('http') ? newProject.clientUrl : `https://${newProject.clientUrl}`,
        industry: newProject.industry,
        status: newProject.status,
        targetKeywords: newProject.targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
        competitors: newProject.competitors.split(',').map(c => c.trim()).filter(Boolean),
        notes: newProject.notes,
        monthlyBudget: newProject.monthlyBudget ? parseFloat(newProject.monthlyBudget) : undefined,
        contractValue: newProject.contractValue ? parseFloat(newProject.contractValue) : undefined,
        startDate: new Date(),
        createdBy: user.id
      };

      const created = await createClientProject(family.id, projectData);
      projects = [created, ...projects];
      stats.totalClients++;
      if (created.status === 'active') stats.activeClients++;

      // Reset form
      newProject = {
        clientName: '',
        clientUrl: '',
        industry: 'other',
        status: 'active',
        targetKeywords: '',
        competitors: '',
        notes: '',
        monthlyBudget: '',
        contractValue: ''
      };
      showNewProjectModal = false;
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      saving = false;
    }
  }

  function openEditModal(project: ClientProject) {
    editingProject = project;
    newProject = {
      clientName: project.clientName,
      clientUrl: project.clientUrl,
      industry: project.industry,
      status: project.status,
      targetKeywords: project.targetKeywords.join(', '),
      competitors: project.competitors.join(', '),
      notes: project.notes,
      monthlyBudget: project.monthlyBudget?.toString() || '',
      contractValue: project.contractValue?.toString() || ''
    };
    showEditProjectModal = true;
  }

  async function handleUpdateProject() {
    if (!family?.id || !editingProject) return;
    saving = true;

    try {
      const updates: Partial<ClientProject> = {
        clientName: newProject.clientName,
        clientUrl: newProject.clientUrl.startsWith('http') ? newProject.clientUrl : `https://${newProject.clientUrl}`,
        industry: newProject.industry,
        status: newProject.status,
        targetKeywords: newProject.targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
        competitors: newProject.competitors.split(',').map(c => c.trim()).filter(Boolean),
        notes: newProject.notes,
        monthlyBudget: newProject.monthlyBudget ? parseFloat(newProject.monthlyBudget) : undefined,
        contractValue: newProject.contractValue ? parseFloat(newProject.contractValue) : undefined
      };

      await updateClientProject(family.id, editingProject.id, updates);

      projects = projects.map(p =>
        p.id === editingProject!.id ? { ...p, ...updates } : p
      );

      showEditProjectModal = false;
      editingProject = null;
    } catch (err) {
      console.error('Error updating project:', err);
    } finally {
      saving = false;
    }
  }

  async function handleDeleteProject(project: ClientProject) {
    if (!family?.id || !confirm(`Delete "${project.clientName}"? This cannot be undone.`)) return;

    try {
      await deleteClientProject(family.id, project.id);
      projects = projects.filter(p => p.id !== project.id);
      stats.totalClients--;
      if (project.status === 'active') stats.activeClients--;
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  }

  function getStatusColor(status: ProjectStatus): 'emerald' | 'orange' | 'blue' | 'gray' {
    switch (status) {
      case 'active': return 'emerald';
      case 'paused': return 'orange';
      case 'completed': return 'blue';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  }

  const industryOptions = Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({ value, label }));
  const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
</script>

<svelte:head>
  <title>Clients - AgencyForge.ai</title>
</svelte:head>

<AppShell>
  {#if loading}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <Spinner size="lg" />
        <p class="mt-4 text-cream-600">Loading clients</p>
      </div>
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p class="text-sm font-medium text-accent-600 mb-1">Client Management</p>
          <h1 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">
            Your Clients
          </h1>
          <p class="text-navy-500 mt-2 text-lg">
            Manage client projects and generate reports
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Button href="/reports" variant="secondary">
            <FileText class="w-4 h-4" />
            View Reports
          </Button>
          <Button onclick={() => showNewProjectModal = true} variant="primary">
            <Plus class="w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div class="bg-white rounded-2xl border border-cream-200 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 bg-blue-50 rounded-xl">
            <Building class="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p class="text-3xl font-bold text-navy-900">{stats.totalClients}</p>
        <p class="text-sm text-navy-500 mt-1">Total Clients</p>
      </div>

      <div class="bg-white rounded-2xl border border-cream-200 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 bg-emerald-50 rounded-xl">
            <TrendingUp class="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p class="text-3xl font-bold text-navy-900">{stats.activeClients}</p>
        <p class="text-sm text-navy-500 mt-1">Active Clients</p>
      </div>

      <div class="bg-white rounded-2xl border border-cream-200 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 bg-purple-50 rounded-xl">
            <FileText class="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p class="text-3xl font-bold text-navy-900">{stats.totalReports}</p>
        <p class="text-sm text-navy-500 mt-1">Total Reports</p>
      </div>

      <div class="bg-white rounded-2xl border border-cream-200 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 bg-orange-50 rounded-xl">
            <Sparkles class="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <p class="text-3xl font-bold text-navy-900">{stats.reportsThisMonth}</p>
        <p class="text-sm text-navy-500 mt-1">Reports This Month</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
        <input
          type="text"
          placeholder="Search clients..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
      </div>
      <div class="flex items-center gap-2">
        <Filter class="w-5 h-5 text-cream-500" />
        <select
          bind:value={statusFilter}
          class="px-4 py-2.5 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <option value="all">All Status</option>
          {#each statusOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Client Grid -->
    {#if filteredProjects().length === 0}
      <div class="bg-white rounded-2xl border border-cream-200 p-12 text-center">
        <div class="w-20 h-20 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building class="w-10 h-10 text-cream-400" />
        </div>
        <h3 class="text-xl font-semibold text-navy-900 mb-2">
          {searchQuery || statusFilter !== 'all' ? 'No matching clients' : 'No clients yet'}
        </h3>
        <p class="text-navy-500 mb-6 max-w-md mx-auto">
          {searchQuery || statusFilter !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Add your first client to start generating AI-powered reports'}
        </p>
        {#if !searchQuery && statusFilter === 'all'}
          <Button onclick={() => showNewProjectModal = true} variant="primary">
            <Plus class="w-4 h-4" />
            Add Your First Client
          </Button>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each filteredProjects() as project}
          <div class="bg-white rounded-2xl border border-cream-200 p-6 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
                  <Globe class="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h3 class="font-semibold text-navy-900">{project.clientName}</h3>
                  <a
                    href={project.clientUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-accent-600 hover:underline flex items-center gap-1"
                  >
                    {project.clientUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div class="relative">
                <button
                  class="p-1.5 hover:bg-cream-100 rounded-lg transition-colors"
                  onclick={() => openEditModal(project)}
                >
                  <MoreVertical class="w-4 h-4 text-cream-500" />
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 mb-4">
              <Badge variant={getStatusColor(project.status)}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
              <Badge variant="gray">
                {INDUSTRY_LABELS[project.industry]}
              </Badge>
            </div>

            {#if project.targetKeywords.length > 0}
              <div class="mb-4">
                <p class="text-xs text-cream-500 uppercase tracking-wider mb-2">Target Keywords</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each project.targetKeywords.slice(0, 3) as keyword}
                    <span class="text-xs px-2 py-1 bg-cream-100 text-navy-700 rounded-md">
                      {keyword}
                    </span>
                  {/each}
                  {#if project.targetKeywords.length > 3}
                    <span class="text-xs px-2 py-1 bg-cream-100 text-cream-600 rounded-md">
                      +{project.targetKeywords.length - 3} more
                    </span>
                  {/if}
                </div>
              </div>
            {/if}

            <div class="flex items-center justify-between pt-4 border-t border-cream-100">
              <div class="flex items-center gap-4 text-sm text-cream-600">
                {#if project.contractValue}
                  <span class="font-medium text-navy-700">
                    {formatCurrency(project.contractValue)}
                  </span>
                {/if}
                <span class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  {formatRelativeDate(project.createdAt)}
                </span>
              </div>
              <a
                href="/clients/{project.id}/reports/new"
                class="flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                <Sparkles class="w-4 h-4" />
                Generate Report
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Recent Reports Section -->
    {#if recentReports.length > 0}
      <div class="mt-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-navy-900">Recent Reports</h2>
          <Button href="/reports" variant="ghost" size="sm">
            View All
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>

        <div class="bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-cream-50 border-b border-cream-200">
              <tr>
                <th class="text-left text-xs font-medium text-cream-600 uppercase tracking-wider px-6 py-3">
                  Report
                </th>
                <th class="text-left text-xs font-medium text-cream-600 uppercase tracking-wider px-6 py-3">
                  Client
                </th>
                <th class="text-left text-xs font-medium text-cream-600 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th class="text-left text-xs font-medium text-cream-600 uppercase tracking-wider px-6 py-3">
                  Created
                </th>
                <th class="text-right text-xs font-medium text-cream-600 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cream-100">
              {#each recentReports as report}
                {@const project = projects.find(p => p.id === report.projectId)}
                <tr class="hover:bg-cream-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-accent-50 rounded-lg">
                        <FileText class="w-4 h-4 text-accent-600" />
                      </div>
                      <span class="font-medium text-navy-900">{report.title}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-navy-600">
                    {project?.clientName || 'Unknown'}
                  </td>
                  <td class="px-6 py-4">
                    <Badge variant={report.status === 'ready' ? 'emerald' : report.status === 'generating' ? 'orange' : 'gray'}>
                      {report.status}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 text-sm text-cream-600">
                    {formatRelativeDate(report.createdAt)}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <Button href="/reports/{report.id}" variant="ghost" size="sm">
                      View
                      <ChevronRight class="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}

  <!-- New Project Modal -->
  <Modal
    bind:open={showNewProjectModal}
    onclose={() => showNewProjectModal = false}
    title="Add New Client"
  >
    <form onsubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
      <div class="space-y-4">
        <Input
          label="Client Name"
          placeholder="Acme Corporation"
          bind:value={newProject.clientName}
          required
        />

        <Input
          label="Website URL"
          placeholder="https://example.com"
          bind:value={newProject.clientUrl}
          required
        />

        <div class="grid grid-cols-2 gap-4">
          <Select
            label="Industry"
            options={industryOptions}
            bind:value={newProject.industry}
          />

          <Select
            label="Status"
            options={statusOptions}
            bind:value={newProject.status}
          />
        </div>

        <Input
          label="Target Keywords"
          placeholder="seo services, digital marketing (comma-separated)"
          bind:value={newProject.targetKeywords}
        />

        <Input
          label="Competitors"
          placeholder="competitor1.com, competitor2.com (comma-separated)"
          bind:value={newProject.competitors}
        />

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Monthly Budget"
            type="number"
            placeholder="5000"
            bind:value={newProject.monthlyBudget}
          />

          <Input
            label="Contract Value"
            type="number"
            placeholder="60000"
            bind:value={newProject.contractValue}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Additional notes about this client..."
          bind:value={newProject.notes}
          rows={3}
        />
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-cream-200">
        <Button type="button" variant="ghost" onclick={() => showNewProjectModal = false}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving || !newProject.clientName || !newProject.clientUrl}>
          {saving ? 'Creating...' : 'Create Client'}
        </Button>
      </div>
    </form>
  </Modal>

  <!-- Edit Project Modal -->
  <Modal
    bind:open={showEditProjectModal}
    onclose={() => { showEditProjectModal = false; editingProject = null; }}
    title="Edit Client"
  >
    <form onsubmit={(e) => { e.preventDefault(); handleUpdateProject(); }}>
      <div class="space-y-4">
        <Input
          label="Client Name"
          placeholder="Acme Corporation"
          bind:value={newProject.clientName}
          required
        />

        <Input
          label="Website URL"
          placeholder="https://example.com"
          bind:value={newProject.clientUrl}
          required
        />

        <div class="grid grid-cols-2 gap-4">
          <Select
            label="Industry"
            options={industryOptions}
            bind:value={newProject.industry}
          />

          <Select
            label="Status"
            options={statusOptions}
            bind:value={newProject.status}
          />
        </div>

        <Input
          label="Target Keywords"
          placeholder="seo services, digital marketing (comma-separated)"
          bind:value={newProject.targetKeywords}
        />

        <Input
          label="Competitors"
          placeholder="competitor1.com, competitor2.com (comma-separated)"
          bind:value={newProject.competitors}
        />

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Monthly Budget"
            type="number"
            placeholder="5000"
            bind:value={newProject.monthlyBudget}
          />

          <Input
            label="Contract Value"
            type="number"
            placeholder="60000"
            bind:value={newProject.contractValue}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Additional notes about this client..."
          bind:value={newProject.notes}
          rows={3}
        />
      </div>

      <div class="flex justify-between mt-6 pt-4 border-t border-cream-200">
        <Button
          type="button"
          variant="ghost"
          onclick={() => editingProject && handleDeleteProject(editingProject)}
          class="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 class="w-4 h-4" />
          Delete
        </Button>
        <div class="flex gap-3">
          <Button type="button" variant="ghost" onclick={() => { showEditProjectModal = false; editingProject = null; }}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  </Modal>
</AppShell>
