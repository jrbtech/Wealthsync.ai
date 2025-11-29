<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Menu, Search, LogOut, User, CreditCard, Command } from 'lucide-svelte';
  import { uiStore } from '$lib/stores/ui';
  import { authStore, currentUser } from '$lib/stores/auth';
  import { signOut } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';
  import { Avatar, CommandPalette, NotificationCenter } from '$lib/components/ui';
  import { error } from '$lib/stores/ui';

  interface Props {
    title?: string;
    headerLeft?: Snippet;
  }

  let { title, headerLeft }: Props = $props();

  const sidebarOpen = $derived($uiStore.sidebarOpen);
  const user = $derived($currentUser);

  let dropdownOpen = $state(false);
  let searchOpen = $state(false);

  async function handleSignOut() {
    try {
      await signOut();
      authStore.reset();
      goto('/auth/login');
    } catch (err) {
      error('Failed to sign out');
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }
</script>

<header class="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-cream-300/50">
  <div class="flex items-center justify-between h-16 px-4 lg:px-8">
    <!-- Left side -->
    <div class="flex items-center gap-4">
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2.5 rounded-xl text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors"
        onclick={() => uiStore.toggleMobileMenu()}
      >
        <Menu class="w-5 h-5" />
      </button>

      {#if headerLeft}
        {@render headerLeft()}
      {/if}

      {#if title}
        <h1 class="text-xl font-semibold text-navy-900 tracking-tight">{title}</h1>
      {/if}
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-3">
      <!-- Search - Premium pill design -->
      <button
        class="flex items-center gap-2.5 px-4 py-2 rounded-full text-navy-500 hover:text-navy-900 bg-cream-100 hover:bg-cream-200 border border-cream-300/50 transition-all duration-200"
        onclick={() => searchOpen = true}
      >
        <Search class="w-4 h-4" />
        <span class="hidden md:inline text-sm">Search...</span>
        <kbd class="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 bg-white rounded-md text-xs font-mono text-navy-400 border border-cream-300">
          <Command class="w-3 h-3" />K
        </kbd>
      </button>

      <!-- Notifications -->
      <NotificationCenter />

      <!-- User menu - Premium design -->
      <div class="relative">
        <button
          class="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-cream-100 transition-all duration-200 border border-transparent hover:border-cream-300"
          onclick={toggleDropdown}
        >
          <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
          <span class="hidden sm:block text-sm font-medium text-navy-800 max-w-[120px] truncate">
            {user?.name || 'User'}
          </span>
        </button>

        {#if dropdownOpen}
          <!-- Backdrop -->
          <button
            type="button"
            class="fixed inset-0 z-40 cursor-default"
            onclick={closeDropdown}
            aria-label="Close menu"
          ></button>

          <!-- Dropdown - Premium glass effect -->
          <div class="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-cream-300/50 shadow-elevated z-50 overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-br from-navy-900 to-navy-950">
              <p class="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p class="text-xs text-navy-300 truncate mt-0.5">{user?.email}</p>
            </div>

            <div class="py-2 px-2">
              <a
                href="/settings"
                class="flex items-center gap-3 px-4 py-3 text-sm text-navy-700 hover:bg-cream-100 hover:text-navy-900 rounded-xl transition-colors"
                onclick={closeDropdown}
              >
                <User class="w-4 h-4" />
                Profile Settings
              </a>

              <a
                href="/settings/billing"
                class="flex items-center gap-3 px-4 py-3 text-sm text-navy-700 hover:bg-cream-100 hover:text-navy-900 rounded-xl transition-colors"
                onclick={closeDropdown}
              >
                <CreditCard class="w-4 h-4" />
                Billing
              </a>
            </div>

            <div class="border-t border-cream-200 p-2">
              <button
                class="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                onclick={handleSignOut}
              >
                <LogOut class="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<!-- Command Palette / Global Search -->
<CommandPalette bind:open={searchOpen} />
