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
    X,
    Zap
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
  <button
    type="button"
    class="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden cursor-default"
    onclick={() => uiStore.closeMobileMenu()}
    aria-label="Close menu"
  ></button>
{/if}

<!-- Sidebar - Premium Dark Theme -->
<aside
  class="fixed top-0 left-0 z-50 h-full bg-navy-950 transition-all duration-300 ease-out flex flex-col
    {mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
    {sidebarOpen ? 'w-72' : 'w-20'}"
>
  <!-- Logo -->
  <div class="flex items-center justify-between h-18 px-5 border-b border-white/5">
    {#if sidebarOpen}
      <a href="/dashboard" class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/30 transition-shadow">
          <span class="text-navy-950 font-bold text-xl">W</span>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-white text-lg tracking-tight">WealthSync</span>
          <span class="text-[10px] text-accent-400 font-medium uppercase tracking-widest">Family Office</span>
        </div>
      </a>
    {:else}
      <a href="/dashboard" class="mx-auto group">
        <div class="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/30 transition-shadow">
          <span class="text-navy-950 font-bold text-xl">W</span>
        </div>
      </a>
    {/if}

    <!-- Mobile close button -->
    <button
      class="lg:hidden p-2 rounded-xl text-navy-400 hover:text-white hover:bg-white/5 transition-colors"
      onclick={() => uiStore.closeMobileMenu()}
    >
      <X class="w-5 h-5" />
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-6 px-4">
    <ul class="space-y-1.5">
      {#each navigation as item}
        {@const Icon = item.icon}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              {isActive(item.href)
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-navy-300 hover:bg-white/5 hover:text-white'}"
            onclick={() => uiStore.closeMobileMenu()}
          >
            <Icon class="w-5 h-5 flex-shrink-0 {isActive(item.href) ? 'text-accent-400' : ''}" />
            {#if sidebarOpen}
              <span class="font-medium">{item.name}</span>
            {/if}
            {#if isActive(item.href) && sidebarOpen}
              <div class="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400"></div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    <!-- AI Section -->
    <div class="mt-8 pt-6 border-t border-white/5">
      {#if sidebarOpen}
        <div class="px-4 mb-3 flex items-center gap-2">
          <Zap class="w-3.5 h-3.5 text-accent-400" />
          <span class="text-xs font-semibold text-navy-400 uppercase tracking-wider">AI Tools</span>
        </div>
      {/if}
      <ul class="space-y-1.5">
        {#each aiNavigation as item}
          {@const Icon = item.icon}
          <li>
            <a
              href={item.href}
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                {isActive(item.href)
                  ? 'bg-gradient-to-r from-accent-500/20 to-accent-600/10 text-accent-300 border border-accent-500/30'
                  : 'text-navy-300 hover:bg-white/5 hover:text-white'}"
              onclick={() => uiStore.closeMobileMenu()}
            >
              <Icon class="w-5 h-5 flex-shrink-0 {isActive(item.href) ? 'text-accent-400' : ''}" />
              {#if sidebarOpen}
                <span class="font-medium">{item.name}</span>
                {#if !isActive(item.href)}
                  <span class="ml-auto px-2 py-0.5 text-[10px] font-semibold bg-accent-500 text-navy-950 rounded-full">NEW</span>
                {/if}
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>

  <!-- Settings & Collapse -->
  <div class="border-t border-white/5 p-4 space-y-2">
    <a
      href="/settings"
      class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        {isActive('/settings')
          ? 'bg-white/10 text-white'
          : 'text-navy-300 hover:bg-white/5 hover:text-white'}"
      onclick={() => uiStore.closeMobileMenu()}
    >
      <Settings class="w-5 h-5 flex-shrink-0" />
      {#if sidebarOpen}
        <span class="font-medium">Settings</span>
      {/if}
    </a>

    <!-- Collapse button (desktop only) -->
    <button
      class="hidden lg:flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-navy-400 hover:bg-white/5 hover:text-white w-full"
      onclick={() => uiStore.toggleSidebar()}
    >
      <ChevronLeft class="w-5 h-5 flex-shrink-0 transition-transform duration-300 {sidebarOpen ? '' : 'rotate-180'}" />
      {#if sidebarOpen}
        <span class="font-medium">Collapse</span>
      {/if}
    </button>
  </div>
</aside>
