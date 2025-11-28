<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Modal, Badge, EmptyState, Spinner } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import { getDocuments, getAdvisors, createDocument, updateDocument, deleteDocument, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatDate, formatFileSize } from '$lib/utils/format';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { storage } from '$lib/firebase/client';
  import { v4 as uuidv4 } from 'uuid';
  import {
    Plus,
    Search,
    FolderOpen,
    FileText,
    FileImage,
    File,
    Download,
    Trash2,
    Upload,
    Eye,
    X,
    Tag,
    Filter
  } from 'lucide-svelte';
  import type { Document as DocType, DocumentFolder, Advisor } from '$lib/types';
  import { DOCUMENT_FOLDER_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);

  let loading = $state(true);
  let documents = $state<DocType[]>([]);
  let advisors = $state<Advisor[]>([]);
  let searchQuery = $state('');
  let selectedFolder = $state<DocumentFolder | ''>('');
  let filteredDocuments = $state<DocType[]>([]);

  // Upload modal
  let uploadModalOpen = $state(false);
  let uploading = $state(false);
  let uploadProgress = $state(0);
  let uploadFile = $state<File | null>(null);
  let uploadFormData = $state({
    folder: '' as DocumentFolder | '',
    tags: '',
    notes: '',
    advisorId: ''
  });

  // Preview modal
  let previewModalOpen = $state(false);
  let previewDocument = $state<DocType | null>(null);

  const folderOptions = Object.entries(DOCUMENT_FOLDER_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const folderIcons: Record<string, any> = {
    estate_planning: FileText,
    tax_returns: FileText,
    insurance_policies: FileText,
    investment_statements: FileText,
    legal_documents: FileText,
    property_records: FileText,
    other: File
  };

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  }

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [docsData, advisorsData] = await Promise.all([
        getDocuments(family.id),
        getAdvisors(family.id)
      ]);

      documents = docsData;
      advisors = advisorsData;
      filteredDocuments = documents;
    } catch (err) {
      showError('Failed to load documents');
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    let filtered = documents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.filename.toLowerCase().includes(query) ||
          d.tags.some((t) => t.toLowerCase().includes(query)) ||
          d.notes.toLowerCase().includes(query)
      );
    }

    if (selectedFolder) {
      filtered = filtered.filter((d) => d.folder === selectedFolder);
    }

    filteredDocuments = filtered;
  });

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      uploadFile = input.files[0];
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length) {
      uploadFile = e.dataTransfer.files[0];
    }
  }

  async function handleUpload() {
    if (!family?.id || !user?.id || !uploadFile) return;

    if (!uploadFormData.folder) {
      showError('Please select a folder');
      return;
    }

    uploading = true;
    uploadProgress = 0;

    try {
      // Generate unique path
      const fileId = uuidv4();
      const extension = uploadFile.name.split('.').pop();
      const storagePath = `families/${family.id}/documents/${fileId}.${extension}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, uploadFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // Create document record
      const newDoc = await createDocument(family.id, {
        filename: uploadFile.name,
        storagePath,
        downloadUrl,
        folder: uploadFormData.folder as DocumentFolder,
        tags: uploadFormData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: uploadFormData.notes,
        advisorId: uploadFormData.advisorId || undefined,
        uploadedBy: user.id,
        uploadedAt: new Date(),
        size: uploadFile.size,
        mimeType: uploadFile.type
      });

      documents = [newDoc, ...documents];

      await logActivity(family.id, {
        type: 'document_uploaded',
        description: `Uploaded document: ${newDoc.filename}`,
        userId: user.id
      });

      success('Document uploaded');
      uploadModalOpen = false;
      resetUploadForm();
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload document');
    } finally {
      uploading = false;
    }
  }

  function resetUploadForm() {
    uploadFile = null;
    uploadFormData = {
      folder: '',
      tags: '',
      notes: '',
      advisorId: ''
    };
  }

  async function handleDelete(doc: DocType) {
    if (!family?.id) return;

    if (!confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const storageRef = ref(storage, doc.storagePath);
      await deleteObject(storageRef).catch(() => {}); // Ignore if already deleted

      // Delete record
      await deleteDocument(family.id, doc.id);
      documents = documents.filter((d) => d.id !== doc.id);
      success('Document deleted');
    } catch (err) {
      showError('Failed to delete document');
    }
  }

  function openPreview(doc: DocType) {
    previewDocument = doc;
    previewModalOpen = true;
  }

  async function downloadDocument(doc: DocType) {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    }
  }
</script>

<svelte:head>
  <title>Documents - WealthSync</title>
</svelte:head>

<AppShell title="Document Vault">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar - Folders -->
      <div class="lg:w-64 flex-shrink-0">
        <Card padding="sm">
          <h3 class="font-semibold text-navy-800 mb-3 px-2">Folders</h3>
          <nav class="space-y-1">
            <button
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                {selectedFolder === '' ? 'bg-navy-800 text-white' : 'text-cream-700 hover:bg-cream-200'}"
              onclick={() => (selectedFolder = '')}
            >
              <FolderOpen class="w-5 h-5" />
              <span>All Documents</span>
              <span class="ml-auto text-sm opacity-70">{documents.length}</span>
            </button>

            {#each Object.entries(DOCUMENT_FOLDER_LABELS) as [value, label]}
              {@const count = documents.filter(d => d.folder === value).length}
              <button
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                  {selectedFolder === value ? 'bg-navy-800 text-white' : 'text-cream-700 hover:bg-cream-200'}"
                onclick={() => (selectedFolder = value as DocumentFolder)}
              >
                <svelte:component this={folderIcons[value] || File} class="w-5 h-5" />
                <span class="truncate">{label}</span>
                {#if count > 0}
                  <span class="ml-auto text-sm opacity-70">{count}</span>
                {/if}
              </button>
            {/each}
          </nav>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search documents..."
              class="input pl-10"
            />
          </div>
          <Button onclick={() => (uploadModalOpen = true)}>
            <Upload class="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        <!-- Documents Grid -->
        {#if filteredDocuments.length === 0}
          {#if documents.length === 0}
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to get started"
            >
              {#snippet action()}
                <Button onclick={() => (uploadModalOpen = true)}>
                  <Upload class="w-4 h-4" />
                  Upload Document
                </Button>
              {/snippet}
            </EmptyState>
          {:else}
            <EmptyState
              icon={Search}
              title="No documents found"
              description="Try adjusting your search or folder filter"
            />
          {/if}
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {#each filteredDocuments as doc}
              {@const FileIcon = getFileIcon(doc.mimeType)}
              {@const advisor = doc.advisorId ? advisors.find(a => a.id === doc.advisorId) : null}

              <Card variant="hover" padding="none" class="group">
                <div class="p-4">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 p-3 bg-cream-100 rounded-lg">
                      <svelte:component this={FileIcon} class="w-6 h-6 text-cream-600" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-navy-800 truncate" title={doc.filename}>
                        {doc.filename}
                      </h4>
                      <p class="text-sm text-cream-600">
                        {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div class="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="gray">{DOCUMENT_FOLDER_LABELS[doc.folder]}</Badge>
                    {#each doc.tags.slice(0, 2) as tag}
                      <Badge variant="navy">{tag}</Badge>
                    {/each}
                    {#if doc.tags.length > 2}
                      <span class="text-xs text-cream-500">+{doc.tags.length - 2}</span>
                    {/if}
                  </div>

                  {#if advisor}
                    <p class="mt-2 text-xs text-cream-500">
                      Linked to {advisor.name}
                    </p>
                  {/if}
                </div>

                <!-- Actions -->
                <div class="px-4 py-3 border-t border-cream-200 flex items-center justify-between bg-cream-50 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="flex items-center gap-1">
                    {#if doc.mimeType.includes('pdf') || doc.mimeType.startsWith('image/')}
                      <button
                        class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                        onclick={() => openPreview(doc)}
                        title="Preview"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                    {/if}
                    <button
                      class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                      onclick={() => downloadDocument(doc)}
                      title="Download"
                    >
                      <Download class="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                    onclick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Upload Modal -->
  <Modal bind:open={uploadModalOpen} title="Upload Document" size="lg">
    <div class="space-y-4">
      <!-- Drop Zone -->
      <div
        class="border-2 border-dashed border-cream-400 rounded-xl p-8 text-center transition-colors
          {uploadFile ? 'border-emerald-500 bg-emerald-50' : 'hover:border-navy-500 hover:bg-cream-100'}"
        ondrop={handleDrop}
        ondragover={(e) => e.preventDefault()}
      >
        {#if uploadFile}
          <div class="flex items-center justify-center gap-3">
            <FileText class="w-8 h-8 text-emerald-600" />
            <div class="text-left">
              <p class="font-medium text-navy-800">{uploadFile.name}</p>
              <p class="text-sm text-cream-600">{formatFileSize(uploadFile.size)}</p>
            </div>
            <button
              class="p-1 rounded hover:bg-cream-200"
              onclick={() => (uploadFile = null)}
            >
              <X class="w-5 h-5 text-cream-600" />
            </button>
          </div>
        {:else}
          <Upload class="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p class="text-cream-700 mb-2">Drag and drop your file here, or</p>
          <label class="inline-block">
            <span class="btn btn-secondary cursor-pointer">Browse Files</span>
            <input
              type="file"
              class="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onchange={handleFileSelect}
            />
          </label>
          <p class="text-xs text-cream-500 mt-3">
            PDF, Word, Excel, or images up to 50MB
          </p>
        {/if}
      </div>

      <Select
        label="Folder"
        bind:value={uploadFormData.folder}
        options={folderOptions}
        placeholder="Select folder"
        required
      />

      <Select
        label="Linked Advisor (optional)"
        bind:value={uploadFormData.advisorId}
        options={[
          { value: '', label: 'None' },
          ...advisors.map(a => ({ value: a.id, label: a.name }))
        ]}
      />

      <Input
        label="Tags (comma-separated)"
        bind:value={uploadFormData.tags}
        placeholder="tax, 2024, important"
      />

      <div>
        <label class="label">Notes</label>
        <textarea
          bind:value={uploadFormData.notes}
          placeholder="Add notes about this document..."
          rows="2"
          class="input"
        ></textarea>
      </div>
    </div>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => { uploadModalOpen = false; resetUploadForm(); }}>
        Cancel
      </Button>
      <Button onclick={handleUpload} loading={uploading} disabled={!uploadFile}>
        <Upload class="w-4 h-4" />
        Upload
      </Button>
    {/snippet}
  </Modal>

  <!-- Preview Modal -->
  <Modal bind:open={previewModalOpen} title={previewDocument?.filename || 'Document Preview'} size="xl">
    {#if previewDocument}
      <div class="aspect-[4/3] bg-cream-100 rounded-lg overflow-hidden">
        {#if previewDocument.mimeType.startsWith('image/')}
          <img
            src={previewDocument.downloadUrl}
            alt={previewDocument.filename}
            class="w-full h-full object-contain"
          />
        {:else if previewDocument.mimeType.includes('pdf')}
          <iframe
            src={previewDocument.downloadUrl}
            title={previewDocument.filename}
            class="w-full h-full"
          ></iframe>
        {/if}
      </div>
    {/if}

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (previewModalOpen = false)}>Close</Button>
      {#if previewDocument}
        <Button onclick={() => downloadDocument(previewDocument!)}>
          <Download class="w-4 h-4" />
          Download
        </Button>
      {/if}
    {/snippet}
  </Modal>
</AppShell>
