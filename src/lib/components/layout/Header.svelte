<script lang="ts">
  import { Menu, Bell, Search, LogOut, User, CreditCard } from 'lucide-svelte';
  import { uiStore } from '$lib/stores/ui';
  import { authStore, currentUser } from '$lib/stores/auth';
  import { signOut } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';
  import { Avatar } from '$lib/components/ui';
  import { error } from '$lib/stores/ui';

  interface Props {
    title?: string;
  }

  let { title }: Props = $props();

  const sidebarOpen = $derived($uiStore.sidebarOpen);
  const user = $derived($currentUser);

  let dropdownOpen = $state(false);

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

<header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-cream-300">
  <div class="flex items-center justify-between h-16 px-4 lg:px-6">
    <!-- Left side -->
    <div class="flex items-center gap-4">
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
        onclick={() => uiStore.toggleMobileMenu()}
      >
        <Menu class="w-5 h-5" />
      </button>

      {#if title}
        <h1 class="text-xl font-serif font-semibold text-navy-800">{title}</h1>
      {/if}
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-2">
      <!-- Search -->
      <button class="p-2 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200">
        <Search class="w-5 h-5" />
      </button>

      <!-- Notifications -->
      <button class="p-2 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200 relative">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
      </button>

      <!-- User menu -->
      <div class="relative">
        <button
          class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cream-200 transition-colors"
          onclick={toggleDropdown}
        >
          <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
          <span class="hidden sm:block text-sm font-medium text-navy-800 max-w-[120px] truncate">
            {user?.name || 'User'}
          </span>
        </button>

        {#if dropdownOpen}
          <!-- Backdrop -->
          <div
            class="fixed inset-0 z-40"
            onclick={closeDropdown}
            role="button"
            tabindex="-1"
            aria-label="Close menu"
          ></div>

          <!-- Dropdown -->
          <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-cream-300 shadow-soft-lg z-50 overflow-hidden">
            <div class="px-4 py-3 border-b border-cream-300">
              <p class="text-sm font-medium text-navy-800 truncate">{user?.name}</p>
              <p class="text-xs text-cream-600 truncate">{user?.email}</p>
            </div>

            <div class="py-1">
              <a
                href="/settings"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-cream-700 hover:bg-cream-100 hover:text-navy-800"
                onclick={closeDropdown}
              >
                <User class="w-4 h-4" />
                Profile Settings
              </a>

              <a
                href="/settings/billing"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-cream-700 hover:bg-cream-100 hover:text-navy-800"
                onclick={closeDropdown}
              >
                <CreditCard class="w-4 h-4" />
                Billing
              </a>
            </div>

            <div class="border-t border-cream-300 py-1">
              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
