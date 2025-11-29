<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'accent';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    class?: string;
    children: Snippet;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    href,
    class: className = '',
    children,
    onclick
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-navy-800 text-white hover:bg-navy-700 focus:ring-navy-500',
    secondary: 'bg-cream-100 text-navy-800 border border-cream-400 hover:bg-cream-300 focus:ring-navy-500',
    gold: 'bg-gold-500 text-navy-900 hover:bg-gold-400 focus:ring-gold-500',
    ghost: 'bg-transparent text-navy-700 hover:bg-cream-300 focus:ring-navy-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500'
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`);
</script>

{#if href && !disabled}
  <a {href} class={classes}>
    {#if loading}
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children()}
  </a>
{:else}
  <button
    {type}
    class={classes}
    disabled={disabled || loading}
    onclick={onclick}
  >
    {#if loading}
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {@render children()}
  </button>
{/if}
