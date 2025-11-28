<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Select, Modal, Badge, EmptyState, Spinner } from '$lib/components/ui';
  import { currentFamily, currentUser } from '$lib/stores/auth';
  import {
    getEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    getLiabilities,
    createLiability,
    updateLiability,
    deleteLiability,
    logActivity
  } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import { formatCurrency, formatDate, formatPercent } from '$lib/utils/format';
  import {
    Plus,
    Building,
    TrendingUp,
    TrendingDown,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Wallet,
    Home,
    PieChart,
    DollarSign
  } from 'lucide-svelte';
  import type { Entity, Asset, Liability, EntityType, AssetCategory, LiabilityCategory } from '$lib/types';
  import { ENTITY_TYPE_LABELS, ASSET_CATEGORY_LABELS, LIABILITY_CATEGORY_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);

  let loading = $state(true);

  interface EntityWithData extends Entity {
    assets: Asset[];
    liabilities: Liability[];
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    expanded: boolean;
  }

  let entities = $state<EntityWithData[]>([]);
  let totalNetWorth = $state(0);
  let totalAssets = $state(0);
  let totalLiabilities = $state(0);
  let assetsByCategory = $state<Record<string, number>>({});

  // Entity Modal
  let entityModalOpen = $state(false);
  let editingEntity = $state<Entity | null>(null);
  let entitySaving = $state(false);
  let entityFormData = $state({
    name: '',
    type: '' as EntityType | ''
  });

  // Asset Modal
  let assetModalOpen = $state(false);
  let selectedEntityId = $state('');
  let editingAsset = $state<Asset | null>(null);
  let assetSaving = $state(false);
  let assetFormData = $state({
    name: '',
    category: '' as AssetCategory | '',
    value: '',
    notes: ''
  });

  // Liability Modal
  let liabilityModalOpen = $state(false);
  let editingLiability = $state<Liability | null>(null);
  let liabilitySaving = $state(false);
  let liabilityFormData = $state({
    name: '',
    category: '' as LiabilityCategory | '',
    balance: '',
    notes: ''
  });

  const entityTypeOptions = Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const assetCategoryOptions = Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const liabilityCategoryOptions = Object.entries(LIABILITY_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const entityTypeColors: Record<EntityType, string> = {
    personal: 'blue',
    trust: 'purple',
    llc: 'emerald',
    foundation: 'gold',
    other: 'gray'
  };

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    if (!family?.id) return;

    loading = true;

    try {
      const entitiesData = await getEntities(family.id);

      const entitiesWithData: EntityWithData[] = await Promise.all(
        entitiesData.map(async (entity) => {
          const [assets, liabilities] = await Promise.all([
            getAssets(family.id, entity.id),
            getLiabilities(family.id, entity.id)
          ]);

          const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
          const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);

          return {
            ...entity,
            assets,
            liabilities,
            totalAssets,
            totalLiabilities,
            netWorth: totalAssets - totalLiabilities,
            expanded: false
          };
        })
      );

      entities = entitiesWithData;

      // Calculate totals
      totalAssets = entities.reduce((sum, e) => sum + e.totalAssets, 0);
      totalLiabilities = entities.reduce((sum, e) => sum + e.totalLiabilities, 0);
      totalNetWorth = totalAssets - totalLiabilities;

      // Calculate assets by category
      const byCategory: Record<string, number> = {};
      for (const entity of entities) {
        for (const asset of entity.assets) {
          byCategory[asset.category] = (byCategory[asset.category] || 0) + asset.value;
        }
      }
      assetsByCategory = byCategory;
    } catch (err) {
      showError('Failed to load wealth data');
    } finally {
      loading = false;
    }
  }

  // Entity functions
  function openEntityModal(entity?: Entity) {
    editingEntity = entity || null;
    entityFormData = entity
      ? { name: entity.name, type: entity.type }
      : { name: '', type: '' };
    entityModalOpen = true;
  }

  async function handleEntitySubmit() {
    if (!family?.id || !user?.id) return;

    if (!entityFormData.name || !entityFormData.type) {
      showError('Name and type are required');
      return;
    }

    entitySaving = true;

    try {
      if (editingEntity) {
        await updateEntity(family.id, editingEntity.id, entityFormData);
        success('Entity updated');
      } else {
        await createEntity(family.id, {
          ...entityFormData,
          type: entityFormData.type as EntityType,
          createdBy: user.id
        });
        success('Entity created');
      }

      await loadData();
      entityModalOpen = false;
    } catch (err) {
      showError('Failed to save entity');
    } finally {
      entitySaving = false;
    }
  }

  async function handleEntityDelete(entity: EntityWithData) {
    if (!family?.id) return;

    if (!confirm(`Delete "${entity.name}"? This will also delete all assets and liabilities.`)) {
      return;
    }

    try {
      await deleteEntity(family.id, entity.id);
      await loadData();
      success('Entity deleted');
    } catch (err) {
      showError('Failed to delete entity');
    }
  }

  // Asset functions
  function openAssetModal(entityId: string, asset?: Asset) {
    selectedEntityId = entityId;
    editingAsset = asset || null;
    assetFormData = asset
      ? { name: asset.name, category: asset.category, value: asset.value.toString(), notes: asset.notes }
      : { name: '', category: '', value: '', notes: '' };
    assetModalOpen = true;
  }

  async function handleAssetSubmit() {
    if (!family?.id || !selectedEntityId) return;

    if (!assetFormData.name || !assetFormData.category || !assetFormData.value) {
      showError('Name, category, and value are required');
      return;
    }

    assetSaving = true;

    try {
      const data = {
        name: assetFormData.name,
        category: assetFormData.category as AssetCategory,
        value: parseFloat(assetFormData.value),
        notes: assetFormData.notes,
        lastUpdated: new Date()
      };

      if (editingAsset) {
        await updateAsset(family.id, selectedEntityId, editingAsset.id, data);
        success('Asset updated');
      } else {
        await createAsset(family.id, selectedEntityId, data);
        success('Asset added');
      }

      await loadData();
      assetModalOpen = false;
    } catch (err) {
      showError('Failed to save asset');
    } finally {
      assetSaving = false;
    }
  }

  async function handleAssetDelete(entityId: string, asset: Asset) {
    if (!family?.id) return;

    if (!confirm(`Delete "${asset.name}"?`)) {
      return;
    }

    try {
      await deleteAsset(family.id, entityId, asset.id);
      await loadData();
      success('Asset deleted');
    } catch (err) {
      showError('Failed to delete asset');
    }
  }

  // Liability functions
  function openLiabilityModal(entityId: string, liability?: Liability) {
    selectedEntityId = entityId;
    editingLiability = liability || null;
    liabilityFormData = liability
      ? { name: liability.name, category: liability.category, balance: liability.balance.toString(), notes: liability.notes }
      : { name: '', category: '', balance: '', notes: '' };
    liabilityModalOpen = true;
  }

  async function handleLiabilitySubmit() {
    if (!family?.id || !selectedEntityId) return;

    if (!liabilityFormData.name || !liabilityFormData.category || !liabilityFormData.balance) {
      showError('Name, category, and balance are required');
      return;
    }

    liabilitySaving = true;

    try {
      const data = {
        name: liabilityFormData.name,
        category: liabilityFormData.category as LiabilityCategory,
        balance: parseFloat(liabilityFormData.balance),
        notes: liabilityFormData.notes,
        lastUpdated: new Date()
      };

      if (editingLiability) {
        await updateLiability(family.id, selectedEntityId, editingLiability.id, data);
        success('Liability updated');
      } else {
        await createLiability(family.id, selectedEntityId, data);
        success('Liability added');
      }

      await loadData();
      liabilityModalOpen = false;
    } catch (err) {
      showError('Failed to save liability');
    } finally {
      liabilitySaving = false;
    }
  }

  async function handleLiabilityDelete(entityId: string, liability: Liability) {
    if (!family?.id) return;

    if (!confirm(`Delete "${liability.name}"?`)) {
      return;
    }

    try {
      await deleteLiability(family.id, entityId, liability.id);
      await loadData();
      success('Liability deleted');
    } catch (err) {
      showError('Failed to delete liability');
    }
  }

  function toggleEntity(entityId: string) {
    entities = entities.map((e) =>
      e.id === entityId ? { ...e, expanded: !e.expanded } : e
    );
  }
</script>

<svelte:head>
  <title>Wealth Tracker - WealthSync</title>
</svelte:head>

<AppShell title="Wealth Tracker">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card class="bg-gradient-to-br from-navy-800 to-navy-900 text-white border-0">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-navy-200 text-sm">Total Net Worth</p>
            <p class="text-3xl font-semibold font-mono mt-1">
              {formatCurrency(totalNetWorth, { compact: true })}
            </p>
          </div>
          <div class="p-2 bg-white/10 rounded-lg">
            <PieChart class="w-6 h-6" />
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-cream-600 text-sm">Total Assets</p>
            <p class="text-2xl font-semibold font-mono text-emerald-600 mt-1">
              {formatCurrency(totalAssets, { compact: true })}
            </p>
          </div>
          <div class="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-cream-600 text-sm">Total Liabilities</p>
            <p class="text-2xl font-semibold font-mono text-red-600 mt-1">
              {formatCurrency(totalLiabilities, { compact: true })}
            </p>
          </div>
          <div class="p-2 bg-red-100 rounded-lg">
            <TrendingDown class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Asset Allocation -->
    {#if Object.keys(assetsByCategory).length > 0}
      <Card class="mb-8">
        <h3 class="font-semibold text-navy-800 mb-4">Asset Allocation</h3>
        <div class="space-y-3">
          {#each Object.entries(assetsByCategory).sort((a, b) => b[1] - a[1]) as [category, value]}
            {@const percentage = totalAssets > 0 ? (value / totalAssets) * 100 : 0}
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-cream-700">
                  {ASSET_CATEGORY_LABELS[category as AssetCategory] || category}
                </span>
                <span class="text-sm font-medium text-navy-800">
                  {formatCurrency(value, { compact: true })} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div class="h-2 bg-cream-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-navy-600 rounded-full transition-all duration-500"
                  style="width: {percentage}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}

    <!-- Entities -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-serif font-semibold text-navy-800">Entities</h2>
      <Button onclick={() => openEntityModal()}>
        <Plus class="w-4 h-4" />
        Add Entity
      </Button>
    </div>

    {#if entities.length === 0}
      <EmptyState
        icon={Building}
        title="No entities yet"
        description="Add your first entity to start tracking your wealth"
      >
        {#snippet action()}
          <Button onclick={() => openEntityModal()}>
            <Plus class="w-4 h-4" />
            Add Entity
          </Button>
        {/snippet}
      </EmptyState>
    {:else}
      <div class="space-y-4">
        {#each entities as entity}
          <Card padding="none">
            <!-- Entity Header -->
            <div class="flex items-center gap-4 p-4 hover:bg-cream-50 transition-colors">
              <button
                class="flex-shrink-0 flex items-center gap-4 flex-1 text-left"
                onclick={() => toggleEntity(entity.id)}
              >
                <div class="flex-shrink-0">
                  {#if entity.expanded}
                    <ChevronDown class="w-5 h-5 text-cream-600" />
                  {:else}
                    <ChevronRight class="w-5 h-5 text-cream-600" />
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-navy-800">{entity.name}</h3>
                    <Badge variant={entityTypeColors[entity.type] as any}>
                      {ENTITY_TYPE_LABELS[entity.type]}
                    </Badge>
                  </div>
                  <p class="text-sm text-cream-600 mt-0.5">
                    {entity.assets.length} assets • {entity.liabilities.length} liabilities
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-cream-600">Net Worth</p>
                  <p class="font-semibold font-mono {entity.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}">
                    {formatCurrency(entity.netWorth)}
                  </p>
                </div>
              </button>
              <div class="flex items-center gap-1">
                <button
                  class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200"
                  onclick={() => openEntityModal(entity)}
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  class="p-1.5 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                  onclick={() => handleEntityDelete(entity)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Expanded Content -->
            {#if entity.expanded}
              <div class="border-t border-cream-200">
                <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-cream-200">
                  <!-- Assets -->
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-navy-800 flex items-center gap-2">
                        <TrendingUp class="w-4 h-4 text-emerald-600" />
                        Assets
                        <span class="text-cream-500 font-normal">({formatCurrency(entity.totalAssets)})</span>
                      </h4>
                      <Button size="sm" variant="ghost" onclick={() => openAssetModal(entity.id)}>
                        <Plus class="w-4 h-4" />
                        Add
                      </Button>
                    </div>

                    {#if entity.assets.length === 0}
                      <p class="text-sm text-cream-500 py-4 text-center">No assets</p>
                    {:else}
                      <div class="space-y-2">
                        {#each entity.assets as asset}
                          <div class="flex items-center justify-between p-2 rounded-lg hover:bg-cream-100 group">
                            <div class="min-w-0">
                              <p class="text-sm font-medium text-navy-800 truncate">{asset.name}</p>
                              <p class="text-xs text-cream-500">{ASSET_CATEGORY_LABELS[asset.category]}</p>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-sm text-emerald-600">
                                {formatCurrency(asset.value)}
                              </span>
                              <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                <button
                                  class="p-1 rounded text-cream-500 hover:text-navy-800"
                                  onclick={() => openAssetModal(entity.id, asset)}
                                >
                                  <Pencil class="w-3 h-3" />
                                </button>
                                <button
                                  class="p-1 rounded text-cream-500 hover:text-red-600"
                                  onclick={() => handleAssetDelete(entity.id, asset)}
                                >
                                  <Trash2 class="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- Liabilities -->
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-medium text-navy-800 flex items-center gap-2">
                        <TrendingDown class="w-4 h-4 text-red-600" />
                        Liabilities
                        <span class="text-cream-500 font-normal">({formatCurrency(entity.totalLiabilities)})</span>
                      </h4>
                      <Button size="sm" variant="ghost" onclick={() => openLiabilityModal(entity.id)}>
                        <Plus class="w-4 h-4" />
                        Add
                      </Button>
                    </div>

                    {#if entity.liabilities.length === 0}
                      <p class="text-sm text-cream-500 py-4 text-center">No liabilities</p>
                    {:else}
                      <div class="space-y-2">
                        {#each entity.liabilities as liability}
                          <div class="flex items-center justify-between p-2 rounded-lg hover:bg-cream-100 group">
                            <div class="min-w-0">
                              <p class="text-sm font-medium text-navy-800 truncate">{liability.name}</p>
                              <p class="text-xs text-cream-500">{LIABILITY_CATEGORY_LABELS[liability.category]}</p>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="font-mono text-sm text-red-600">
                                {formatCurrency(liability.balance)}
                              </span>
                              <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                <button
                                  class="p-1 rounded text-cream-500 hover:text-navy-800"
                                  onclick={() => openLiabilityModal(entity.id, liability)}
                                >
                                  <Pencil class="w-3 h-3" />
                                </button>
                                <button
                                  class="p-1 rounded text-cream-500 hover:text-red-600"
                                  onclick={() => handleLiabilityDelete(entity.id, liability)}
                                >
                                  <Trash2 class="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </Card>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Entity Modal -->
  <Modal bind:open={entityModalOpen} title={editingEntity ? 'Edit Entity' : 'Add Entity'}>
    <form onsubmit={(e) => { e.preventDefault(); handleEntitySubmit(); }} class="space-y-4">
      <Input
        label="Entity Name"
        bind:value={entityFormData.name}
        placeholder="Smith Family Trust"
        required
      />
      <Select
        label="Type"
        bind:value={entityFormData.type}
        options={entityTypeOptions}
        placeholder="Select type"
        required
      />
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (entityModalOpen = false)}>Cancel</Button>
      <Button onclick={handleEntitySubmit} loading={entitySaving}>
        {editingEntity ? 'Save' : 'Create'}
      </Button>
    {/snippet}
  </Modal>

  <!-- Asset Modal -->
  <Modal bind:open={assetModalOpen} title={editingAsset ? 'Edit Asset' : 'Add Asset'}>
    <form onsubmit={(e) => { e.preventDefault(); handleAssetSubmit(); }} class="space-y-4">
      <Input
        label="Asset Name"
        bind:value={assetFormData.name}
        placeholder="Primary Residence"
        required
      />
      <Select
        label="Category"
        bind:value={assetFormData.category}
        options={assetCategoryOptions}
        placeholder="Select category"
        required
      />
      <Input
        type="number"
        label="Value"
        bind:value={assetFormData.value}
        placeholder="1000000"
        required
      />
      <div>
        <label for="asset-notes" class="label">Notes</label>
        <textarea
          id="asset-notes"
          bind:value={assetFormData.notes}
          placeholder="Additional notes..."
          rows="2"
          class="input"
        ></textarea>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (assetModalOpen = false)}>Cancel</Button>
      <Button onclick={handleAssetSubmit} loading={assetSaving}>
        {editingAsset ? 'Save' : 'Add Asset'}
      </Button>
    {/snippet}
  </Modal>

  <!-- Liability Modal -->
  <Modal bind:open={liabilityModalOpen} title={editingLiability ? 'Edit Liability' : 'Add Liability'}>
    <form onsubmit={(e) => { e.preventDefault(); handleLiabilitySubmit(); }} class="space-y-4">
      <Input
        label="Liability Name"
        bind:value={liabilityFormData.name}
        placeholder="Home Mortgage"
        required
      />
      <Select
        label="Category"
        bind:value={liabilityFormData.category}
        options={liabilityCategoryOptions}
        placeholder="Select category"
        required
      />
      <Input
        type="number"
        label="Balance"
        bind:value={liabilityFormData.balance}
        placeholder="500000"
        required
      />
      <div>
        <label for="liability-notes" class="label">Notes</label>
        <textarea
          id="liability-notes"
          bind:value={liabilityFormData.notes}
          placeholder="Additional notes..."
          rows="2"
          class="input"
        ></textarea>
      </div>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (liabilityModalOpen = false)}>Cancel</Button>
      <Button onclick={handleLiabilitySubmit} loading={liabilitySaving}>
        {editingLiability ? 'Save' : 'Add Liability'}
      </Button>
    {/snippet}
  </Modal>
</AppShell>
