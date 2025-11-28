<script lang="ts">
  import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-svelte';
  import { uiStore } from '$lib/stores/ui';
  import { fly, fade } from 'svelte/transition';

  const toast = $derived($uiStore.toast);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colorClasses = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-gold-50 border-gold-200 text-gold-800',
    info: 'bg-navy-50 border-navy-200 text-navy-800'
  };

  const iconColorClasses = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-gold-500',
    info: 'text-navy-500'
  };
</script>

{#if toast}
  <div
    class="fixed bottom-4 right-4 z-50 max-w-sm"
    transition:fly={{ y: 20, duration: 200 }}
  >
    <div class="flex items-start gap-3 px-4 py-3 rounded-lg border shadow-soft-lg {colorClasses[toast.type]}">
      <svelte:component this={icons[toast.type]} class="w-5 h-5 flex-shrink-0 mt-0.5 {iconColorClasses[toast.type]}" />

      <p class="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        type="button"
        class="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        onclick={() => uiStore.hideToast()}
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}
