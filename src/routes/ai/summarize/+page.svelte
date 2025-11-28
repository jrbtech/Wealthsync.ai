<script lang="ts">
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Select, Spinner } from '$lib/components/ui';
  import { success, error as showError } from '$lib/stores/ui';
  import {
    Sparkles,
    FileText,
    MessageSquare,
    ClipboardList,
    Copy,
    RotateCcw,
    Upload
  } from 'lucide-svelte';

  type SummaryType = 'document' | 'meeting' | 'report';

  let summaryType = $state<SummaryType>('document');
  let inputText = $state('');
  let outputText = $state('');
  let loading = $state(false);
  let uploadedFile = $state<File | null>(null);

  const typeOptions = [
    { value: 'document', label: 'Document Summary' },
    { value: 'meeting', label: 'Meeting Notes Cleanup' },
    { value: 'report', label: 'Report Generation' }
  ];

  const typeInfo: Record<SummaryType, { icon: any; title: string; description: string; placeholder: string }> = {
    document: {
      icon: FileText,
      title: 'Document Summarization',
      description: 'Upload or paste a document to get a clear, concise summary of key points.',
      placeholder: 'Paste your document text here, or upload a file...\n\nExample: A trust document, legal agreement, or financial statement.'
    },
    meeting: {
      icon: MessageSquare,
      title: 'Meeting Notes Cleanup',
      description: 'Transform rough meeting notes into organized, actionable summaries.',
      placeholder: 'Paste your raw meeting notes here...\n\nExample:\n- Discussed Q4 tax strategy\n- John mentioned estate planning changes\n- Need to follow up on insurance policy'
    },
    report: {
      icon: ClipboardList,
      title: 'Report Generation',
      description: 'Generate professional quarterly family office reports from your data.',
      placeholder: 'Provide data for report generation...\n\nExample: Net worth figures, recent meetings, upcoming deadlines, etc.'
    }
  };

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadedFile = file;

    // Read text files
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      inputText = text;
    } else {
      showError('Please upload a text file (.txt) for now');
      uploadedFile = null;
    }
  }

  async function handleSubmit() {
    if (!inputText.trim()) {
      showError('Please enter some text to process');
      return;
    }

    loading = true;
    outputText = '';

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          type: summaryType
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to process');
      }

      const data = await response.json();
      outputText = data.result;
      success('Processing complete');
    } catch (err: any) {
      showError(err.message || 'Failed to process text');
    } finally {
      loading = false;
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(outputText);
    success('Copied to clipboard');
  }

  function reset() {
    inputText = '';
    outputText = '';
    uploadedFile = null;
  }
</script>

<svelte:head>
  <title>AI Assistant - WealthSync</title>
</svelte:head>

<AppShell title="AI Assistant">
  <!-- Header -->
  <div class="mb-6">
    <div class="flex items-center gap-3 mb-2">
      <div class="p-2 bg-gold-100 rounded-lg">
        <Sparkles class="w-6 h-6 text-gold-600" />
      </div>
      <div>
        <h1 class="text-xl font-serif font-semibold text-navy-800">AI-Powered Tools</h1>
        <p class="text-sm text-cream-600">Summarize documents, clean up meeting notes, and generate reports</p>
      </div>
    </div>
  </div>

  <!-- Type Selection -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {#each Object.entries(typeInfo) as [type, info]}
      {@const Icon = info.icon}
      <button
        class="text-left p-4 rounded-xl border-2 transition-all {summaryType === type
          ? 'border-navy-800 bg-navy-50'
          : 'border-cream-300 bg-white hover:border-cream-400'}"
        onclick={() => (summaryType = type as SummaryType)}
      >
        <svelte:component this={Icon} class="w-6 h-6 mb-2 {summaryType === type ? 'text-navy-800' : 'text-cream-600'}" />
        <h3 class="font-semibold text-navy-800">{info.title}</h3>
        <p class="text-sm text-cream-600 mt-1">{info.description}</p>
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Input -->
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-navy-800">Input</h2>
        <div class="flex items-center gap-2">
          <label class="btn btn-secondary cursor-pointer">
            <Upload class="w-4 h-4" />
            Upload
            <input
              type="file"
              class="hidden"
              accept=".txt"
              onchange={handleFileUpload}
            />
          </label>
          {#if inputText || uploadedFile}
            <Button variant="ghost" size="sm" onclick={reset}>
              <RotateCcw class="w-4 h-4" />
              Clear
            </Button>
          {/if}
        </div>
      </div>

      {#if uploadedFile}
        <div class="flex items-center gap-2 p-2 bg-cream-100 rounded-lg mb-3">
          <FileText class="w-4 h-4 text-cream-600" />
          <span class="text-sm text-navy-800">{uploadedFile.name}</span>
        </div>
      {/if}

      <textarea
        bind:value={inputText}
        placeholder={typeInfo[summaryType].placeholder}
        rows={16}
        class="input font-mono text-sm"
      ></textarea>

      <div class="mt-4">
        <Button onclick={handleSubmit} disabled={!inputText.trim()} loading={loading} class="w-full">
          <Sparkles class="w-4 h-4" />
          Process with AI
        </Button>
      </div>
    </Card>

    <!-- Output -->
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-navy-800">Output</h2>
        {#if outputText}
          <Button variant="ghost" size="sm" onclick={copyOutput}>
            <Copy class="w-4 h-4" />
            Copy
          </Button>
        {/if}
      </div>

      {#if loading}
        <div class="flex flex-col items-center justify-center h-64">
          <Spinner size="lg" />
          <p class="text-cream-600 mt-4">Processing...</p>
        </div>
      {:else if outputText}
        <div class="prose prose-sm max-w-none">
          <div class="bg-cream-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-navy-800">
            {outputText}
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-cream-200">
          <p class="text-xs text-cream-500 flex items-center gap-1">
            <Sparkles class="w-3 h-3" />
            AI-generated content. Please review for accuracy.
          </p>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <div class="p-4 bg-cream-100 rounded-full mb-4">
            <svelte:component this={typeInfo[summaryType].icon} class="w-8 h-8 text-cream-500" />
          </div>
          <p class="text-cream-600">
            Enter text on the left and click "Process with AI" to see results here
          </p>
        </div>
      {/if}
    </Card>
  </div>

  <!-- Tips -->
  <Card class="mt-6">
    <h3 class="font-semibold text-navy-800 mb-3">Tips for Best Results</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 class="text-sm font-medium text-navy-700 mb-1">Document Summary</h4>
        <p class="text-sm text-cream-600">
          Include the full text for comprehensive summaries. The AI works best with legal, financial, and estate documents.
        </p>
      </div>
      <div>
        <h4 class="text-sm font-medium text-navy-700 mb-1">Meeting Notes</h4>
        <p class="text-sm text-cream-600">
          Include attendees, dates, and raw notes. The AI will organize into summary, key points, and action items.
        </p>
      </div>
      <div>
        <h4 class="text-sm font-medium text-navy-700 mb-1">Report Generation</h4>
        <p class="text-sm text-cream-600">
          Provide relevant data points like net worth changes, meetings held, and upcoming deadlines.
        </p>
      </div>
    </div>
  </Card>
</AppShell>
