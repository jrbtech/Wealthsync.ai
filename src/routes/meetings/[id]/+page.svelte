<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Badge, Avatar, Spinner, Textarea, Modal } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getMeeting, getAdvisors, updateMeeting, deleteMeeting, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate } from '$lib/utils/format';
  import { format } from 'date-fns';
  import {
    ArrowLeft,
    Calendar,
    Users,
    CheckSquare,
    Square,
    Pencil,
    Trash2,
    Clock,
    FileText,
    Plus,
    Save
  } from 'lucide-svelte';
  import type { Meeting, Advisor, ActionItem } from '$lib/types';
  import { v4 as uuidv4 } from 'uuid';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const meetingId = $derived($page.params.id);

  let loading = $state(true);
  let meeting = $state<Meeting | null>(null);
  let advisors = $state<Advisor[]>([]);
  let editing = $state(false);
  let saving = $state(false);
  let deleteModalOpen = $state(false);

  // Edit form state
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
    if (!family?.id || !meetingId) return;

    try {
      const [meetingData, advisorsData] = await Promise.all([
        getMeeting(family.id, meetingId),
        getAdvisors(family.id)
      ]);

      if (!meetingData) {
        goto('/meetings');
        return;
      }

      meeting = meetingData;
      advisors = advisorsData;
      initFormData(meetingData);
    } catch (err) {
      showError('Failed to load meeting');
      goto('/meetings');
    } finally {
      loading = false;
    }
  });

  function initFormData(m: Meeting) {
    formData = {
      title: m.title,
      date: format(new Date(m.date), 'yyyy-MM-dd'),
      advisorIds: [...m.advisorIds],
      summary: m.summary,
      actionItems: m.actionItems.map(item => ({ ...item })),
      followUpDate: m.followUpDate ? format(new Date(m.followUpDate), 'yyyy-MM-dd') : ''
    };
  }

  function cancelEditing() {
    if (meeting) {
      initFormData(meeting);
    }
    editing = false;
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
    formData.actionItems = formData.actionItems.filter(item => item.id !== id);
  }

  function toggleActionItem(id: string) {
    formData.actionItems = formData.actionItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
  }

  async function handleSave() {
    if (!family?.id || !meeting) return;

    if (!formData.title || !formData.date) {
      showError('Title and date are required');
      return;
    }

    saving = true;

    try {
      const updateData = {
        title: formData.title,
        date: new Date(formData.date),
        advisorIds: formData.advisorIds,
        summary: formData.summary,
        actionItems: formData.actionItems,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined
      };

      await updateMeeting(family.id, meeting.id, updateData);

      meeting = {
        ...meeting,
        ...updateData
      };

      editing = false;
      success('Meeting updated');
    } catch (err) {
      showError('Failed to update meeting');
    } finally {
      saving = false;
    }
  }

  async function handleToggleActionItemSave(itemId: string) {
    if (!family?.id || !meeting) return;

    const updatedItems = meeting.actionItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      await updateMeeting(family.id, meeting.id, { actionItems: updatedItems });
      meeting = { ...meeting, actionItems: updatedItems };
    } catch (err) {
      showError('Failed to update action item');
    }
  }

  async function handleDelete() {
    if (!family?.id || !meeting) return;

    try {
      await deleteMeeting(family.id, meeting.id);
      success('Meeting deleted');
      goto('/meetings');
    } catch (err) {
      showError('Failed to delete meeting');
    }
  }

  function getAdvisorById(id: string): Advisor | undefined {
    return advisors.find(a => a.id === id);
  }

  const completedItems = $derived(meeting?.actionItems.filter(i => i.completed).length ?? 0);
  const totalItems = $derived(meeting?.actionItems.length ?? 0);
</script>

<svelte:head>
  <title>{meeting?.title || 'Meeting'} - WealthSync.ai</title>
</svelte:head>

<AppShell>
  {#snippet headerLeft()}
    <Button href="/meetings" variant="ghost" size="sm">
      <ArrowLeft class="w-4 h-4" />
      Back
    </Button>
  {/snippet}

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else if meeting}
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            {#if editing}
              <Input
                bind:value={formData.title}
                placeholder="Meeting title"
                class="text-xl font-display font-semibold"
              />
            {:else}
              <h1 class="text-2xl font-display font-semibold text-navy-800">
                {meeting.title}
              </h1>
            {/if}

            <div class="flex items-center gap-4 mt-2 text-sm text-cream-600">
              <span class="flex items-center gap-1">
                <Calendar class="w-4 h-4" />
                {formatDate(meeting.date, 'EEEE, MMMM d, yyyy')}
              </span>
              {#if meeting.followUpDate}
                <span class="flex items-center gap-1">
                  <Clock class="w-4 h-4" />
                  Follow-up: {formatDate(meeting.followUpDate)}
                </span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2">
            {#if editing}
              <Button variant="secondary" onclick={cancelEditing}>Cancel</Button>
              <Button onclick={handleSave} loading={saving}>
                <Save class="w-4 h-4" />
                Save
              </Button>
            {:else}
              <Button variant="secondary" onclick={() => (editing = true)}>
                <Pencil class="w-4 h-4" />
                Edit
              </Button>
              <Button variant="ghost" onclick={() => (deleteModalOpen = true)}>
                <Trash2 class="w-4 h-4 text-red-600" />
              </Button>
            {/if}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Summary -->
          <Card>
            <h3 class="font-semibold text-navy-800 mb-3">Meeting Summary</h3>
            {#if editing}
              <Textarea
                bind:value={formData.summary}
                placeholder="Key discussion points and outcomes..."
                rows={6}
              />
            {:else}
              {#if meeting.summary}
                <p class="text-cream-700 whitespace-pre-wrap">{meeting.summary}</p>
              {:else}
                <p class="text-cream-500 italic">No summary provided</p>
              {/if}
            {/if}
          </Card>

          <!-- Action Items -->
          <Card>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-navy-800">Action Items</h3>
              {#if totalItems > 0}
                <Badge variant={completedItems === totalItems ? 'emerald' : 'navy'}>
                  {completedItems}/{totalItems} completed
                </Badge>
              {/if}
            </div>

            {#if editing}
              <div class="space-y-2">
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

                <div class="flex gap-2 mt-3">
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
            {:else}
              {#if meeting.actionItems.length === 0}
                <p class="text-cream-500 italic">No action items</p>
              {:else}
                <div class="space-y-2">
                  {#each meeting.actionItems as item}
                    <button
                      class="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-cream-100 transition-colors"
                      onclick={() => handleToggleActionItemSave(item.id)}
                    >
                      {#if item.completed}
                        <CheckSquare class="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      {:else}
                        <Square class="w-5 h-5 text-cream-400 flex-shrink-0" />
                      {/if}
                      <span class="{item.completed ? 'line-through text-cream-500' : 'text-navy-800'}">
                        {item.text}
                      </span>
                    </button>
                  {/each}
                </div>
              {/if}
            {/if}
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Date & Follow-up -->
          {#if editing}
            <Card>
              <h3 class="font-semibold text-navy-800 mb-3">Details</h3>
              <div class="space-y-4">
                <Input
                  type="date"
                  label="Meeting Date"
                  bind:value={formData.date}
                />
                <Input
                  type="date"
                  label="Follow-up Date"
                  bind:value={formData.followUpDate}
                />
              </div>
            </Card>
          {/if}

          <!-- Advisors -->
          <Card>
            <h3 class="font-semibold text-navy-800 mb-3">Advisors Present</h3>
            {#if editing}
              <div class="flex flex-wrap gap-2">
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
            {:else}
              {#if meeting.advisorIds.length === 0}
                <p class="text-cream-500 italic">No advisors recorded</p>
              {:else}
                <div class="space-y-2">
                  {#each meeting.advisorIds as advisorId}
                    {@const advisor = getAdvisorById(advisorId)}
                    {#if advisor}
                      <a
                        href="/advisors/{advisor.id}"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100 transition-colors"
                      >
                        <Avatar name={advisor.name} size="sm" />
                        <div class="min-w-0">
                          <p class="font-medium text-navy-800 truncate">{advisor.name}</p>
                          <p class="text-xs text-cream-600 truncate">{advisor.firm}</p>
                        </div>
                      </a>
                    {/if}
                  {/each}
                </div>
              {/if}
            {/if}
          </Card>

          <!-- Documents -->
          <Card>
            <h3 class="font-semibold text-navy-800 mb-3">Related Documents</h3>
            {#if meeting.documentIds.length === 0}
              <p class="text-cream-500 italic text-sm">No documents attached</p>
              <Button href="/documents" variant="secondary" size="sm" class="mt-3">
                <FileText class="w-4 h-4" />
                Browse Documents
              </Button>
            {:else}
              <p class="text-cream-600 text-sm">{meeting.documentIds.length} document(s) attached</p>
            {/if}
          </Card>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  <Modal bind:open={deleteModalOpen} title="Delete Meeting">
    <p class="text-cream-700">
      Are you sure you want to delete "{meeting?.title}"? This action cannot be undone.
    </p>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (deleteModalOpen = false)}>Cancel</Button>
      <Button variant="primary" onclick={handleDelete} class="bg-red-600 hover:bg-red-700">
        Delete Meeting
      </Button>
    {/snippet}
  </Modal>
</AppShell>
