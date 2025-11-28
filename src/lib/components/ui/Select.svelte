<script lang="ts">
  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    name?: string;
    id?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
  }

  let {
    name,
    id,
    value = $bindable(''),
    options,
    placeholder,
    label,
    error,
    hint,
    disabled = false,
    required = false,
    class: className = '',
    onchange
  }: Props = $props();

  const selectId = id || name || Math.random().toString(36).substr(2, 9);
</script>

<div class="w-full">
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-navy-700 mb-1.5">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <select
    {name}
    id={selectId}
    bind:value
    {disabled}
    {required}
    {onchange}
    class="block w-full rounded-lg border bg-white px-4 py-2.5 text-navy-800 transition-colors focus:ring-2 focus:outline-none appearance-none bg-no-repeat {error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-cream-400 focus:border-navy-500 focus:ring-navy-500/20'} disabled:bg-cream-200 disabled:cursor-not-allowed {className}"
    style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%236b7280%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E'); background-position: right 0.75rem center; background-size: 1.25rem;"
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>

  {#if error}
    <p class="mt-1.5 text-sm text-red-600">{error}</p>
  {:else if hint}
    <p class="mt-1.5 text-sm text-cream-600">{hint}</p>
  {/if}
</div>
