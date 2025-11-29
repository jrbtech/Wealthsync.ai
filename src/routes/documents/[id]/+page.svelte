<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Badge, Spinner, Modal } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getDocument, getAdvisors, updateDocument, deleteDocument } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, formatFileSize } from '$lib/utils/format';
  import { ref, deleteObject } from 'firebase/storage';
  import { storage } from '$lib/firebase/client';
  import {
    ArrowLeft,
    Download,
    Trash2,
    Pencil,
    Save,
    FileText,
    FileImage,
    File,
    Calendar,
    User,
    Tag,
    FolderOpen,
    ExternalLink
  } from 'lucide-svelte';
  import type { Document as DocType, DocumentFolder, Advisor } from '$lib/types';
  import { DOCUMENT_FOLDER_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);
  const documentId = $derived($page.params.id);

  let loading = $state(true);
  let document = $state<DocType | null>(null);
  let advisors = $state<Advisor[]>([]);
  let editing = $state(false);
  let saving = $state(false);
  let deleteModalOpen = $state(false);

  let formData = $state({
    folder: '' as DocumentFolder | '',
    tags: '',
    notes: '',
    advisorId: ''
  });

  const folderOptions = Object.entries(DOCUMENT_FOLDER_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  }

  onMount(async () => {
    if (!family?.id || !documentId) return;

    try {
      const [docData, advisorsData] = await Promise.all([
        getDocument(family.id, documentId),
        getAdvisors(family.id)
      ]);

      if (!docData) {
        goto('/documents');
        return;
      }

      document = docData;
      advisors = advisorsData;
      initFormData(docData);
    } catch (err) {
      showError('Failed to load document');
      goto('/documents');
    } finally {
      loading = false;
    }
  });

  function initFormData(doc: DocType) {
    formData = {
      folder: doc.folder,
      tags: doc.tags.join(', '),
      notes: doc.notes,
      advisorId: doc.advisorId || ''
    };
  }

  function cancelEditing() {
    if (document) {
      initFormData(document);
    }
    editing = false;
  }

  async function handleSave() {
    if (!family?.id || !document) return;

    if (!formData.folder) {
      showError('Folder is required');
      return;
    }

    saving = true;

    try {
      const updateData = {
        folder: formData.folder as DocumentFolder,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: formData.notes,
        advisorId: formData.advisorId || undefined
      };

      await updateDocument(family.id, document.id, updateData);

      document = {
        ...document,
        ...updateData
      };

      editing = false;
      success('Document updated');
    } catch (err) {
      showError('Failed to update document');
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!family?.id || !document) return;

    try {
      // Delete from storage
      const storageRef = ref(storage, document.storagePath);
      await deleteObject(storageRef).catch(() => {});

      // Delete record
      await deleteDocument(family.id, document.id);
      success('Document deleted');
      goto('/documents');
    } catch (err) {
      showError('Failed to delete document');
    }
  }

  function downloadDocument() {
    if (document?.downloadUrl) {
      window.open(document.downloadUrl, '_blank');
    }
  }

  const linkedAdvisor = $derived(document?.advisorId ? advisors.find(a => a.id === document?.advisorId) : null);
  const FileIcon = $derived(document ? getFileIcon(document.mimeType) : File);
  const canPreview = $derived(document?.mimeType.includes('pdf') || document?.mimeType.startsWith('image/'));
</script>

<svelte:head>
  <title>{document?.filename || 'Document'} - WealthSync.ai</title>
</svelte:head>

<AppShell>
  {#snippet headerLeft()}
    <Button href="/documents" variant="ghost" size="sm">
      <ArrowLeft class="w-4 h-4" />
      Back
    </Button>
  {/snippet}

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else if document}
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Preview Panel -->
        <div class="lg:col-span-2">
          <Card padding="none" class="overflow-hidden">
            {#if canPreview}
              <div class="aspect-[4/3] bg-cream-100">
                {#if document.mimeType.startsWith('image/')}
                  <img
                    src={document.downloadUrl}
                    alt={document.filename}
                    class="w-full h-full object-contain"
                  />
                {:else if document.mimeType.includes('pdf')}
                  <iframe
                    src={document.downloadUrl}
                    title={document.filename}
                    class="w-full h-full"
                  ></iframe>
                {/if}
              </div>
            {:else}
              <div class="aspect-[4/3] bg-cream-100 flex flex-col items-center justify-center">
                <FileIcon class="w-24 h-24 text-cream-400 mb-4" />
                <p class="text-cream-600 mb-4">Preview not available for this file type</p>
                <Button onclick={downloadDocument}>
                  <Download class="w-4 h-4" />
                  Download to View
                </Button>
              </div>
            {/if}
          </Card>
        </div>

        <!-- Details Panel -->
        <div class="space-y-6">
          <!-- Header -->
          <Card>
            <div class="flex items-start gap-3 mb-4">
              <div class="p-3 bg-cream-100 rounded-lg">
                <FileIcon class="w-8 h-8 text-cream-600" />
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-lg font-semibold text-navy-800 break-words">
                  {document.filename}
                </h1>
                <p class="text-sm text-cream-600">
                  {formatFileSize(document.size)}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button onclick={downloadDocument}>
                <Download class="w-4 h-4" />
                Download
              </Button>
              {#if canPreview}
                <Button variant="secondary" onclick={() => window.open(document?.downloadUrl, '_blank')}>
                  <ExternalLink class="w-4 h-4" />
                  Open
                </Button>
              {/if}
            </div>
          </Card>

          <!-- Details -->
          <Card>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-navy-800">Details</h3>
              {#if editing}
                <div class="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onclick={cancelEditing}>Cancel</Button>
                  <Button size="sm" onclick={handleSave} loading={saving}>
                    <Save class="w-4 h-4" />
                    Save
                  </Button>
                </div>
              {:else}
                <Button variant="ghost" size="sm" onclick={() => (editing = true)}>
                  <Pencil class="w-4 h-4" />
                  Edit
                </Button>
              {/if}
            </div>

            <div class="space-y-4">
              <!-- Folder -->
              <div>
                <div class="flex items-center gap-2 text-sm text-cream-600 mb-1">
                  <FolderOpen class="w-4 h-4" />
                  <span>Folder</span>
                </div>
                {#if editing}
                  <Select
                    bind:value={formData.folder}
                    options={folderOptions}
                    placeholder="Select folder"
                  />
                {:else}
                  <Badge variant="navy">{DOCUMENT_FOLDER_LABELS[document.folder]}</Badge>
                {/if}
              </div>

              <!-- Tags -->
              <div>
                <div class="flex items-center gap-2 text-sm text-cream-600 mb-1">
                  <Tag class="w-4 h-4" />
                  <span>Tags</span>
                </div>
                {#if editing}
                  <Input
                    bind:value={formData.tags}
                    placeholder="tax, 2024, important"
                    hint="Separate tags with commas"
                  />
                {:else}
                  {#if document.tags.length > 0}
                    <div class="flex flex-wrap gap-1">
                      {#each document.tags as tag}
                        <Badge variant="gray">{tag}</Badge>
                      {/each}
                    </div>
                  {:else}
                    <p class="text-cream-500 italic text-sm">No tags</p>
                  {/if}
                {/if}
              </div>

              <!-- Linked Advisor -->
              <div>
                <div class="flex items-center gap-2 text-sm text-cream-600 mb-1">
                  <User class="w-4 h-4" />
                  <span>Linked Advisor</span>
                </div>
                {#if editing}
                  <Select
                    bind:value={formData.advisorId}
                    options={[
                      { value: '', label: 'None' },
                      ...advisors.map(a => ({ value: a.id, label: `${a.name} (${a.firm})` }))
                    ]}
                  />
                {:else}
                  {#if linkedAdvisor}
                    <a href="/advisors/{linkedAdvisor.id}" class="text-navy-800 hover:underline">
                      {linkedAdvisor.name}
                    </a>
                  {:else}
                    <p class="text-cream-500 italic text-sm">None</p>
                  {/if}
                {/if}
              </div>

              <!-- Upload Date -->
              <div>
                <div class="flex items-center gap-2 text-sm text-cream-600 mb-1">
                  <Calendar class="w-4 h-4" />
                  <span>Uploaded</span>
                </div>
                <p class="text-navy-800">
                  {formatDate(document.uploadedAt, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </Card>

          <!-- Notes -->
          <Card>
            <h3 class="font-semibold text-navy-800 mb-3">Notes</h3>
            {#if editing}
              <textarea
                bind:value={formData.notes}
                placeholder="Add notes about this document..."
                rows="4"
                class="input"
              ></textarea>
            {:else}
              {#if document.notes}
                <p class="text-cream-700 whitespace-pre-wrap">{document.notes}</p>
              {:else}
                <p class="text-cream-500 italic">No notes</p>
              {/if}
            {/if}
          </Card>

          <!-- Delete -->
          <Card class="border-red-200">
            <h3 class="font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p class="text-sm text-cream-600 mb-3">
              Permanently delete this document. This action cannot be undone.
            </p>
            <Button
              variant="secondary"
              onclick={() => (deleteModalOpen = true)}
              class="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 class="w-4 h-4" />
              Delete Document
            </Button>
          </Card>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  <Modal bind:open={deleteModalOpen} title="Delete Document">
    <p class="text-cream-700">
      Are you sure you want to delete "{document?.filename}"? This action cannot be undone.
    </p>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (deleteModalOpen = false)}>Cancel</Button>
      <Button onclick={handleDelete} class="bg-red-600 hover:bg-red-700">
        Delete Document
      </Button>
    {/snippet}
  </Modal>
</AppShell>
