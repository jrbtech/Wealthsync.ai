<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'hover' | 'flat';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    class?: string;
    children: Snippet;
    header?: Snippet;
    footer?: Snippet;
  }

  let {
    variant = 'default',
    padding = 'md',
    class: className = '',
    children,
    header,
    footer
  }: Props = $props();

  const baseClasses = 'bg-white rounded-xl';

  const variantClasses: Record<string, string> = {
    default: 'border border-cream-300 shadow-soft',
    hover: 'border border-cream-300 shadow-soft transition-shadow hover:shadow-soft-lg',
    flat: 'border border-cream-300'
  };

  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
</script>

<div class="{baseClasses} {variantClasses[variant]} {className}">
  {#if header}
    <div class="px-6 py-4 border-b border-cream-300">
      {@render header()}
    </div>
  {/if}

  <div class={paddingClasses[padding]}>
    {@render children()}
  </div>

  {#if footer}
    <div class="px-6 py-4 border-t border-cream-300 bg-cream-100/50 rounded-b-xl">
      {@render footer()}
    </div>
  {/if}
</div>
