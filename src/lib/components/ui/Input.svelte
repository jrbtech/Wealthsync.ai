<script lang="ts">
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time';
    name?: string;
    id?: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    autocomplete?: AutoFill;
    class?: string;
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onblur?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  }

  let {
    type = 'text',
    name,
    id,
    value = $bindable(''),
    placeholder,
    label,
    error,
    hint,
    disabled = false,
    required = false,
    autocomplete,
    class: className = '',
    oninput,
    onblur
  }: Props = $props();

  const inputId = id || name || Math.random().toString(36).substr(2, 9);
</script>

<div class="w-full">
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-navy-700 mb-1.5">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    {name}
    id={inputId}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {autocomplete}
    {oninput}
    {onblur}
    class="block w-full rounded-lg border bg-white px-4 py-2.5 text-navy-800 placeholder-cream-600 transition-colors focus:ring-2 focus:outline-none {error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-cream-400 focus:border-navy-500 focus:ring-navy-500/20'} disabled:bg-cream-200 disabled:cursor-not-allowed {className}"
  />

  {#if error}
    <p class="mt-1.5 text-sm text-red-600">{error}</p>
  {:else if hint}
    <p class="mt-1.5 text-sm text-cream-600">{hint}</p>
  {/if}
</div>
