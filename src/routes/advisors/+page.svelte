<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Modal, Badge, Avatar, EmptyState, Spinner } from '$lib/components/ui';
  import { currentFamily } from '$lib/stores/auth';
  import { currentUser } from '$lib/stores/auth';
  import { getAdvisors, createAdvisor, updateAdvisor, deleteAdvisor, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, getDaysSince, formatPhone } from '$lib/utils/format';
  import { exportAdvisors } from '$lib/utils/export';
  import {
    Plus,
    Search,
    Grid,
    List,
    Users,
    Mail,
    Phone,
    Building,
    MoreVertical,
    Pencil,
    Trash2,
    AlertCircle,
    Download,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
  } from 'lucide-svelte';
  import type { Advisor, AdvisorSpecialty } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const showNewModal = $derived($page.url.searchParams.get('new') === 'true');

  let loading = $state(true);
  let advisors = $state<Advisor[]>([]);
  let filteredAdvisors = $state<Advisor[]>([]);
  let searchQuery = $state('');
  let filterSpecialty = $state('');
  let viewMode = $state<'grid' | 'list'>('grid');
  let sortBy = $state<'name' | 'firm' | 'lastContact'>('name');
  let sortDirection = $state<'asc' | 'desc'>('asc');

  // Modal state
  let modalOpen = $state(false);
  let editingAdvisor = $state<Advisor | null>(null);
  let saving = $state(false);

  // Form state
  let formData = $state({
    name: '',
    firm: '',
    email: '',
    phone: '',
    specialty: '' as AdvisorSpecialty | '',
    notes: ''
  });

  const specialtyOptions = Object.entries(ADVISOR_SPECIALTY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const specialtyColors: Record<AdvisorSpecialty, string> = {
    cpa: 'blue',
    estate_attorney: 'purple',
    wealth_manager: 'emerald',
    insurance: 'orange',
    banker: 'cyan',
    other: 'gray'
  };

  onMount(async () => {
    if (!family?.id) return;

    try {
      advisors = await getAdvisors(family.id);
      filteredAdvisors = advisors;
    } catch (err) {
      showError('Failed to load advisors');
    } finally {
      loading = false;
    }

    if (showNewModal) {
      openNewModal();
    }
  });

  $effect(() => {
    let filtered = advisors;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.firm.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
    }

    if (filterSpecialty) {
      filtered = filtered.filter((a) => a.specialty === filterSpecialty);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'firm':
          comparison = a.firm.localeCompare(b.firm);
          break;
        case 'lastContact':
          const aDate = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
          const bDate = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    filteredAdvisors = filtered;
  });

  function toggleSort(column: 'name' | 'firm' | 'lastContact') {
    if (sortBy === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortDirection = 'asc';
    }
  }

  function openNewModal() {
    editingAdvisor = null;
    formData = {
      name: '',
      firm: '',
      email: '',
      phone: '',
      specialty: '',
      notes: ''
    };
    modalOpen = true;
  }

  function openEditModal(advisor: Advisor) {
    editingAdvisor = advisor;
    formData = {
      name: advisor.name,
      firm: advisor.firm,
      email: advisor.email,
      phone: advisor.phone,
      specialty: advisor.specialty,
      notes: advisor.notes
    };
    modalOpen = true;
  }

  async function handleSubmit() {
    if (!family?.id || !user?.id) return;

    if (!formData.name || !formData.specialty) {
      showError('Name and specialty are required');
      return;
    }

    saving = true;

    try {
      if (editingAdvisor) {
        await updateAdvisor(family.id, editingAdvisor.id, formData);

        advisors = advisors.map((a) =>
          a.id === editingAdvisor!.id ? { ...a, ...formData } : a
        );

        success('Advisor updated');
      } else {
        const newAdvisor = await createAdvisor(family.id, {
          ...formData,
          specialty: formData.specialty as AdvisorSpecialty,
          lastContactDate: null,
          createdBy: user.id
        });

        advisors = [...advisors, newAdvisor];

        await logActivity(family.id, {
          type: 'advisor_added',
          description: `Added ${newAdvisor.name} as a new advisor`,
          userId: user.id
        });

        success('Advisor added');
      }

      modalOpen = false;
    } catch (err) {
      showError('Failed to save advisor');
    } finally {
      saving = false;
    }
  }

  async function handleDelete(advisor: Advisor) {
    if (!family?.id) return;

    if (!confirm(`Are you sure you want to remove ${advisor.name}?`)) {
      return;
    }

    try {
      await deleteAdvisor(family.id, advisor.id);
      advisors = advisors.filter((a) => a.id !== advisor.id);
      success('Advisor removed');
    } catch (err) {
      showError('Failed to remove advisor');
    }
  }

  function handleExportCSV() {
    exportAdvisors(advisors, ADVISOR_SPECIALTY_LABELS);
    success('Advisors exported');
  }
</script>

<svelte:head>
  <title>Advisors - WealthSync.ai</title>
</svelte:head>

<AppShell title="Advisors">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="relative flex-1 sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search advisors..."
            class="input pl-10"
          />
        </div>
        <Select
          bind:value={filterSpecialty}
          options={[{ value: '', label: 'All Specialties' }, ...specialtyOptions]}
          class="w-40"
        />
      </div>

      <div class="flex items-center gap-2">
        {#if advisors.length > 0}
          <button
            class="px-3 py-2 text-sm text-cream-700 border border-cream-300 rounded-lg hover:bg-cream-100 flex items-center gap-1.5 transition-colors"
            onclick={handleExportCSV}
            title="Export to CSV"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
        {/if}
        <div class="flex border border-cream-300 rounded-lg overflow-hidden">
          <button
            class="p-2 transition-colors {viewMode === 'grid' ? 'bg-navy-800 text-white' : 'bg-white text-cream-600 hover:bg-cream-100'}"
            onclick={() => (viewMode = 'grid')}
          >
            <Grid class="w-4 h-4" />
          </button>
          <button
            class="p-2 transition-colors {viewMode === 'list' ? 'bg-navy-800 text-white' : 'bg-white text-cream-600 hover:bg-cream-100'}"
            onclick={() => (viewMode = 'list')}
          >
            <List class="w-4 h-4" />
          </button>
        </div>
        <Button onclick={openNewModal}>
          <Plus class="w-4 h-4" />
          Add Advisor
        </Button>
      </div>
    </div>

    <!-- Content -->
    {#if filteredAdvisors.length === 0}
      {#if advisors.length === 0}
        <EmptyState
          icon={Users}
          title="No advisors yet"
          description="Add your first advisor to start coordinating your team"
        >
          {#snippet action()}
            <Button onclick={openNewModal}>
              <Plus class="w-4 h-4" />
              Add Advisor
            </Button>
          {/snippet}
        </EmptyState>
      {:else}
        <EmptyState
          icon={Search}
          title="No advisors found"
          description="Try adjusting your search or filter criteria"
        />
      {/if}
    {:else if viewMode === 'grid'}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredAdvisors as advisor}
          {@const daysSinceContact = advisor.lastContactDate ? getDaysSince(advisor.lastContactDate) : null}
          <Card variant="hover" class="relative group">
            <a href="/advisors/{advisor.id}" class="block">
              <div class="flex items-start gap-4">
                <Avatar name={advisor.name} size="lg" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-navy-800 truncate">{advisor.name}</h3>
                  <p class="text-sm text-cream-600 truncate">{advisor.firm}</p>
                  <Badge variant={specialtyColors[advisor.specialty] as any} class="mt-2">
                    {ADVISOR_SPECIALTY_LABELS[advisor.specialty]}
                  </Badge>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                {#if advisor.email}
                  <div class="flex items-center gap-2 text-sm text-cream-600">
                    <Mail class="w-4 h-4" />
                    <span class="truncate">{advisor.email}</span>
                  </div>
                {/if}
                {#if advisor.phone}
                  <div class="flex items-center gap-2 text-sm text-cream-600">
                    <Phone class="w-4 h-4" />
                    <span>{formatPhone(advisor.phone)}</span>
                  </div>
                {/if}
              </div>

              {#if daysSinceContact !== null}
                <div class="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
                  <span class="text-xs text-cream-500">Last contact</span>
                  <span class="text-sm {daysSinceContact > 30 ? 'text-orange-600' : 'text-cream-700'}">
                    {#if daysSinceContact > 30}
                      <AlertCircle class="w-3 h-3 inline mr-1" />
                    {/if}
                    {formatDate(advisor.lastContactDate)}
                  </span>
                </div>
              {/if}
            </a>

            <!-- Actions -->
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center gap-1">
                <button
                  class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                  onclick={(e) => { e.preventDefault(); openEditModal(advisor); }}
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                  onclick={(e) => { e.preventDefault(); handleDelete(advisor); }}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {:else}
      <Card padding="none">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-cream-200 bg-cream-100">
                <th class="text-left px-4 py-3 text-sm font-medium text-cream-700">
                  <button class="flex items-center gap-1 hover:text-navy-800" onclick={() => toggleSort('name')}>
                    Name
                    {#if sortBy === 'name'}
                      {#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3" />{:else}<ArrowDown class="w-3 h-3" />{/if}
                    {:else}
                      <ArrowUpDown class="w-3 h-3 opacity-50" />
                    {/if}
                  </button>
                </th>
                <th class="text-left px-4 py-3 text-sm font-medium text-cream-700">
                  <button class="flex items-center gap-1 hover:text-navy-800" onclick={() => toggleSort('firm')}>
                    Firm
                    {#if sortBy === 'firm'}
                      {#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3" />{:else}<ArrowDown class="w-3 h-3" />{/if}
                    {:else}
                      <ArrowUpDown class="w-3 h-3 opacity-50" />
                    {/if}
                  </button>
                </th>
                <th class="text-left px-4 py-3 text-sm font-medium text-cream-700">Specialty</th>
                <th class="text-left px-4 py-3 text-sm font-medium text-cream-700">Contact</th>
                <th class="text-left px-4 py-3 text-sm font-medium text-cream-700">
                  <button class="flex items-center gap-1 hover:text-navy-800" onclick={() => toggleSort('lastContact')}>
                    Last Contact
                    {#if sortBy === 'lastContact'}
                      {#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3" />{:else}<ArrowDown class="w-3 h-3" />{/if}
                    {:else}
                      <ArrowUpDown class="w-3 h-3 opacity-50" />
                    {/if}
                  </button>
                </th>
                <th class="w-20"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cream-200">
              {#each filteredAdvisors as advisor}
                {@const daysSinceContact = advisor.lastContactDate ? getDaysSince(advisor.lastContactDate) : null}
                <tr class="hover:bg-cream-50">
                  <td class="px-4 py-3">
                    <a href="/advisors/{advisor.id}" class="flex items-center gap-3">
                      <Avatar name={advisor.name} size="sm" />
                      <span class="font-medium text-navy-800">{advisor.name}</span>
                    </a>
                  </td>
                  <td class="px-4 py-3 text-cream-700">{advisor.firm}</td>
                  <td class="px-4 py-3">
                    <Badge variant={specialtyColors[advisor.specialty] as any}>
                      {ADVISOR_SPECIALTY_LABELS[advisor.specialty]}
                    </Badge>
                  </td>
                  <td class="px-4 py-3 text-sm text-cream-600">
                    {advisor.email || advisor.phone || '-'}
                  </td>
                  <td class="px-4 py-3 text-sm {daysSinceContact && daysSinceContact > 30 ? 'text-orange-600' : 'text-cream-700'}">
                    {advisor.lastContactDate ? formatDate(advisor.lastContactDate) : 'Never'}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1">
                      <button
                        class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                        onclick={() => openEditModal(advisor)}
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                        onclick={() => handleDelete(advisor)}
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    {/if}
  {/if}

  <!-- Add/Edit Modal -->
  <Modal bind:open={modalOpen} title={editingAdvisor ? 'Edit Advisor' : 'Add Advisor'} size="lg">
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          bind:value={formData.name}
          placeholder="John Smith"
          required
        />
        <Input
          label="Firm"
          bind:value={formData.firm}
          placeholder="Smith & Associates"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="email"
          label="Email"
          bind:value={formData.email}
          placeholder="john@example.com"
        />
        <Input
          type="tel"
          label="Phone"
          bind:value={formData.phone}
          placeholder="(555) 123-4567"
        />
      </div>

      <Select
        label="Specialty"
        bind:value={formData.specialty}
        options={specialtyOptions}
        placeholder="Select specialty"
        required
      />

      <div>
        <label for="advisor-notes" class="label">Notes</label>
        <textarea
          id="advisor-notes"
          bind:value={formData.notes}
          placeholder="Additional notes about this advisor..."
          rows="3"
          class="input"
        ></textarea>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      <Button onclick={handleSubmit} loading={saving}>
        {editingAdvisor ? 'Save Changes' : 'Add Advisor'}
      </Button>
    {/snippet}
  </Modal>
</AppShell>
