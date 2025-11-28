<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Badge, Button, Spinner, Avatar } from '$lib/components/ui';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import {
    getAdvisors,
    getUpcomingDeadlines,
    getRecentActivity,
    getEntities,
    getAssets,
    getLiabilities
  } from '$lib/firebase/services';
  import { formatCurrency, formatDate, formatRelativeDate, getDaysUntil, getDaysSince } from '$lib/utils/format';
  import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    AlertCircle
  } from 'lucide-svelte';
  import type { Advisor, Deadline, Activity, Entity, Asset, Liability } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS, DEADLINE_CATEGORY_LABELS } from '$lib/types';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(true);
  let advisors = $state<Advisor[]>([]);
  let deadlines = $state<Deadline[]>([]);
  let activities = $state<Activity[]>([]);
  let totalNetWorth = $state(0);
  let netWorthChange = $state(0);

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [advisorsData, deadlinesData, activityData, entitiesData] = await Promise.all([
        getAdvisors(family.id),
        getUpcomingDeadlines(family.id, 5),
        getRecentActivity(family.id, 10),
        getEntities(family.id)
      ]);

      advisors = advisorsData;
      deadlines = deadlinesData;
      activities = activityData;

      // Calculate net worth
      let total = 0;
      for (const entity of entitiesData) {
        const [assets, liabilities] = await Promise.all([
          getAssets(family.id, entity.id),
          getLiabilities(family.id, entity.id)
        ]);

        const assetTotal = assets.reduce((sum, a) => sum + a.value, 0);
        const liabilityTotal = liabilities.reduce((sum, l) => sum + l.balance, 0);
        total += assetTotal - liabilityTotal;
      }

      totalNetWorth = total;
      // Placeholder for now - would compare to previous snapshot
      netWorthChange = 2.3;
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      loading = false;
    }
  });

  function getDeadlineStatus(deadline: Deadline): { color: string; label: string } {
    const days = getDaysUntil(deadline.dueDate);
    if (days === null) return { color: 'gray', label: 'Unknown' };
    if (deadline.status === 'completed') return { color: 'emerald', label: 'Completed' };
    if (days < 0) return { color: 'red', label: 'Overdue' };
    if (days <= 7) return { color: 'orange', label: 'Due Soon' };
    return { color: 'navy', label: 'Upcoming' };
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'advisor_added':
      case 'advisor_updated':
        return Users;
      case 'deadline_created':
      case 'deadline_completed':
        return Calendar;
      case 'document_uploaded':
        return FileText;
      default:
        return Clock;
    }
  }
</script>

<svelte:head>
  <title>Dashboard - WealthSync</title>
</svelte:head>

<AppShell title="Dashboard">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Welcome Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-serif font-semibold text-navy-800 mb-1">
        Welcome back, {user?.name?.split(' ')[0] || 'there'}
      </h2>
      <p class="text-cream-600">
        Here's what's happening with {family?.name || 'your family office'}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Net Worth -->
      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-cream-600 mb-1">Total Net Worth</p>
            <p class="text-2xl font-semibold font-mono text-navy-800">
              {formatCurrency(totalNetWorth, { compact: true })}
            </p>
            {#if netWorthChange !== 0}
              <div class="flex items-center gap-1 mt-1">
                {#if netWorthChange > 0}
                  <ArrowUpRight class="w-4 h-4 text-emerald-600" />
                  <span class="text-sm text-emerald-600">+{netWorthChange}%</span>
                {:else}
                  <ArrowDownRight class="w-4 h-4 text-red-600" />
                  <span class="text-sm text-red-600">{netWorthChange}%</span>
                {/if}
                <span class="text-xs text-cream-500">vs last month</span>
              </div>
            {/if}
          </div>
          <div class="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp class="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </Card>

      <!-- Advisors -->
      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-cream-600 mb-1">Advisors</p>
            <p class="text-2xl font-semibold text-navy-800">{advisors.length}</p>
            <p class="text-xs text-cream-500 mt-1">Active team members</p>
          </div>
          <div class="p-2 bg-navy-100 rounded-lg">
            <Users class="w-5 h-5 text-navy-600" />
          </div>
        </div>
      </Card>

      <!-- Upcoming Deadlines -->
      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-cream-600 mb-1">Upcoming Deadlines</p>
            <p class="text-2xl font-semibold text-navy-800">{deadlines.length}</p>
            <p class="text-xs text-cream-500 mt-1">In the next 30 days</p>
          </div>
          <div class="p-2 bg-gold-100 rounded-lg">
            <Calendar class="w-5 h-5 text-gold-600" />
          </div>
        </div>
      </Card>

      <!-- Quick Add -->
      <Card class="bg-navy-800 text-white border-navy-700">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-navy-200 mb-1">Quick Actions</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <Button href="/advisors?new=true" size="sm" variant="gold">
                <Plus class="w-4 h-4" />
                Advisor
              </Button>
              <Button href="/deadlines?new=true" size="sm" variant="secondary">
                <Plus class="w-4 h-4" />
                Deadline
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upcoming Deadlines -->
      <div class="lg:col-span-2">
        <Card padding="none">
          {#snippet header()}
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-navy-800">Upcoming Deadlines</h3>
              <Button href="/deadlines" variant="ghost" size="sm">View All</Button>
            </div>
          {/snippet}

          {#if deadlines.length === 0}
            <div class="p-6 text-center">
              <Calendar class="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p class="text-cream-600">No upcoming deadlines</p>
              <Button href="/deadlines?new=true" variant="secondary" size="sm" class="mt-3">
                <Plus class="w-4 h-4" />
                Add Deadline
              </Button>
            </div>
          {:else}
            <div class="divide-y divide-cream-200">
              {#each deadlines as deadline}
                {@const status = getDeadlineStatus(deadline)}
                <a
                  href="/deadlines?id={deadline.id}"
                  class="flex items-center gap-4 p-4 hover:bg-cream-100 transition-colors"
                >
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-lg bg-cream-100 flex flex-col items-center justify-center">
                      <span class="text-xs text-cream-600 uppercase">
                        {formatDate(deadline.dueDate, 'MMM')}
                      </span>
                      <span class="text-lg font-semibold text-navy-800">
                        {formatDate(deadline.dueDate, 'd')}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-navy-800 truncate">{deadline.title}</p>
                    <p class="text-sm text-cream-600">
                      {DEADLINE_CATEGORY_LABELS[deadline.category]}
                    </p>
                  </div>
                  <Badge variant={status.color as any}>{status.label}</Badge>
                </a>
              {/each}
            </div>
          {/if}
        </Card>
      </div>

      <!-- Advisors Overview -->
      <div>
        <Card padding="none">
          {#snippet header()}
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-navy-800">Advisors</h3>
              <Button href="/advisors" variant="ghost" size="sm">View All</Button>
            </div>
          {/snippet}

          {#if advisors.length === 0}
            <div class="p-6 text-center">
              <Users class="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p class="text-cream-600">No advisors yet</p>
              <Button href="/advisors?new=true" variant="secondary" size="sm" class="mt-3">
                <Plus class="w-4 h-4" />
                Add Advisor
              </Button>
            </div>
          {:else}
            <div class="divide-y divide-cream-200">
              {#each advisors.slice(0, 5) as advisor}
                {@const daysSinceContact = advisor.lastContactDate ? getDaysSince(advisor.lastContactDate) : null}
                <a
                  href="/advisors/{advisor.id}"
                  class="flex items-center gap-3 p-4 hover:bg-cream-100 transition-colors"
                >
                  <Avatar name={advisor.name} size="sm" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-navy-800 truncate">{advisor.name}</p>
                    <p class="text-sm text-cream-600 truncate">{advisor.firm}</p>
                  </div>
                  {#if daysSinceContact !== null && daysSinceContact > 30}
                    <div class="flex items-center gap-1 text-orange-600">
                      <AlertCircle class="w-4 h-4" />
                      <span class="text-xs">{daysSinceContact}d</span>
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          {/if}
        </Card>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-6">
      <Card padding="none">
        {#snippet header()}
          <h3 class="font-semibold text-navy-800">Recent Activity</h3>
        {/snippet}

        {#if activities.length === 0}
          <div class="p-6 text-center">
            <Clock class="w-12 h-12 text-cream-400 mx-auto mb-3" />
            <p class="text-cream-600">No recent activity</p>
          </div>
        {:else}
          <div class="divide-y divide-cream-200">
            {#each activities as activity}
              {@const Icon = getActivityIcon(activity.type)}
              <div class="flex items-center gap-4 p-4">
                <div class="flex-shrink-0 p-2 bg-cream-100 rounded-lg">
                  <svelte:component this={Icon} class="w-4 h-4 text-cream-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-navy-800">{activity.description}</p>
                  <p class="text-xs text-cream-500">{formatRelativeDate(activity.createdAt)}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    </div>
  {/if}
</AppShell>
