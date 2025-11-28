<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'navy' | 'gold' | 'emerald' | 'red' | 'gray' | 'blue' | 'purple' | 'orange' | 'cyan';
  type Size = 'sm' | 'md';

  interface Props {
    variant?: Variant;
    size?: Size;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'navy',
    size = 'sm',
    class: className = '',
    children
  }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    navy: 'bg-navy-100 text-navy-800',
    gold: 'bg-gold-100 text-gold-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    cyan: 'bg-cyan-100 text-cyan-800'
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
</script>

<span class="inline-flex items-center rounded-full font-medium {variantClasses[variant]} {sizeClasses[size]} {className}">
  {@render children()}
</span>
