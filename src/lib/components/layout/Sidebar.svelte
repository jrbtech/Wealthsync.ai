<script lang="ts">
  import { page } from '$app/stores';
  import { uiStore } from '$lib/stores/ui';
  import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    PieChart,
    MessageSquare,
    Sparkles,
    Settings,
    ChevronLeft,
    X
  } from 'lucide-svelte';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Advisors', href: '/advisors', icon: Users },
    { name: 'Deadlines', href: '/deadlines', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Wealth', href: '/wealth', icon: PieChart },
    { name: 'Meetings', href: '/meetings', icon: MessageSquare }
  ];

  const aiNavigation = [
    { name: 'AI Assistant', href: '/ai/summarize', icon: Sparkles }
  ];

  const sidebarOpen = $derived($uiStore.sidebarOpen);
  const mobileMenuOpen = $derived($uiStore.mobileMenuOpen);

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return $page.url.pathname === '/dashboard';
    }
    return $page.url.pathname.startsWith(href);
  }
</script>

<!-- Mobile backdrop -->
{#if mobileMenuOpen}
  <div
    class="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
    onclick={() => uiStore.closeMobileMenu()}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 z-50 h-full bg-white border-r border-cream-300 transition-all duration-300 flex flex-col
    {mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
    {sidebarOpen ? 'w-64' : 'w-20'}"
>
  <!-- Logo -->
  <div class="flex items-center justify-between h-16 px-4 border-b border-cream-300">
    {#if sidebarOpen}
      <a href="/dashboard" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
          <span class="text-gold-400 font-serif font-bold text-lg">W</span>
        </div>
        <span class="font-serif font-semibold text-navy-800 text-lg">WealthSync</span>
      </a>
    {:else}
      <a href="/dashboard" class="mx-auto">
        <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
          <span class="text-gold-400 font-serif font-bold text-lg">W</span>
        </div>
      </a>
    {/if}

    <!-- Mobile close button -->
    <button
      class="lg:hidden p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
      onclick={() => uiStore.closeMobileMenu()}
    >
      <X class="w-5 h-5" />
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-4 px-3">
    <ul class="space-y-1">
      {#each navigation as item}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              {isActive(item.href)
                ? 'bg-navy-800 text-white'
                : 'text-cream-700 hover:bg-cream-200 hover:text-navy-800'}"
            onclick={() => uiStore.closeMobileMenu()}
          >
            <svelte:component this={item.icon} class="w-5 h-5 flex-shrink-0" />
            {#if sidebarOpen}
              <span class="font-medium">{item.name}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    <!-- AI Section -->
    <div class="mt-6 pt-6 border-t border-cream-300">
      {#if sidebarOpen}
        <p class="px-3 mb-2 text-xs font-semibold text-cream-500 uppercase tracking-wider">AI Tools</p>
      {/if}
      <ul class="space-y-1">
        {#each aiNavigation as item}
          <li>
            <a
              href={item.href}
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                {isActive(item.href)
                  ? 'bg-gold-500 text-navy-900'
                  : 'text-cream-700 hover:bg-cream-200 hover:text-navy-800'}"
              onclick={() => uiStore.closeMobileMenu()}
            >
              <svelte:component this={item.icon} class="w-5 h-5 flex-shrink-0" />
              {#if sidebarOpen}
                <span class="font-medium">{item.name}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>

  <!-- Settings & Collapse -->
  <div class="border-t border-cream-300 p-3 space-y-1">
    <a
      href="/settings"
      class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
        {isActive('/settings')
          ? 'bg-navy-800 text-white'
          : 'text-cream-700 hover:bg-cream-200 hover:text-navy-800'}"
      onclick={() => uiStore.closeMobileMenu()}
    >
      <Settings class="w-5 h-5 flex-shrink-0" />
      {#if sidebarOpen}
        <span class="font-medium">Settings</span>
      {/if}
    </a>

    <!-- Collapse button (desktop only) -->
    <button
      class="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-cream-700 hover:bg-cream-200 hover:text-navy-800 w-full"
      onclick={() => uiStore.toggleSidebar()}
    >
      <ChevronLeft class="w-5 h-5 flex-shrink-0 transition-transform {sidebarOpen ? '' : 'rotate-180'}" />
      {#if sidebarOpen}
        <span class="font-medium">Collapse</span>
      {/if}
    </button>
  </div>
</aside>
