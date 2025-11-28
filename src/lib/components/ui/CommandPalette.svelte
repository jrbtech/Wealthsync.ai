<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { currentFamily } from '$lib/stores/auth';
  import { getAdvisors, getDeadlines, getDocuments, getMeetings, getEntities } from '$lib/firebase/services';
  import {
    Search,
    Users,
    Calendar,
    FileText,
    MessageSquare,
    Building,
    ArrowRight,
    Command,
    X,
    Sparkles,
    Settings,
    PieChart,
    Plus
  } from 'lucide-svelte';
  import type { Advisor, Deadline, Document, Meeting, Entity } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS, DEADLINE_CATEGORY_LABELS, DOCUMENT_FOLDER_LABELS } from '$lib/types';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  const family = $derived($currentFamily);

  let searchQuery = $state('');
  let selectedIndex = $state(0);
  let loading = $state(false);
  let inputRef = $state<HTMLInputElement | null>(null);

  // Data
  let advisors = $state<Advisor[]>([]);
  let deadlines = $state<Deadline[]>([]);
  let documents = $state<Document[]>([]);
  let meetings = $state<Meeting[]>([]);
  let entities = $state<Entity[]>([]);
  let dataLoaded = $state(false);

  // Quick actions
  const quickActions = [
    { id: 'new-advisor', label: 'Add new advisor', icon: Users, action: () => goto('/advisors?new=true') },
    { id: 'new-deadline', label: 'Add new deadline', icon: Calendar, action: () => goto('/deadlines?new=true') },
    { id: 'upload-document', label: 'Upload document', icon: FileText, action: () => goto('/documents?upload=true') },
    { id: 'log-meeting', label: 'Log meeting', icon: MessageSquare, action: () => goto('/meetings?new=true') },
    { id: 'add-entity', label: 'Add wealth entity', icon: Building, action: () => goto('/wealth?new=true') },
    { id: 'ai-summarize', label: 'AI Document Summary', icon: Sparkles, action: () => goto('/ai/summarize') },
    { id: 'ai-meeting', label: 'AI Meeting Notes', icon: Sparkles, action: () => goto('/ai/meeting-notes') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => goto('/settings') },
  ];

  interface SearchResult {
    id: string;
    type: 'advisor' | 'deadline' | 'document' | 'meeting' | 'entity' | 'action' | 'page';
    title: string;
    subtitle: string;
    icon: any;
    href?: string;
    action?: () => void;
  }

  let results = $state<SearchResult[]>([]);

  // Navigation pages
  const pages = [
    { id: 'dashboard', title: 'Dashboard', subtitle: 'Overview of your family office', icon: PieChart, href: '/dashboard' },
    { id: 'advisors', title: 'Advisors', subtitle: 'Manage your advisor network', icon: Users, href: '/advisors' },
    { id: 'deadlines', title: 'Deadlines', subtitle: 'Track important dates', icon: Calendar, href: '/deadlines' },
    { id: 'documents', title: 'Documents', subtitle: 'Your document vault', icon: FileText, href: '/documents' },
    { id: 'meetings', title: 'Meetings', subtitle: 'Meeting notes and history', icon: MessageSquare, href: '/meetings' },
    { id: 'wealth', title: 'Wealth Tracker', subtitle: 'Net worth and assets', icon: Building, href: '/wealth' },
    { id: 'ai', title: 'AI Assistant', subtitle: 'AI-powered tools', icon: Sparkles, href: '/ai/summarize' },
    { id: 'settings', title: 'Settings', subtitle: 'Account and preferences', icon: Settings, href: '/settings' },
  ];

  async function loadData() {
    if (!family?.id || dataLoaded) return;

    loading = true;
    try {
      const [a, d, doc, m, e] = await Promise.all([
        getAdvisors(family.id),
        getDeadlines(family.id),
        getDocuments(family.id),
        getMeetings(family.id),
        getEntities(family.id)
      ]);

      advisors = a;
      deadlines = d;
      documents = doc;
      meetings = m;
      entities = e;
      dataLoaded = true;
    } catch (err) {
      console.error('Failed to load search data:', err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (open) {
      loadData();
      setTimeout(() => inputRef?.focus(), 50);
    }
  });

  $effect(() => {
    if (!searchQuery.trim()) {
      // Show quick actions and pages when no search
      results = [
        ...quickActions.map(a => ({
          id: a.id,
          type: 'action' as const,
          title: a.label,
          subtitle: 'Quick action',
          icon: a.icon,
          action: a.action
        })),
        ...pages.map(p => ({
          id: p.id,
          type: 'page' as const,
          title: p.title,
          subtitle: p.subtitle,
          icon: p.icon,
          href: p.href
        }))
      ];
      selectedIndex = 0;
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search advisors
    for (const advisor of advisors) {
      if (
        advisor.name.toLowerCase().includes(query) ||
        advisor.firm.toLowerCase().includes(query) ||
        advisor.email.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: `advisor-${advisor.id}`,
          type: 'advisor',
          title: advisor.name,
          subtitle: `${advisor.firm} - ${ADVISOR_SPECIALTY_LABELS[advisor.specialty]}`,
          icon: Users,
          href: `/advisors/${advisor.id}`
        });
      }
    }

    // Search deadlines
    for (const deadline of deadlines) {
      if (
        deadline.title.toLowerCase().includes(query) ||
        deadline.notes.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: `deadline-${deadline.id}`,
          type: 'deadline',
          title: deadline.title,
          subtitle: `${DEADLINE_CATEGORY_LABELS[deadline.category]} - Due ${new Date(deadline.dueDate).toLocaleDateString()}`,
          icon: Calendar,
          href: `/deadlines?id=${deadline.id}`
        });
      }
    }

    // Search documents
    for (const doc of documents) {
      if (
        doc.filename.toLowerCase().includes(query) ||
        doc.tags.some(t => t.toLowerCase().includes(query)) ||
        doc.notes.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: `document-${doc.id}`,
          type: 'document',
          title: doc.filename,
          subtitle: DOCUMENT_FOLDER_LABELS[doc.folder],
          icon: FileText,
          href: `/documents/${doc.id}`
        });
      }
    }

    // Search meetings
    for (const meeting of meetings) {
      if (
        meeting.title.toLowerCase().includes(query) ||
        meeting.summary.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: `meeting-${meeting.id}`,
          type: 'meeting',
          title: meeting.title,
          subtitle: `Meeting on ${new Date(meeting.date).toLocaleDateString()}`,
          icon: MessageSquare,
          href: `/meetings/${meeting.id}`
        });
      }
    }

    // Search entities
    for (const entity of entities) {
      if (entity.name.toLowerCase().includes(query)) {
        searchResults.push({
          id: `entity-${entity.id}`,
          type: 'entity',
          title: entity.name,
          subtitle: `${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} entity`,
          icon: Building,
          href: `/wealth?entity=${entity.id}`
        });
      }
    }

    // Search pages
    for (const page of pages) {
      if (
        page.title.toLowerCase().includes(query) ||
        page.subtitle.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.title,
          subtitle: page.subtitle,
          icon: page.icon,
          href: page.href
        });
      }
    }

    // Search quick actions
    for (const action of quickActions) {
      if (action.label.toLowerCase().includes(query)) {
        searchResults.push({
          id: `action-${action.id}`,
          type: 'action',
          title: action.label,
          subtitle: 'Quick action',
          icon: action.icon,
          action: action.action
        });
      }
    }

    results = searchResults.slice(0, 10);
    selectedIndex = 0;
  });

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      close();
    }
  }

  function selectResult(result: SearchResult) {
    if (result.action) {
      result.action();
    } else if (result.href) {
      goto(result.href);
    }
    close();
  }

  function close() {
    open = false;
    searchQuery = '';
    onclose?.();
  }

  // Global keyboard shortcut
  onMount(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open = !open;
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  });

  const typeColors: Record<string, string> = {
    advisor: 'bg-blue-100 text-blue-700',
    deadline: 'bg-orange-100 text-orange-700',
    document: 'bg-emerald-100 text-emerald-700',
    meeting: 'bg-purple-100 text-purple-700',
    entity: 'bg-gold-100 text-gold-700',
    action: 'bg-navy-100 text-navy-700',
    page: 'bg-cream-200 text-cream-700'
  };
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="-1"
  ></div>

  <!-- Modal -->
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
    <div
      class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <!-- Search input -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-cream-200">
        <Search class="w-5 h-5 text-cream-500 flex-shrink-0" />
        <input
          bind:this={inputRef}
          bind:value={searchQuery}
          type="text"
          placeholder="Search advisors, deadlines, documents, meetings..."
          class="flex-1 bg-transparent text-navy-800 placeholder-cream-500 outline-none text-lg"
          onkeydown={handleKeyDown}
        />
        <div class="flex items-center gap-1">
          <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-cream-100 rounded text-xs text-cream-600 font-mono">
            <Command class="w-3 h-3" />K
          </kbd>
          <button
            class="p-1.5 rounded-lg text-cream-500 hover:text-navy-800 hover:bg-cream-100"
            onclick={close}
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="max-h-[60vh] overflow-y-auto">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="w-6 h-6 border-2 border-navy-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        {:else if results.length === 0}
          <div class="py-12 text-center">
            <Search class="w-12 h-12 text-cream-400 mx-auto mb-3" />
            <p class="text-cream-600">No results found for "{searchQuery}"</p>
            <p class="text-sm text-cream-500 mt-1">Try a different search term</p>
          </div>
        {:else}
          {#if !searchQuery.trim()}
            <div class="px-4 py-2 text-xs font-medium text-cream-500 uppercase tracking-wider bg-cream-50">
              Quick Actions
            </div>
          {/if}
          <div class="py-2">
            {#each results as result, index}
              {@const ResultIcon = result.icon}
              <button
                class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  {index === selectedIndex ? 'bg-navy-50' : 'hover:bg-cream-50'}"
                onclick={() => selectResult(result)}
                onmouseenter={() => selectedIndex = index}
              >
                <div class="flex-shrink-0 p-2 rounded-lg {typeColors[result.type]}">
                  <ResultIcon class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-navy-800 truncate">{result.title}</p>
                  <p class="text-sm text-cream-600 truncate">{result.subtitle}</p>
                </div>
                {#if result.type === 'action'}
                  <Plus class="w-4 h-4 text-cream-500" />
                {:else}
                  <ArrowRight class="w-4 h-4 text-cream-500" />
                {/if}
              </button>

              {#if !searchQuery.trim() && index === quickActions.length - 1}
                <div class="px-4 py-2 text-xs font-medium text-cream-500 uppercase tracking-wider bg-cream-50 mt-2">
                  Navigate
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-4 py-2 bg-cream-50 border-t border-cream-200 text-xs text-cream-500">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 bg-white rounded border border-cream-300">↑</kbd>
            <kbd class="px-1.5 py-0.5 bg-white rounded border border-cream-300">↓</kbd>
            to navigate
          </span>
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 bg-white rounded border border-cream-300">↵</kbd>
            to select
          </span>
        </div>
        <span class="flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 bg-white rounded border border-cream-300">esc</kbd>
          to close
        </span>
      </div>
    </div>
  </div>
{/if}
