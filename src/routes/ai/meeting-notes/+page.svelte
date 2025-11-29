<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Spinner, Avatar } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getAdvisors, createMeeting, updateAdvisor, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { format } from 'date-fns';
  import {
    Sparkles,
    MessageSquare,
    Copy,
    RotateCcw,
    ArrowRight,
    CheckSquare,
    Square,
    Plus,
    Trash2,
    Save
  } from 'lucide-svelte';
  import type { Advisor, ActionItem } from '$lib/types';
  import { v4 as uuidv4 } from 'uuid';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);

  let advisors = $state<Advisor[]>([]);
  let loadingAdvisors = $state(true);

  // Input state
  let rawNotes = $state('');
  let processing = $state(false);

  // Output state
  let processed = $state(false);
  let meetingTitle = $state('');
  let meetingDate = $state(format(new Date(), 'yyyy-MM-dd'));
  let selectedAdvisors = $state<string[]>([]);
  let summary = $state('');
  let actionItems = $state<ActionItem[]>([]);
  let newActionItem = $state('');

  // Saving state
  let saving = $state(false);

  onMount(async () => {
    if (!family?.id) return;

    try {
      advisors = await getAdvisors(family.id);
    } catch (err) {
      showError('Failed to load advisors');
    } finally {
      loadingAdvisors = false;
    }
  });

  async function processNotes() {
    if (!rawNotes.trim()) {
      showError('Please enter your meeting notes');
      return;
    }

    processing = true;

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawNotes,
          type: 'meeting'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to process notes');
      }

      const data = await response.json();

      // Parse the AI response
      parseAIResponse(data.result);
      processed = true;
      success('Notes processed successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to process notes');
    } finally {
      processing = false;
    }
  }

  function parseAIResponse(result: string) {
    // Extract title from first line or generate one
    const lines = result.split('\n').filter(l => l.trim());

    // Try to extract a title
    if (lines[0]?.includes('Meeting') || lines[0]?.includes('Summary')) {
      meetingTitle = lines[0].replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
    } else {
      meetingTitle = 'Meeting on ' + format(new Date(), 'MMMM d, yyyy');
    }

    // Extract summary - look for summary section
    const summaryMatch = result.match(/(?:summary|overview)[:\s]*([\s\S]*?)(?=\n\n|key points|action items|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      // Use first paragraph as summary
      summary = result.split('\n\n')[0].trim();
    }

    // Extract action items - look for action items section
    const actionMatch = result.match(/action items[:\s]*([\s\S]*?)(?=\n\n(?:next|follow)|$)/i);
    if (actionMatch) {
      const actionLines = actionMatch[1].split('\n')
        .map(l => l.replace(/^[\s\-\*\d\.]+/, '').trim())
        .filter(l => l.length > 0);

      actionItems = actionLines.map(text => ({
        id: uuidv4(),
        text,
        completed: false
      }));
    }
  }

  function addActionItem() {
    if (!newActionItem.trim()) return;

    actionItems = [
      ...actionItems,
      {
        id: uuidv4(),
        text: newActionItem.trim(),
        completed: false
      }
    ];
    newActionItem = '';
  }

  function removeActionItem(id: string) {
    actionItems = actionItems.filter(item => item.id !== id);
  }

  function toggleActionItem(id: string) {
    actionItems = actionItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
  }

  async function saveMeeting() {
    if (!family?.id || !user?.id) return;

    if (!meetingTitle.trim()) {
      showError('Meeting title is required');
      return;
    }

    saving = true;

    try {
      const newMeeting = await createMeeting(family.id, {
        title: meetingTitle,
        date: new Date(meetingDate),
        advisorIds: selectedAdvisors,
        familyMemberIds: [user.id],
        summary,
        actionItems,
        documentIds: [],
        createdBy: user.id
      });

      // Update last contact date for advisors
      for (const advisorId of selectedAdvisors) {
        await updateAdvisor(family.id, advisorId, { lastContactDate: new Date(meetingDate) });
      }

      await logActivity(family.id, {
        type: 'meeting_logged',
        description: `Logged meeting: ${newMeeting.title}`,
        userId: user.id
      });

      success('Meeting saved');
      goto(`/meetings/${newMeeting.id}`);
    } catch (err) {
      showError('Failed to save meeting');
    } finally {
      saving = false;
    }
  }

  function copyOutput() {
    const output = `# ${meetingTitle}\n\nDate: ${format(new Date(meetingDate), 'MMMM d, yyyy')}\n\n## Summary\n${summary}\n\n## Action Items\n${actionItems.map(i => `- ${i.text}`).join('\n')}`;
    navigator.clipboard.writeText(output);
    success('Copied to clipboard');
  }

  function reset() {
    rawNotes = '';
    processed = false;
    meetingTitle = '';
    meetingDate = format(new Date(), 'yyyy-MM-dd');
    selectedAdvisors = [];
    summary = '';
    actionItems = [];
  }
</script>

<svelte:head>
  <title>Meeting Notes Cleanup - WealthSync.ai</title>
</svelte:head>

<AppShell title="Meeting Notes Cleanup">
  <!-- Header -->
  <div class="mb-6">
    <div class="flex items-center gap-3 mb-2">
      <div class="p-2 bg-gold-100 rounded-lg">
        <Sparkles class="w-6 h-6 text-gold-600" />
      </div>
      <div>
        <h1 class="text-xl font-display font-semibold text-navy-800">Clean Up Meeting Notes</h1>
        <p class="text-sm text-cream-600">Transform rough notes into organized, actionable meeting records</p>
      </div>
    </div>
  </div>

  {#if !processed}
    <!-- Input Phase -->
    <div class="max-w-3xl mx-auto">
      <Card>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-navy-800">Paste Your Raw Notes</h2>
          {#if rawNotes}
            <Button variant="ghost" size="sm" onclick={reset}>
              <RotateCcw class="w-4 h-4" />
              Clear
            </Button>
          {/if}
        </div>

        <textarea
          bind:value={rawNotes}
          placeholder="Paste your raw meeting notes here...

Example:
- Met with John Smith (CPA) today
- Discussed Q4 tax planning
- Need to review estimated payments
- Mentioned changes to estate plan
- Follow up on insurance policy renewal
- Sarah to send updated financials"
          rows={16}
          class="input font-mono text-sm"
        ></textarea>

        <div class="mt-4">
          <Button onclick={processNotes} disabled={!rawNotes.trim()} loading={processing} class="w-full">
            <Sparkles class="w-4 h-4" />
            Process with AI
          </Button>
        </div>
      </Card>

      <!-- Tips -->
      <Card class="mt-6">
        <h3 class="font-semibold text-navy-800 mb-3">Tips for Best Results</h3>
        <ul class="space-y-2 text-sm text-cream-700">
          <li class="flex items-start gap-2">
            <CheckSquare class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Include who attended the meeting (advisors, family members)</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckSquare class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Mention key topics discussed and any decisions made</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckSquare class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Note any follow-up tasks or action items</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckSquare class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Include dates and deadlines mentioned</span>
          </li>
        </ul>
      </Card>
    </div>
  {:else}
    <!-- Output Phase -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title & Date -->
        <Card>
          <h3 class="font-semibold text-navy-800 mb-4">Meeting Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Meeting Title"
              bind:value={meetingTitle}
              placeholder="Quarterly Review"
            />
            <Input
              type="date"
              label="Date"
              bind:value={meetingDate}
            />
          </div>
        </Card>

        <!-- Summary -->
        <Card>
          <h3 class="font-semibold text-navy-800 mb-4">Summary</h3>
          <textarea
            bind:value={summary}
            placeholder="Meeting summary..."
            rows={6}
            class="input"
          ></textarea>
        </Card>

        <!-- Action Items -->
        <Card>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-navy-800">Action Items</h3>
            <span class="text-sm text-cream-600">
              {actionItems.filter(i => i.completed).length}/{actionItems.length} completed
            </span>
          </div>

          <div class="space-y-2 mb-4">
            {#each actionItems as item}
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
          </div>

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
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Advisors -->
        <Card>
          <h3 class="font-semibold text-navy-800 mb-4">Advisors Present</h3>
          {#if loadingAdvisors}
            <div class="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          {:else if advisors.length === 0}
            <p class="text-cream-500 text-sm">No advisors found. <a href="/advisors" class="text-navy-800 hover:underline">Add advisors</a> first.</p>
          {:else}
            <div class="space-y-2">
              {#each advisors as advisor}
                <button
                  class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors
                    {selectedAdvisors.includes(advisor.id)
                      ? 'bg-navy-800 text-white'
                      : 'bg-cream-100 text-cream-700 hover:bg-cream-200'}"
                  onclick={() => {
                    if (selectedAdvisors.includes(advisor.id)) {
                      selectedAdvisors = selectedAdvisors.filter(id => id !== advisor.id);
                    } else {
                      selectedAdvisors = [...selectedAdvisors, advisor.id];
                    }
                  }}
                >
                  <Avatar name={advisor.name} size="sm" />
                  <div class="text-left">
                    <p class="text-sm font-medium">{advisor.name}</p>
                    <p class="text-xs opacity-70">{advisor.firm}</p>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </Card>

        <!-- Actions -->
        <Card>
          <h3 class="font-semibold text-navy-800 mb-4">Actions</h3>
          <div class="space-y-2">
            <Button onclick={saveMeeting} loading={saving} class="w-full">
              <Save class="w-4 h-4" />
              Save as Meeting
            </Button>
            <Button variant="secondary" onclick={copyOutput} class="w-full">
              <Copy class="w-4 h-4" />
              Copy to Clipboard
            </Button>
            <Button variant="ghost" onclick={reset} class="w-full">
              <RotateCcw class="w-4 h-4" />
              Start Over
            </Button>
          </div>
        </Card>

        <!-- AI Notice -->
        <div class="text-xs text-cream-500 flex items-start gap-2">
          <Sparkles class="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>AI-generated content. Please review and edit as needed before saving.</span>
        </div>
      </div>
    </div>
  {/if}
</AppShell>
