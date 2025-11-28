<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Modal, Badge, EmptyState, Spinner } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getDeadlines, getAdvisors, createDeadline, updateDeadline, deleteDeadline, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, getDaysUntil } from '$lib/utils/format';
  import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek
  } from 'date-fns';
  import {
    Plus,
    Calendar as CalendarIcon,
    List,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Pencil,
    Trash2
  } from 'lucide-svelte';
  import type { Deadline, DeadlineCategory, DeadlineStatus, RecurrenceType, Advisor } from '$lib/types';
  import { DEADLINE_CATEGORY_LABELS, RECURRENCE_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const showNewModal = $derived($page.url.searchParams.get('new') === 'true');

  let loading = $state(true);
  let deadlines = $state<Deadline[]>([]);
  let advisors = $state<Advisor[]>([]);
  let viewMode = $state<'calendar' | 'list'>('list');
  let currentMonth = $state(new Date());
  let filterStatus = $state('');
  let filterCategory = $state('');

  // Modal state
  let modalOpen = $state(false);
  let editingDeadline = $state<Deadline | null>(null);
  let saving = $state(false);

  // Form state
  let formData = $state({
    title: '',
    dueDate: '',
    category: '' as DeadlineCategory | '',
    recurrence: 'one_time' as RecurrenceType,
    advisorId: '',
    notes: '',
    reminders: [7, 3, 1]
  });

  const categoryOptions = Object.entries(DEADLINE_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const recurrenceOptions = Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'due_soon', label: 'Due Soon' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' }
  ];

  const categoryColors: Record<DeadlineCategory, string> = {
    tax: 'blue',
    legal: 'purple',
    insurance: 'orange',
    trust: 'emerald',
    investment: 'cyan',
    other: 'gray'
  };

  // Calendar calculations
  const calendarDays = $derived(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  });

  const filteredDeadlines = $derived(() => {
    let filtered = deadlines;

    if (filterStatus) {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    if (filterCategory) {
      filtered = filtered.filter((d) => d.category === filterCategory);
    }

    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  function getDeadlinesForDay(day: Date): Deadline[] {
    return deadlines.filter((d) => isSameDay(new Date(d.dueDate), day));
  }

  function getDeadlineStatusInfo(deadline: Deadline): { color: string; label: string; icon: any } {
    if (deadline.status === 'completed') {
      return { color: 'emerald', label: 'Completed', icon: CheckCircle };
    }

    const days = getDaysUntil(deadline.dueDate);
    if (days === null) return { color: 'gray', label: 'Unknown', icon: Clock };
    if (days < 0) return { color: 'red', label: 'Overdue', icon: AlertCircle };
    if (days <= 7) return { color: 'orange', label: 'Due Soon', icon: Clock };
    return { color: 'navy', label: 'Upcoming', icon: Clock };
  }

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [deadlinesData, advisorsData] = await Promise.all([
        getDeadlines(family.id),
        getAdvisors(family.id)
      ]);

      deadlines = deadlinesData;
      advisors = advisorsData;
    } catch (err) {
      showError('Failed to load deadlines');
    } finally {
      loading = false;
    }

    if (showNewModal) {
      openNewModal();
    }
  });

  function openNewModal() {
    editingDeadline = null;
    formData = {
      title: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      recurrence: 'one_time',
      advisorId: '',
      notes: '',
      reminders: [7, 3, 1]
    };
    modalOpen = true;
  }

  function openEditModal(deadline: Deadline) {
    editingDeadline = deadline;
    formData = {
      title: deadline.title,
      dueDate: format(new Date(deadline.dueDate), 'yyyy-MM-dd'),
      category: deadline.category,
      recurrence: deadline.recurrence,
      advisorId: deadline.advisorId || '',
      notes: deadline.notes,
      reminders: deadline.reminders
    };
    modalOpen = true;
  }

  async function handleSubmit() {
    if (!family?.id || !user?.id) return;

    if (!formData.title || !formData.dueDate || !formData.category) {
      showError('Title, due date, and category are required');
      return;
    }

    saving = true;

    try {
      const deadlineData = {
        title: formData.title,
        dueDate: new Date(formData.dueDate),
        category: formData.category as DeadlineCategory,
        recurrence: formData.recurrence,
        advisorId: formData.advisorId || undefined,
        notes: formData.notes,
        reminders: formData.reminders,
        status: 'upcoming' as DeadlineStatus
      };

      if (editingDeadline) {
        await updateDeadline(family.id, editingDeadline.id, deadlineData);

        deadlines = deadlines.map((d) =>
          d.id === editingDeadline!.id ? { ...d, ...deadlineData } : d
        );

        success('Deadline updated');
      } else {
        const newDeadline = await createDeadline(family.id, {
          ...deadlineData,
          createdBy: user.id
        });

        deadlines = [...deadlines, newDeadline];

        await logActivity(family.id, {
          type: 'deadline_created',
          description: `Created deadline: ${newDeadline.title}`,
          userId: user.id
        });

        success('Deadline created');
      }

      modalOpen = false;
    } catch (err) {
      showError('Failed to save deadline');
    } finally {
      saving = false;
    }
  }

  async function toggleComplete(deadline: Deadline) {
    if (!family?.id || !user?.id) return;

    const newStatus: DeadlineStatus = deadline.status === 'completed' ? 'upcoming' : 'completed';

    try {
      await updateDeadline(family.id, deadline.id, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : undefined
      });

      deadlines = deadlines.map((d) =>
        d.id === deadline.id
          ? { ...d, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined }
          : d
      );

      if (newStatus === 'completed') {
        await logActivity(family.id, {
          type: 'deadline_completed',
          description: `Completed deadline: ${deadline.title}`,
          userId: user.id
        });
      }

      success(newStatus === 'completed' ? 'Marked as complete' : 'Marked as incomplete');
    } catch (err) {
      showError('Failed to update deadline');
    }
  }

  async function handleDelete(deadline: Deadline) {
    if (!family?.id) return;

    if (!confirm(`Are you sure you want to delete "${deadline.title}"?`)) {
      return;
    }

    try {
      await deleteDeadline(family.id, deadline.id);
      deadlines = deadlines.filter((d) => d.id !== deadline.id);
      success('Deadline deleted');
    } catch (err) {
      showError('Failed to delete deadline');
    }
  }
</script>

<svelte:head>
  <title>Deadlines - WealthSync</title>
</svelte:head>

<AppShell title="Deadlines">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <Select
          bind:value={filterStatus}
          options={statusOptions}
          class="w-40"
        />
        <Select
          bind:value={filterCategory}
          options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
          class="w-40"
        />
      </div>

      <div class="flex items-center gap-2">
        <div class="flex border border-cream-300 rounded-lg overflow-hidden">
          <button
            class="p-2 transition-colors {viewMode === 'list' ? 'bg-navy-800 text-white' : 'bg-white text-cream-600 hover:bg-cream-100'}"
            onclick={() => (viewMode = 'list')}
          >
            <List class="w-4 h-4" />
          </button>
          <button
            class="p-2 transition-colors {viewMode === 'calendar' ? 'bg-navy-800 text-white' : 'bg-white text-cream-600 hover:bg-cream-100'}"
            onclick={() => (viewMode = 'calendar')}
          >
            <CalendarIcon class="w-4 h-4" />
          </button>
        </div>
        <Button onclick={openNewModal}>
          <Plus class="w-4 h-4" />
          Add Deadline
        </Button>
      </div>
    </div>

    <!-- Content -->
    {#if viewMode === 'calendar'}
      <Card>
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-serif font-semibold text-navy-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div class="flex items-center gap-2">
            <button
              class="p-2 rounded-lg hover:bg-cream-200 transition-colors"
              onclick={() => (currentMonth = subMonths(currentMonth, 1))}
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-cream-200 transition-colors"
              onclick={() => (currentMonth = new Date())}
            >
              Today
            </button>
            <button
              class="p-2 rounded-lg hover:bg-cream-200 transition-colors"
              onclick={() => (currentMonth = addMonths(currentMonth, 1))}
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-px bg-cream-300 rounded-lg overflow-hidden">
          <!-- Day Headers -->
          {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
            <div class="bg-cream-100 px-2 py-3 text-center text-sm font-medium text-cream-600">
              {day}
            </div>
          {/each}

          <!-- Days -->
          {#each calendarDays() as day}
            {@const dayDeadlines = getDeadlinesForDay(day)}
            <div
              class="bg-white min-h-[100px] p-2 {!isSameMonth(day, currentMonth) ? 'bg-cream-50' : ''}"
            >
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm {isSameDay(day, new Date())
                  ? 'bg-navy-800 text-white'
                  : !isSameMonth(day, currentMonth)
                    ? 'text-cream-400'
                    : 'text-navy-800'}"
              >
                {format(day, 'd')}
              </span>

              <div class="mt-1 space-y-1">
                {#each dayDeadlines.slice(0, 3) as deadline}
                  {@const status = getDeadlineStatusInfo(deadline)}
                  <button
                    class="w-full text-left px-1.5 py-0.5 rounded text-xs truncate transition-colors
                      {deadline.status === 'completed'
                        ? 'bg-cream-200 text-cream-600 line-through'
                        : `bg-${status.color}-100 text-${status.color}-800 hover:bg-${status.color}-200`}"
                    onclick={() => openEditModal(deadline)}
                  >
                    {deadline.title}
                  </button>
                {/each}
                {#if dayDeadlines.length > 3}
                  <p class="text-xs text-cream-500 px-1.5">
                    +{dayDeadlines.length - 3} more
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {:else}
      <!-- List View -->
      {#if filteredDeadlines().length === 0}
        {#if deadlines.length === 0}
          <EmptyState
            icon={CalendarIcon}
            title="No deadlines yet"
            description="Add your first deadline to start tracking important dates"
          >
            {#snippet action()}
              <Button onclick={openNewModal}>
                <Plus class="w-4 h-4" />
                Add Deadline
              </Button>
            {/snippet}
          </EmptyState>
        {:else}
          <EmptyState
            icon={CalendarIcon}
            title="No deadlines found"
            description="Try adjusting your filters"
          />
        {/if}
      {:else}
        <div class="space-y-3">
          {#each filteredDeadlines() as deadline}
            {@const status = getDeadlineStatusInfo(deadline)}
            {@const days = getDaysUntil(deadline.dueDate)}
            {@const advisor = deadline.advisorId ? advisors.find(a => a.id === deadline.advisorId) : null}

            <Card variant="hover" padding="none">
              <div class="flex items-center gap-4 p-4">
                <!-- Checkbox -->
                <button
                  class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    {deadline.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-cream-400 hover:border-navy-500'}"
                  onclick={() => toggleComplete(deadline)}
                >
                  {#if deadline.status === 'completed'}
                    <CheckCircle class="w-4 h-4" />
                  {/if}
                </button>

                <!-- Date -->
                <div class="flex-shrink-0 w-16 text-center">
                  <div class="text-xs text-cream-500 uppercase">
                    {formatDate(deadline.dueDate, 'MMM')}
                  </div>
                  <div class="text-2xl font-semibold text-navy-800">
                    {formatDate(deadline.dueDate, 'd')}
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-navy-800 truncate {deadline.status === 'completed' ? 'line-through text-cream-500' : ''}">
                    {deadline.title}
                  </h3>
                  <div class="flex items-center gap-3 mt-1">
                    <Badge variant={categoryColors[deadline.category] as any}>
                      {DEADLINE_CATEGORY_LABELS[deadline.category]}
                    </Badge>
                    {#if advisor}
                      <span class="text-sm text-cream-600">{advisor.name}</span>
                    {/if}
                    {#if deadline.recurrence !== 'one_time'}
                      <span class="text-xs text-cream-500">
                        {RECURRENCE_LABELS[deadline.recurrence]}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- Status -->
                <div class="flex-shrink-0">
                  <Badge variant={status.color as any}>
                    <svelte:component this={status.icon} class="w-3 h-3 mr-1" />
                    {#if deadline.status !== 'completed' && days !== null}
                      {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                    {:else}
                      {status.label}
                    {/if}
                  </Badge>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1">
                  <button
                    class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                    onclick={() => openEditModal(deadline)}
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                    onclick={() => handleDelete(deadline)}
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}

  <!-- Add/Edit Modal -->
  <Modal bind:open={modalOpen} title={editingDeadline ? 'Edit Deadline' : 'Add Deadline'} size="lg">
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
      <Input
        label="Title"
        bind:value={formData.title}
        placeholder="Q1 Estimated Tax Payment"
        required
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Due Date"
          bind:value={formData.dueDate}
          required
        />
        <Select
          label="Category"
          bind:value={formData.category}
          options={categoryOptions}
          placeholder="Select category"
          required
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Recurrence"
          bind:value={formData.recurrence}
          options={recurrenceOptions}
        />
        <Select
          label="Linked Advisor (optional)"
          bind:value={formData.advisorId}
          options={[
            { value: '', label: 'None' },
            ...advisors.map(a => ({ value: a.id, label: a.name }))
          ]}
        />
      </div>

      <div>
        <label class="label">Notes</label>
        <textarea
          bind:value={formData.notes}
          placeholder="Additional details about this deadline..."
          rows="3"
          class="input"
        ></textarea>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      <Button onclick={handleSubmit} loading={saving}>
        {editingDeadline ? 'Save Changes' : 'Add Deadline'}
      </Button>
    {/snippet}
  </Modal>
</AppShell>
