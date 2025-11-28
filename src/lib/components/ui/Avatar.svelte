<script lang="ts">
  import { getInitials } from '$lib/utils/format';

  interface Props {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
  }

  let {
    name,
    src,
    size = 'md',
    class: className = ''
  }: Props = $props();

  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const initials = $derived(getInitials(name));
  let imageError = $state(false);
</script>

<div class="relative inline-flex items-center justify-center rounded-full bg-navy-100 text-navy-700 font-medium overflow-hidden {sizeClasses[size]} {className}">
  {#if src && !imageError}
    <img
      {src}
      alt={name}
      class="w-full h-full object-cover"
      onerror={() => imageError = true}
    />
  {:else}
    <span>{initials}</span>
  {/if}
</div>
