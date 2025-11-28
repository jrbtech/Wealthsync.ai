<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { notificationStore, unreadCount, type Notification } from '$lib/stores/notifications';
  import { currentFamily } from '$lib/stores/auth';
  import { getUpcomingDeadlines } from '$lib/firebase/services';
  import { formatDate } from '$lib/utils/format';
  import {
    Bell,
    X,
    Check,
    AlertTriangle,
    Calendar,
    Clock,
    ChevronRight,
    CheckCheck
  } from 'lucide-svelte';

  const family = $derived($currentFamily);
  const notifications = $derived($notificationStore.notifications);
  const unread = $derived($unreadCount);

  let open = $state(false);
  let loading = $state(false);

  onMount(() => {
    loadNotifications();

    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  });

  async function loadNotifications() {
    if (!family?.id) return;

    loading = true;
    try {
      const deadlines = await getUpcomingDeadlines(family.id, 20);
      notificationStore.generateDeadlineNotifications(deadlines);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      loading = false;
    }
  }

  function handleNotificationClick(notification: Notification) {
    notificationStore.markAsRead(notification.id);
    if (notification.link) {
      goto(notification.link);
    }
    open = false;
  }

  function getPriorityColor(priority: Notification['priority']): string {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-cream-100 text-cream-700 border-cream-200';
    }
  }

  function getIcon(notification: Notification) {
    if (notification.priority === 'urgent') return AlertTriangle;
    if (notification.type === 'deadline') return Calendar;
    return Clock;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-center')) {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="notification-center relative">
  <!-- Bell Button -->
  <button
    class="relative p-2 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200 transition-colors"
    onclick={(e) => { e.stopPropagation(); open = !open; }}
    aria-label="Notifications"
  >
    <Bell class="w-5 h-5" />
    {#if unread > 0}
      <span
        class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse"
      >
        {unread > 9 ? '9+' : unread}
      </span>
    {/if}
  </button>

  <!-- Dropdown Panel -->
  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-white rounded-xl shadow-lg border border-cream-200 overflow-hidden z-50"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-cream-200 bg-cream-50">
        <h3 class="font-semibold text-navy-800">Notifications</h3>
        <div class="flex items-center gap-2">
          {#if unread > 0}
            <button
              class="text-xs text-navy-600 hover:text-navy-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-cream-200 transition-colors"
              onclick={() => notificationStore.markAllAsRead()}
            >
              <CheckCheck class="w-3.5 h-3.5" />
              Mark all read
            </button>
          {/if}
          <button
            class="p-1 rounded hover:bg-cream-200 text-cream-600"
            onclick={() => (open = false)}
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto max-h-[380px]">
        {#if notifications.length === 0}
          <div class="py-12 px-4 text-center">
            <Bell class="w-10 h-10 text-cream-300 mx-auto mb-3" />
            <p class="text-cream-600 text-sm">No notifications</p>
            <p class="text-cream-500 text-xs mt-1">You're all caught up!</p>
          </div>
        {:else}
          {#each notifications as notification}
            {@const Icon = getIcon(notification)}
            <button
              class="w-full text-left px-4 py-3 border-b border-cream-100 hover:bg-cream-50 transition-colors flex items-start gap-3 {!notification.read ? 'bg-navy-50/50' : ''}"
              onclick={() => handleNotificationClick(notification)}
            >
              <div class="flex-shrink-0 mt-0.5">
                <div class="w-8 h-8 rounded-full {getPriorityColor(notification.priority)} flex items-center justify-center">
                  <Icon class="w-4 h-4" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm text-navy-800 truncate">
                    {notification.title}
                  </span>
                  {#if !notification.read}
                    <span class="w-2 h-2 bg-navy-600 rounded-full flex-shrink-0"></span>
                  {/if}
                </div>
                <p class="text-sm text-cream-600 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                {#if notification.deadline}
                  <p class="text-xs text-cream-500 mt-1">
                    Due: {formatDate(notification.deadline.dueDate)}
                  </p>
                {/if}
              </div>
              <ChevronRight class="w-4 h-4 text-cream-400 flex-shrink-0 mt-1" />
            </button>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      {#if notifications.length > 0}
        <div class="px-4 py-2 border-t border-cream-200 bg-cream-50">
          <a
            href="/deadlines"
            class="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center justify-center gap-1"
            onclick={() => (open = false)}
          >
            View all deadlines
            <ChevronRight class="w-4 h-4" />
          </a>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
