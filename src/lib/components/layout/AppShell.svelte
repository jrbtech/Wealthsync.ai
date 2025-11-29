<script lang="ts">
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { uiStore } from '$lib/stores/ui';
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import { Toast } from '$lib/components/ui';
  import { useNavigationShortcuts } from '$lib/hooks';

  interface Props {
    title?: string;
    headerLeft?: Snippet;
    children: Snippet;
  }

  let { title, headerLeft, children }: Props = $props();

  const sidebarOpen = $derived($uiStore.sidebarOpen);

  // Enable global navigation shortcuts (g + key)
  useNavigationShortcuts(goto);
</script>

<div class="min-h-screen bg-cream-200">
  <Sidebar />

  <div class="transition-all duration-300 lg:{sidebarOpen ? 'ml-64' : 'ml-20'}">
    <Header {title} {headerLeft} />

    <main class="p-4 lg:p-6">
      {@render children()}
    </main>
  </div>

  <Toast />
</div>

<style>
  @media (min-width: 1024px) {
    div:has(> main) {
      margin-left: var(--sidebar-width, 16rem);
    }
  }
</style>
