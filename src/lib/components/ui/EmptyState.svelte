<script lang="ts">
  import type { Snippet, Component } from 'svelte';

  interface Props {
    icon?: Component<{ class?: string }>;
    title: string;
    description?: string;
    action?: Snippet;
  }

  let {
    icon,
    title,
    description,
    action
  }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  {#if icon}
    {@const Icon = icon}
    <div class="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
      <Icon class="w-8 h-8 text-cream-500" />
    </div>
  {/if}

  <h3 class="text-lg font-semibold text-navy-800 mb-1">{title}</h3>

  {#if description}
    <p class="text-cream-600 max-w-sm mb-6">{description}</p>
  {/if}

  {#if action}
    {@render action()}
  {/if}
</div>
