<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Badge, Avatar, Spinner, Modal, Input, Select } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getAdvisor, updateAdvisor, deleteAdvisor, getMeetings } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, formatPhone, getDaysSince } from '$lib/utils/format';
  import {
    ArrowLeft,
    Mail,
    Phone,
    Building,
    Pencil,
    Trash2,
    Calendar,
    MessageSquare,
    FileText,
    Clock
  } from 'lucide-svelte';
  import type { Advisor, Meeting, AdvisorSpecialty } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const advisorId = $derived($page.params.id);

  let loading = $state(true);
  let advisor = $state<Advisor | null>(null);
  let meetings = $state<Meeting[]>([]);

  // Edit modal
  let editModalOpen = $state(false);
  let saving = $state(false);
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
    if (!family?.id || !advisorId) return;

    try {
      const [advisorData, meetingsData] = await Promise.all([
        getAdvisor(family.id, advisorId),
        getMeetings(family.id)
      ]);

      if (!advisorData) {
        goto('/advisors');
        return;
      }

      advisor = advisorData;
      meetings = meetingsData.filter(m => m.advisorIds.includes(advisorId));

      // Pre-fill form
      formData = {
        name: advisor.name,
        firm: advisor.firm,
        email: advisor.email,
        phone: advisor.phone,
        specialty: advisor.specialty,
        notes: advisor.notes
      };
    } catch (err) {
      showError('Failed to load advisor');
      goto('/advisors');
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    if (!family?.id || !advisor) return;

    if (!formData.name || !formData.specialty) {
      showError('Name and specialty are required');
      return;
    }

    saving = true;

    try {
      await updateAdvisor(family.id, advisor.id, formData);
      advisor = { ...advisor, ...formData };
      editModalOpen = false;
      success('Advisor updated');
    } catch (err) {
      showError('Failed to update advisor');
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!family?.id || !advisor) return;

    if (!confirm(`Are you sure you want to remove ${advisor.name}?`)) {
      return;
    }

    try {
      await deleteAdvisor(family.id, advisor.id);
      success('Advisor removed');
      goto('/advisors');
    } catch (err) {
      showError('Failed to remove advisor');
    }
  }

  async function updateLastContact() {
    if (!family?.id || !advisor) return;

    try {
      const now = new Date();
      await updateAdvisor(family.id, advisor.id, { lastContactDate: now });
      advisor = { ...advisor, lastContactDate: now };
      success('Contact date updated');
    } catch (err) {
      showError('Failed to update contact date');
    }
  }
</script>

<svelte:head>
  <title>{advisor?.name || 'Advisor'} - WealthSync</title>
</svelte:head>

<AppShell>
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else if advisor}
    <!-- Header -->
    <div class="mb-6">
      <Button href="/advisors" variant="ghost" size="sm" class="mb-4">
        <ArrowLeft class="w-4 h-4" />
        Back to Advisors
      </Button>

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <Avatar name={advisor.name} size="xl" />
          <div>
            <h1 class="text-2xl font-serif font-semibold text-navy-800">{advisor.name}</h1>
            <p class="text-cream-600">{advisor.firm}</p>
            <Badge variant={specialtyColors[advisor.specialty] as any} class="mt-2">
              {ADVISOR_SPECIALTY_LABELS[advisor.specialty]}
            </Badge>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="secondary" onclick={() => (editModalOpen = true)}>
            <Pencil class="w-4 h-4" />
            Edit
          </Button>
          <Button variant="danger" onclick={handleDelete}>
            <Trash2 class="w-4 h-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Contact Info -->
        <Card>
          {#snippet header()}
            <h2 class="font-semibold text-navy-800">Contact Information</h2>
          {/snippet}

          <div class="space-y-4">
            {#if advisor.email}
              <div class="flex items-center gap-3">
                <div class="p-2 bg-cream-100 rounded-lg">
                  <Mail class="w-5 h-5 text-cream-600" />
                </div>
                <div>
                  <p class="text-xs text-cream-500">Email</p>
                  <a href="mailto:{advisor.email}" class="text-navy-800 hover:text-navy-600">
                    {advisor.email}
                  </a>
                </div>
              </div>
            {/if}

            {#if advisor.phone}
              <div class="flex items-center gap-3">
                <div class="p-2 bg-cream-100 rounded-lg">
                  <Phone class="w-5 h-5 text-cream-600" />
                </div>
                <div>
                  <p class="text-xs text-cream-500">Phone</p>
                  <a href="tel:{advisor.phone}" class="text-navy-800 hover:text-navy-600">
                    {formatPhone(advisor.phone)}
                  </a>
                </div>
              </div>
            {/if}

            <div class="flex items-center gap-3">
              <div class="p-2 bg-cream-100 rounded-lg">
                <Building class="w-5 h-5 text-cream-600" />
              </div>
              <div>
                <p class="text-xs text-cream-500">Firm</p>
                <p class="text-navy-800">{advisor.firm}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Notes -->
        {#if advisor.notes}
          <Card>
            {#snippet header()}
              <h2 class="font-semibold text-navy-800">Notes</h2>
            {/snippet}
            <p class="text-cream-700 whitespace-pre-wrap">{advisor.notes}</p>
          </Card>
        {/if}

        <!-- Related Meetings -->
        <Card padding="none">
          {#snippet header()}
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-navy-800">Meeting History</h2>
              <Button href="/meetings?advisor={advisor.id}&new=true" variant="ghost" size="sm">
                Add Meeting
              </Button>
            </div>
          {/snippet}

          {#if meetings.length === 0}
            <div class="p-6 text-center">
              <MessageSquare class="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p class="text-cream-600">No meetings recorded</p>
            </div>
          {:else}
            <div class="divide-y divide-cream-200">
              {#each meetings.slice(0, 5) as meeting}
                <a
                  href="/meetings/{meeting.id}"
                  class="flex items-center gap-4 p-4 hover:bg-cream-100 transition-colors"
                >
                  <div class="flex-shrink-0 p-2 bg-cream-100 rounded-lg">
                    <Calendar class="w-5 h-5 text-cream-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-navy-800 truncate">{meeting.title}</p>
                    <p class="text-sm text-cream-600">{formatDate(meeting.date)}</p>
                  </div>
                </a>
              {/each}
            </div>
          {/if}
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Last Contact -->
        <Card>
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-cream-100 rounded-lg">
              <Clock class="w-5 h-5 text-cream-600" />
            </div>
            <div>
              <p class="text-xs text-cream-500">Last Contact</p>
              <p class="font-medium text-navy-800">
                {advisor.lastContactDate ? formatDate(advisor.lastContactDate) : 'Never'}
              </p>
              {#if advisor.lastContactDate}
                {@const days = getDaysSince(advisor.lastContactDate)}
                {#if days && days > 30}
                  <p class="text-xs text-orange-600 mt-1">
                    {days} days ago
                  </p>
                {/if}
              {/if}
            </div>
          </div>
          <Button variant="secondary" class="w-full" onclick={updateLastContact}>
            Mark as Contacted Today
          </Button>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <h3 class="font-semibold text-navy-800 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            {#if advisor.email}
              <Button
                href="mailto:{advisor.email}"
                variant="secondary"
                class="w-full justify-start"
              >
                <Mail class="w-4 h-4" />
                Send Email
              </Button>
            {/if}
            {#if advisor.phone}
              <Button
                href="tel:{advisor.phone}"
                variant="secondary"
                class="w-full justify-start"
              >
                <Phone class="w-4 h-4" />
                Call
              </Button>
            {/if}
            <Button
              href="/meetings?advisor={advisor.id}&new=true"
              variant="secondary"
              class="w-full justify-start"
            >
              <MessageSquare class="w-4 h-4" />
              Log Meeting
            </Button>
            <Button
              href="/documents?advisor={advisor.id}"
              variant="secondary"
              class="w-full justify-start"
            >
              <FileText class="w-4 h-4" />
              View Documents
            </Button>
          </div>
        </Card>
      </div>
    </div>
  {/if}

  <!-- Edit Modal -->
  <Modal bind:open={editModalOpen} title="Edit Advisor" size="lg">
    <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-4">
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
        <label class="label">Notes</label>
        <textarea
          bind:value={formData.notes}
          placeholder="Additional notes about this advisor..."
          rows="3"
          class="input"
        ></textarea>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (editModalOpen = false)}>Cancel</Button>
      <Button onclick={handleSave} loading={saving}>Save Changes</Button>
    {/snippet}
  </Modal>
</AppShell>
