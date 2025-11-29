<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Badge, Button, Spinner, Avatar } from '$lib/components/ui';
  import { NetWorthChart, AssetAllocationChart } from '$lib/components/charts';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import {
    getAdvisors,
    getUpcomingDeadlines,
    getRecentActivity,
    getEntities,
    getAssets,
    getLiabilities,
    getDocuments,
    getMeetings
  } from '$lib/firebase/services';
  import { formatCurrency, formatDate, formatRelativeDate, getDaysUntil, getDaysSince } from '$lib/utils/format';
  import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    Building,
    Sparkles,
    ChevronRight,
    BarChart3,
    PiggyBank,
    Shield
  } from 'lucide-svelte';
  import type { Advisor, Deadline, Activity, Entity, Asset, Liability } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS, DEADLINE_CATEGORY_LABELS, ASSET_CATEGORY_LABELS } from '$lib/types';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(true);
  let advisors = $state<Advisor[]>([]);
  let deadlines = $state<Deadline[]>([]);
  let activities = $state<Activity[]>([]);
  let totalNetWorth = $state(0);
  let totalAssets = $state(0);
  let totalLiabilities = $state(0);
  let netWorthChange = $state(2.3);
  let documentCount = $state(0);
  let meetingCount = $state(0);
  let entityCount = $state(0);

  // Chart data
  let netWorthHistory = $state<{ date: string; value: number }[]>([]);
  let assetAllocation = $state<{ category: string; value: number; color: string }[]>([]);

  const categoryColors: Record<string, string> = {
    cash: '#22c55e',
    investments: '#0f172a',
    real_estate: '#f59e0b',
    alternatives: '#8b5cf6',
    other: '#64748b'
  };

  onMount(async () => {
    if (!family?.id) return;

    try {
      const [advisorsData, deadlinesData, activityData, entitiesData, docsData, meetingsData] = await Promise.all([
        getAdvisors(family.id),
        getUpcomingDeadlines(family.id, 5),
        getRecentActivity(family.id, 10),
        getEntities(family.id),
        getDocuments(family.id),
        getMeetings(family.id)
      ]);

      advisors = advisorsData;
      deadlines = deadlinesData;
      activities = activityData;
      documentCount = docsData.length;
      meetingCount = meetingsData.length;
      entityCount = entitiesData.length;

      // Calculate net worth and asset allocation
      let total = 0;
      let assets = 0;
      let liabilities = 0;
      const allocationMap: Record<string, number> = {};

      for (const entity of entitiesData) {
        const [entityAssets, entityLiabilities] = await Promise.all([
          getAssets(family.id, entity.id),
          getLiabilities(family.id, entity.id)
        ]);

        const assetTotal = entityAssets.reduce((sum, a) => sum + a.value, 0);
        const liabilityTotal = entityLiabilities.reduce((sum, l) => sum + l.balance, 0);
        total += assetTotal - liabilityTotal;
        assets += assetTotal;
        liabilities += liabilityTotal;

        // Build allocation
        for (const asset of entityAssets) {
          allocationMap[asset.category] = (allocationMap[asset.category] || 0) + asset.value;
        }
      }

      totalNetWorth = total;
      totalAssets = assets;
      totalLiabilities = liabilities;

      // Convert allocation to chart format
      assetAllocation = Object.entries(allocationMap)
        .map(([category, value]) => ({
          category: ASSET_CATEGORY_LABELS[category as keyof typeof ASSET_CATEGORY_LABELS] || category,
          value,
          color: categoryColors[category] || '#8b8680'
        }))
        .sort((a, b) => b.value - a.value);

      // Generate mock net worth history (would come from snapshots in production)
      const now = new Date();
      netWorthHistory = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (11 - i));
        const variance = (Math.random() - 0.3) * 0.1;
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: total * (0.85 + (i / 11) * 0.15 + variance)
        };
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      loading = false;
    }
  });

  function getDeadlineStatus(deadline: Deadline): { color: string; label: string; icon: any } {
    const days = getDaysUntil(deadline.dueDate);
    if (days === null) return { color: 'gray', label: 'Unknown', icon: Clock };
    if (deadline.status === 'completed') return { color: 'emerald', label: 'Completed', icon: CheckCircle };
    if (days < 0) return { color: 'red', label: 'Overdue', icon: AlertCircle };
    if (days <= 7) return { color: 'orange', label: `${days}d left`, icon: AlertCircle };
    return { color: 'navy', label: `${days}d`, icon: Clock };
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
      case 'meeting_logged':
        return MessageSquare;
      default:
        return Clock;
    }
  }

  const greeting = $derived(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const overdueCount = $derived(deadlines.filter(d => {
    const days = getDaysUntil(d.dueDate);
    return days !== null && days < 0 && d.status !== 'completed';
  }).length);

  const needsAttentionAdvisors = $derived(advisors.filter(a => {
    const days = a.lastContactDate ? getDaysSince(a.lastContactDate) : null;
    return days !== null && days > 60;
  }));
</script>

<svelte:head>
  <title>Dashboard - WealthSync.ai</title>
</svelte:head>

<AppShell>
  {#if loading}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <Spinner size="lg" />
        <p class="mt-4 text-cream-600">Loading your dashboard...</p>
      </div>
    </div>
  {:else}
    <!-- Welcome Section - Premium Design -->
    <div class="mb-10">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p class="text-sm font-medium text-accent-600 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 class="text-3xl lg:text-4xl font-bold text-navy-900 tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p class="text-navy-500 mt-2 text-lg">
            Here's your {family?.name || 'family office'} overview.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Button href="/ai/summarize" variant="secondary">
            <Sparkles class="w-4 h-4" />
            AI Assistant
          </Button>
          <Button href="/wealth" variant="primary">
            <BarChart3 class="w-4 h-4" />
            Full Report
          </Button>
        </div>
      </div>

      <!-- Alerts - Premium Design -->
      {#if overdueCount > 0 || needsAttentionAdvisors.length > 0}
        <div class="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-2xl">
          <div class="flex items-start gap-4">
            <div class="p-2.5 bg-orange-100 rounded-xl">
              <AlertCircle class="w-5 h-5 text-orange-600" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-orange-900">Needs Your Attention</h4>
              <ul class="mt-2 text-sm text-orange-800 space-y-1.5">
                {#if overdueCount > 0}
                  <li class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <a href="/deadlines?filter=overdue" class="hover:underline font-medium">
                      {overdueCount} overdue deadline{overdueCount > 1 ? 's' : ''}
                    </a>
                  </li>
                {/if}
                {#if needsAttentionAdvisors.length > 0}
                  <li class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <a href="/advisors" class="hover:underline font-medium">
                      {needsAttentionAdvisors.length} advisor{needsAttentionAdvisors.length > 1 ? 's' : ''} not contacted in 60+ days
                    </a>
                  </li>
                {/if}
              </ul>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Net Worth Hero Card -->
    <div class="bg-navy-900 text-white rounded-2xl mb-10 p-8 lg:p-10">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <p class="text-navy-400 text-sm font-medium uppercase tracking-wider mb-2">Total Net Worth</p>
          <p class="text-4xl lg:text-5xl font-bold tracking-tight" style="font-variant-numeric: tabular-nums;">
            {formatCurrency(totalNetWorth)}
          </p>
          <div class="flex items-center gap-4 mt-4">
            {#if netWorthChange > 0}
              <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg">
                <ArrowUpRight class="w-4 h-4 text-emerald-400" />
                <span class="text-sm font-medium text-emerald-400">+{netWorthChange}%</span>
              </div>
            {:else}
              <div class="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-lg">
                <ArrowDownRight class="w-4 h-4 text-red-400" />
                <span class="text-sm font-medium text-red-400">{netWorthChange}%</span>
              </div>
            {/if}
            <span class="text-sm text-navy-400">vs last month</span>
          </div>
        </div>

        <div class="flex gap-10">
          <div>
            <p class="text-sm text-navy-400 mb-1">Total Assets</p>
            <p class="text-2xl font-bold text-emerald-400" style="font-variant-numeric: tabular-nums;">
              {formatCurrency(totalAssets, { compact: true })}
            </p>
          </div>
          <div>
            <p class="text-sm text-navy-400 mb-1">Total Liabilities</p>
            <p class="text-2xl font-bold text-red-400" style="font-variant-numeric: tabular-nums;">
              {formatCurrency(totalLiabilities, { compact: true })}
            </p>
          </div>
          <div>
            <p class="text-sm text-navy-400 mb-1">Entities</p>
            <p class="text-2xl font-bold text-white">{entityCount}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid - Premium Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <a href="/advisors" class="group">
        <div class="h-full bg-white rounded-2xl border border-cream-200 p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
              <Users class="w-5 h-5 text-blue-600" />
            </div>
            <ChevronRight class="w-4 h-4 text-cream-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p class="text-3xl font-bold text-navy-900">{advisors.length}</p>
          <p class="text-sm text-navy-500 mt-1">Advisors</p>
        </div>
      </a>

      <a href="/deadlines" class="group">
        <div class="h-full bg-white rounded-2xl border border-cream-200 p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-orange-200">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl group-hover:from-orange-100 group-hover:to-orange-200 transition-colors">
              <Calendar class="w-5 h-5 text-orange-600" />
            </div>
            <ChevronRight class="w-4 h-4 text-cream-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p class="text-3xl font-bold text-navy-900">{deadlines.length}</p>
          <p class="text-sm text-navy-500 mt-1">Deadlines</p>
        </div>
      </a>

      <a href="/documents" class="group">
        <div class="h-full bg-white rounded-2xl border border-cream-200 p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-emerald-200">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors">
              <FileText class="w-5 h-5 text-emerald-600" />
            </div>
            <ChevronRight class="w-4 h-4 text-cream-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p class="text-3xl font-bold text-navy-900">{documentCount}</p>
          <p class="text-sm text-navy-500 mt-1">Documents</p>
        </div>
      </a>

      <a href="/meetings" class="group">
        <div class="h-full bg-white rounded-2xl border border-cream-200 p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-purple-200">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl group-hover:from-purple-100 group-hover:to-purple-200 transition-colors">
              <MessageSquare class="w-5 h-5 text-purple-600" />
            </div>
            <ChevronRight class="w-4 h-4 text-cream-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p class="text-3xl font-bold text-navy-900">{meetingCount}</p>
          <p class="text-sm text-navy-500 mt-1">Meetings</p>
        </div>
      </a>
    </div>

    <!-- Charts Row - Premium Design -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      <!-- Net Worth Trend -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl border border-cream-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-semibold text-navy-900 text-lg">Net Worth Trend</h3>
              <p class="text-sm text-navy-500 mt-0.5">Last 12 months performance</p>
            </div>
            <Button href="/wealth" variant="ghost" size="sm">
              View Details
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
          {#if netWorthHistory.length > 0}
            <NetWorthChart data={netWorthHistory} height={280} />
          {:else}
            <div class="h-[280px] flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 rounded-2xl border border-cream-200">
              <div class="text-center">
                <div class="w-16 h-16 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 class="w-8 h-8 text-cream-500" />
                </div>
                <p class="text-navy-600 font-medium">No data yet</p>
                <p class="text-sm text-navy-400 mt-1">Add assets to see trends</p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Asset Allocation -->
      <div>
        <div class="bg-white rounded-2xl border border-cream-200 p-6 h-full">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-semibold text-navy-900 text-lg">Allocation</h3>
              <p class="text-sm text-navy-500 mt-0.5">By asset category</p>
            </div>
          </div>
          {#if assetAllocation.length > 0}
            <AssetAllocationChart data={assetAllocation} height={180} />
            <div class="mt-6 space-y-3">
              {#each assetAllocation.slice(0, 4) as item}
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" style="background-color: {item.color}"></div>
                    <span class="text-sm text-navy-700">{item.category}</span>
                  </div>
                  <span class="text-sm font-semibold text-navy-900">
                    {formatCurrency(item.value, { compact: true })}
                  </span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="h-[180px] flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 rounded-2xl border border-cream-200">
              <div class="text-center">
                <div class="w-14 h-14 bg-cream-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiggyBank class="w-7 h-7 text-cream-500" />
                </div>
                <p class="text-navy-600 font-medium">No assets</p>
                <p class="text-sm text-navy-400 mt-1">Add assets to see allocation</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upcoming Deadlines -->
      <div class="lg:col-span-2">
        <Card padding="none">
          {#snippet header()}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-navy-800">Upcoming Deadlines</h3>
                {#if overdueCount > 0}
                  <Badge variant="red">{overdueCount} overdue</Badge>
                {/if}
              </div>
              <Button href="/deadlines" variant="ghost" size="sm">
                View All
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          {/snippet}

          {#if deadlines.length === 0}
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar class="w-8 h-8 text-cream-400" />
              </div>
              <h4 class="font-medium text-navy-800 mb-1">No upcoming deadlines</h4>
              <p class="text-cream-600 text-sm mb-4">Stay on top of important dates by adding deadlines</p>
              <Button href="/deadlines?new=true" variant="secondary" size="sm">
                <Plus class="w-4 h-4" />
                Add Deadline
              </Button>
            </div>
          {:else}
            <div class="divide-y divide-cream-200">
              {#each deadlines as deadline}
                {@const status = getDeadlineStatus(deadline)}
                {@const StatusIcon = status.icon}
                <a
                  href="/deadlines?id={deadline.id}"
                  class="flex items-center gap-4 p-4 hover:bg-cream-50 transition-colors"
                >
                  <div class="flex-shrink-0">
                    <div class="w-14 h-14 rounded-xl bg-cream-100 flex flex-col items-center justify-center">
                      <span class="text-xs text-cream-600 uppercase font-medium">
                        {formatDate(deadline.dueDate, 'MMM')}
                      </span>
                      <span class="text-xl font-bold text-navy-800">
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
                  <Badge variant={status.color as any}>
                    <StatusIcon class="w-3 h-3" />
                    {status.label}
                  </Badge>
                </a>
              {/each}
            </div>
          {/if}
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Advisors -->
        <Card padding="none">
          {#snippet header()}
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-navy-800">Your Advisors</h3>
              <Button href="/advisors" variant="ghost" size="sm">
                View All
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          {/snippet}

          {#if advisors.length === 0}
            <div class="p-6 text-center">
              <div class="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users class="w-6 h-6 text-cream-400" />
              </div>
              <p class="text-cream-600 text-sm mb-3">Add your first advisor</p>
              <Button href="/advisors?new=true" variant="secondary" size="sm">
                <Plus class="w-4 h-4" />
                Add Advisor
              </Button>
            </div>
          {:else}
            <div class="divide-y divide-cream-200">
              {#each advisors.slice(0, 4) as advisor}
                {@const daysSinceContact = advisor.lastContactDate ? getDaysSince(advisor.lastContactDate) : null}
                <a
                  href="/advisors/{advisor.id}"
                  class="flex items-center gap-3 p-3 hover:bg-cream-50 transition-colors"
                >
                  <Avatar name={advisor.name} size="sm" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-navy-800 truncate text-sm">{advisor.name}</p>
                    <p class="text-xs text-cream-600 truncate">
                      {ADVISOR_SPECIALTY_LABELS[advisor.specialty]}
                    </p>
                  </div>
                  {#if daysSinceContact !== null && daysSinceContact > 60}
                    <div class="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                      <AlertCircle class="w-3 h-3 text-orange-600" />
                      <span class="text-xs text-orange-700">{daysSinceContact}d</span>
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          {/if}
        </Card>

        <!-- Recent Activity -->
        <Card padding="none">
          {#snippet header()}
            <h3 class="font-semibold text-navy-800">Recent Activity</h3>
          {/snippet}

          {#if activities.length === 0}
            <div class="p-6 text-center">
              <Clock class="w-8 h-8 text-cream-400 mx-auto mb-2" />
              <p class="text-cream-600 text-sm">No recent activity</p>
            </div>
          {:else}
            <div class="divide-y divide-cream-200 max-h-[300px] overflow-y-auto">
              {#each activities.slice(0, 8) as activity}
                {@const ActivityIcon = getActivityIcon(activity.type)}
                <div class="flex items-start gap-3 p-3">
                  <div class="flex-shrink-0 p-1.5 bg-cream-100 rounded-lg mt-0.5">
                    <ActivityIcon class="w-3.5 h-3.5 text-cream-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-navy-800 line-clamp-2">{activity.description}</p>
                    <p class="text-xs text-cream-500 mt-0.5">{formatRelativeDate(activity.createdAt)}</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card>

        <!-- Quick Actions -->
        <div class="bg-navy-900 rounded-2xl p-6">
          <h3 class="font-semibold text-white mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <a href="/advisors?new=true" class="flex items-center gap-3 px-4 py-3 rounded-xl text-navy-300 hover:text-white hover:bg-white/10 transition-colors">
              <Users class="w-4 h-4" />
              <span class="text-sm font-medium">Add Advisor</span>
            </a>
            <a href="/deadlines?new=true" class="flex items-center gap-3 px-4 py-3 rounded-xl text-navy-300 hover:text-white hover:bg-white/10 transition-colors">
              <Calendar class="w-4 h-4" />
              <span class="text-sm font-medium">Add Deadline</span>
            </a>
            <a href="/documents?upload=true" class="flex items-center gap-3 px-4 py-3 rounded-xl text-navy-300 hover:text-white hover:bg-white/10 transition-colors">
              <FileText class="w-4 h-4" />
              <span class="text-sm font-medium">Upload Document</span>
            </a>
            <a href="/meetings?new=true" class="flex items-center gap-3 px-4 py-3 rounded-xl text-navy-300 hover:text-white hover:bg-white/10 transition-colors">
              <MessageSquare class="w-4 h-4" />
              <span class="text-sm font-medium">Log Meeting</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</AppShell>
