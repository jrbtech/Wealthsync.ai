<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Modal, Badge, Avatar, EmptyState, Spinner, Textarea } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getMeetings, getAdvisors, createMeeting, updateMeeting, deleteMeeting, updateAdvisor, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, formatRelativeDate } from '$lib/utils/format';
  import { format } from 'date-fns';
  import {
    Plus,
    Search,
    MessageSquare,
    Calendar,
    Users,
    CheckSquare,
    Square,
    Pencil,
    Trash2,
    FileText,
    Clock
  } from 'lucide-svelte';
  import type { Meeting, Advisor, ActionItem } from '$lib/types';
  import { v4 as uuidv4 } from 'uuid';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const showNewModal = $derived($page.url.searchParams.get('new') === 'true');
  const preselectedAdvisor = $derived($page.url.searchParams.get('advisor'));

  let loading = $state(true);
  let meetings = $state<Meeting[]>([]);
  let advisors = $state<Advisor[]>([]);
  let searchQuery = $state('');
  let filteredMeetings = $state<Meeting[]>([]);

  // Modal state
  let modalOpen = $state(false);
  let editingMeeting = $state<Meeting | null>(null);
  let saving = $state(false);

  // Form state
  let formData = $state({
    title: '',
    date: '',
    advisorIds: [] as string[],
    summary: '',
    actionItems: [] as ActionItem[],
    followUpDate: ''
  });

  let newActionItem = $state('');

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [meetingsData, advisorsData] = await Promise.all([
        getMeetings(family.id),
        getAdvisors(family.id)
      ]);

      meetings = meetingsData;
      advisors = advisorsData;
      filteredMeetings = meetings;

      if (showNewModal) {
        openNewModal();
      }
    } catch (err) {
      showError('Failed to load meetings');
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    let filtered = meetings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.summary.toLowerCase().includes(query)
      );
    }

    filteredMeetings = filtered;
  });

  function openNewModal() {
    editingMeeting = null;
    formData = {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      advisorIds: preselectedAdvisor ? [preselectedAdvisor] : [],
      summary: '',
      actionItems: [],
      followUpDate: ''
    };
    modalOpen = true;
  }

  function openEditModal(meeting: Meeting) {
    editingMeeting = meeting;
    formData = {
      title: meeting.title,
      date: format(new Date(meeting.date), 'yyyy-MM-dd'),
      advisorIds: meeting.advisorIds,
      summary: meeting.summary,
      actionItems: [...meeting.actionItems],
      followUpDate: meeting.followUpDate ? format(new Date(meeting.followUpDate), 'yyyy-MM-dd') : ''
    };
    modalOpen = true;
  }

  function addActionItem() {
    if (!newActionItem.trim()) return;

    formData.actionItems = [
      ...formData.actionItems,
      {
        id: uuidv4(),
        text: newActionItem.trim(),
        completed: false
      }
    ];
    newActionItem = '';
  }

  function removeActionItem(id: string) {
    formData.actionItems = formData.actionItems.filter((item) => item.id !== id);
  }

  function toggleActionItem(id: string) {
    formData.actionItems = formData.actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
  }

  async function handleSubmit() {
    if (!family?.id || !user?.id) return;

    if (!formData.title || !formData.date) {
      showError('Title and date are required');
      return;
    }

    saving = true;

    try {
      const meetingData = {
        title: formData.title,
        date: new Date(formData.date),
        advisorIds: formData.advisorIds,
        familyMemberIds: [user.id],
        summary: formData.summary,
        actionItems: formData.actionItems,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        documentIds: []
      };

      if (editingMeeting) {
        await updateMeeting(family.id, editingMeeting.id, meetingData);

        meetings = meetings.map((m) =>
          m.id === editingMeeting!.id ? { ...m, ...meetingData } : m
        );

        success('Meeting updated');
      } else {
        const newMeeting = await createMeeting(family.id, {
          ...meetingData,
          createdBy: user.id
        });

        meetings = [newMeeting, ...meetings];

        // Update last contact date for advisors
        for (const advisorId of formData.advisorIds) {
          await updateAdvisor(family.id, advisorId, { lastContactDate: new Date(formData.date) });
        }

        await logActivity(family.id, {
          type: 'meeting_logged',
          description: `Logged meeting: ${newMeeting.title}`,
          userId: user.id
        });

        success('Meeting logged');
      }

      modalOpen = false;
    } catch (err) {
      showError('Failed to save meeting');
    } finally {
      saving = false;
    }
  }

  async function handleDelete(meeting: Meeting) {
    if (!family?.id) return;

    if (!confirm(`Delete meeting "${meeting.title}"?`)) {
      return;
    }

    try {
      await deleteMeeting(family.id, meeting.id);
      meetings = meetings.filter((m) => m.id !== meeting.id);
      success('Meeting deleted');
    } catch (err) {
      showError('Failed to delete meeting');
    }
  }

  function getAdvisorNames(advisorIds: string[]): string {
    return advisorIds
      .map((id) => advisors.find((a) => a.id === id)?.name || 'Unknown')
      .join(', ');
  }
</script>

<svelte:head>
  <title>Meetings - WealthSync.ai</title>
</svelte:head>

<AppShell title="Meeting Notes">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search meetings..."
          class="input pl-10"
        />
      </div>
      <Button onclick={openNewModal}>
        <Plus class="w-4 h-4" />
        Log Meeting
      </Button>
    </div>

    <!-- Meetings List -->
    {#if filteredMeetings.length === 0}
      {#if meetings.length === 0}
        <EmptyState
          icon={MessageSquare}
          title="No meetings logged"
          description="Log your first meeting to start building a history"
        >
          {#snippet action()}
            <Button onclick={openNewModal}>
              <Plus class="w-4 h-4" />
              Log Meeting
            </Button>
          {/snippet}
        </EmptyState>
      {:else}
        <EmptyState
          icon={Search}
          title="No meetings found"
          description="Try adjusting your search"
        />
      {/if}
    {:else}
      <div class="space-y-4">
        {#each filteredMeetings as meeting}
          {@const completedItems = meeting.actionItems.filter(i => i.completed).length}
          {@const totalItems = meeting.actionItems.length}

          <Card variant="hover" padding="none">
            <a href="/meetings/{meeting.id}" class="block p-4">
              <div class="flex items-start gap-4">
                <!-- Date -->
                <div class="flex-shrink-0 w-14 text-center">
                  <div class="text-xs text-cream-500 uppercase">
                    {formatDate(meeting.date, 'MMM')}
                  </div>
                  <div class="text-2xl font-semibold text-navy-800">
                    {formatDate(meeting.date, 'd')}
                  </div>
                  <div class="text-xs text-cream-500">
                    {formatDate(meeting.date, 'yyyy')}
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-navy-800 mb-1">{meeting.title}</h3>

                  {#if meeting.advisorIds.length > 0}
                    <div class="flex items-center gap-2 mb-2">
                      <Users class="w-4 h-4 text-cream-500" />
                      <span class="text-sm text-cream-600">
                        {getAdvisorNames(meeting.advisorIds)}
                      </span>
                    </div>
                  {/if}

                  {#if meeting.summary}
                    <p class="text-sm text-cream-700 line-clamp-2 mb-2">
                      {meeting.summary}
                    </p>
                  {/if}

                  <div class="flex items-center gap-4 text-xs text-cream-500">
                    {#if totalItems > 0}
                      <span class="flex items-center gap-1">
                        <CheckSquare class="w-3 h-3" />
                        {completedItems}/{totalItems} action items
                      </span>
                    {/if}
                    {#if meeting.followUpDate}
                      <span class="flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        Follow-up: {formatDate(meeting.followUpDate)}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1">
                  <button
                    class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                    onclick={(e) => { e.preventDefault(); openEditModal(meeting); }}
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                    onclick={(e) => { e.preventDefault(); handleDelete(meeting); }}
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </a>
          </Card>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Add/Edit Modal -->
  <Modal bind:open={modalOpen} title={editingMeeting ? 'Edit Meeting' : 'Log Meeting'} size="lg">
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
      <Input
        label="Meeting Title"
        bind:value={formData.title}
        placeholder="Quarterly Portfolio Review"
        required
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Date"
          bind:value={formData.date}
          required
        />
        <Input
          type="date"
          label="Follow-up Date (optional)"
          bind:value={formData.followUpDate}
        />
      </div>

      <div>
        <span id="advisors-label" class="label">Advisors Present</span>
        <div class="flex flex-wrap gap-2 mt-1" role="group" aria-labelledby="advisors-label">
          {#each advisors as advisor}
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm transition-colors {formData.advisorIds.includes(advisor.id)
                ? 'bg-navy-800 text-white'
                : 'bg-cream-200 text-cream-700 hover:bg-cream-300'}"
              onclick={() => {
                if (formData.advisorIds.includes(advisor.id)) {
                  formData.advisorIds = formData.advisorIds.filter(id => id !== advisor.id);
                } else {
                  formData.advisorIds = [...formData.advisorIds, advisor.id];
                }
              }}
            >
              {advisor.name}
            </button>
          {/each}
        </div>
      </div>

      <Textarea
        label="Meeting Summary"
        bind:value={formData.summary}
        placeholder="Key discussion points and outcomes..."
        rows={4}
      />

      <!-- Action Items -->
      <div>
        <span id="action-items-label" class="label">Action Items</span>
        <div class="space-y-2 mt-1" role="group" aria-labelledby="action-items-label">
          {#each formData.actionItems as item}
            <div class="flex items-center gap-2 p-2 bg-cream-100 rounded-lg">
              <button
                type="button"
                class="flex-shrink-0"
                onclick={() => toggleActionItem(item.id)}
              >
                {#if item.completed}
                  <CheckSquare class="w-5 h-5 text-emerald-600" />
                {:else}
                  <Square class="w-5 h-5 text-cream-500" />
                {/if}
              </button>
              <span class="flex-1 text-sm {item.completed ? 'line-through text-cream-500' : 'text-navy-800'}">
                {item.text}
              </span>
              <button
                type="button"
                class="p-1 rounded text-cream-500 hover:text-red-600"
                onclick={() => removeActionItem(item.id)}
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          {/each}

          <div class="flex gap-2">
            <input
              type="text"
              bind:value={newActionItem}
              placeholder="Add action item..."
              class="input flex-1"
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addActionItem())}
            />
            <Button type="button" variant="secondary" onclick={addActionItem}>
              <Plus class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      <Button onclick={handleSubmit} loading={saving}>
        {editingMeeting ? 'Save Changes' : 'Log Meeting'}
      </Button>
    {/snippet}
  </Modal>
</AppShell>
