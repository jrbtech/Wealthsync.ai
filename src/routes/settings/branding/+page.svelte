<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Spinner, Input, Textarea } from '$lib/components/ui';
  import { currentUser, currentFamily } from '$lib/stores/auth';
  import { getAgency, updateAgencyBranding } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import {
    Palette,
    Image,
    Type,
    Mail,
    Phone,
    Globe,
    Save,
    Upload,
    RefreshCw,
    Eye
  } from 'lucide-svelte';
  import type { AgencyBranding } from '$lib/types';
  import { DEFAULT_AGENCY_BRANDING } from '$lib/types';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let loading = $state(true);
  let saving = $state(false);
  let branding = $state<AgencyBranding>({ ...DEFAULT_AGENCY_BRANDING });

  // Preview state
  let showPreview = $state(false);

  onMount(async () => {
    if (!family?.id) return;

    try {
      const agency = await getAgency(family.id);
      if (agency?.branding) {
        branding = { ...DEFAULT_AGENCY_BRANDING, ...agency.branding };
      }
    } catch (err) {
      console.error('Error loading branding:', err);
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    if (!family?.id) return;
    saving = true;

    try {
      await updateAgencyBranding(family.id, branding);
      success('Branding settings saved successfully');
    } catch (err) {
      console.error('Error saving branding:', err);
      showError('Failed to save branding settings');
    } finally {
      saving = false;
    }
  }

  function resetToDefaults() {
    if (confirm('Reset all branding settings to defaults? This cannot be undone.')) {
      branding = { ...DEFAULT_AGENCY_BRANDING };
    }
  }

  // Common font options
  const fontOptions = [
    'Inter, sans-serif',
    'DM Sans, sans-serif',
    'Source Sans Pro, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Nunito, sans-serif',
    'Raleway, sans-serif'
  ];
</script>

<svelte:head>
  <title>Branding Settings - AgencyForge.ai</title>
</svelte:head>

<AppShell>
  {#if loading}
    <div class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <Spinner size="lg" />
        <p class="mt-4 text-cream-600">Loading branding settings</p>
      </div>
    </div>
  {:else}
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-2">Branding Settings</h1>
        <p class="text-navy-500">
          Customize how your agency appears on client reports
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Settings Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Agency Identity -->
          <Card>
            {#snippet header()}
              <div class="flex items-center gap-2">
                <Globe class="w-5 h-5 text-accent-600" />
                <h2 class="font-semibold text-navy-900">Agency Identity</h2>
              </div>
            {/snippet}

            <div class="space-y-4">
              <Input
                label="Agency Name"
                placeholder="Your Agency Name"
                bind:value={branding.agencyName}
              />

              <Input
                label="Website"
                placeholder="https://youragency.com"
                bind:value={branding.agencyWebsite}
              />

              <div class="grid grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="hello@youragency.com"
                  bind:value={branding.contactEmail}
                >
                  {#snippet prefix()}
                    <Mail class="w-4 h-4 text-cream-400" />
                  {/snippet}
                </Input>

                <Input
                  label="Contact Phone"
                  placeholder="+1 (555) 000-0000"
                  bind:value={branding.contactPhone}
                >
                  {#snippet prefix()}
                    <Phone class="w-4 h-4 text-cream-400" />
                  {/snippet}
                </Input>
              </div>
            </div>
          </Card>

          <!-- Logo Upload -->
          <Card>
            {#snippet header()}
              <div class="flex items-center gap-2">
                <Image class="w-5 h-5 text-accent-600" />
                <h2 class="font-semibold text-navy-900">Logo</h2>
              </div>
            {/snippet}

            <div class="space-y-4">
              <Input
                label="Logo URL"
                placeholder="https://yourdomain.com/logo.png"
                bind:value={branding.logoUrl}
              />

              <p class="text-sm text-cream-500">
                Enter a URL to your logo image. Recommended size: 200x80px, PNG or SVG format.
              </p>

              {#if branding.logoUrl}
                <div class="p-4 bg-cream-50 rounded-xl">
                  <p class="text-xs text-cream-500 uppercase tracking-wider mb-2">Preview</p>
                  <img
                    src={branding.logoUrl}
                    alt="Agency Logo"
                    class="max-h-16 object-contain"
                    onerror={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              {/if}
            </div>
          </Card>

          <!-- Colors -->
          <Card>
            {#snippet header()}
              <div class="flex items-center gap-2">
                <Palette class="w-5 h-5 text-accent-600" />
                <h2 class="font-semibold text-navy-900">Brand Colors</h2>
              </div>
            {/snippet}

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-navy-700 mb-2">
                    Primary Color
                  </label>
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      bind:value={branding.primaryColor}
                      class="w-12 h-12 rounded-lg border border-cream-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      bind:value={branding.primaryColor}
                      placeholder="#0f172a"
                      class="flex-1 px-3 py-2 border border-cream-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <p class="text-xs text-cream-500 mt-1">Used for headings and primary elements</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-navy-700 mb-2">
                    Accent Color
                  </label>
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      bind:value={branding.secondaryColor}
                      class="w-12 h-12 rounded-lg border border-cream-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      bind:value={branding.secondaryColor}
                      placeholder="#06b6d4"
                      class="flex-1 px-3 py-2 border border-cream-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <p class="text-xs text-cream-500 mt-1">Used for highlights and CTAs</p>
                </div>
              </div>

              <!-- Color Preview -->
              <div class="p-4 bg-cream-50 rounded-xl">
                <p class="text-xs text-cream-500 uppercase tracking-wider mb-3">Color Preview</p>
                <div class="flex items-center gap-4">
                  <div
                    class="w-20 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                    style="background-color: {branding.primaryColor}"
                  >
                    Primary
                  </div>
                  <div
                    class="w-20 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                    style="background-color: {branding.secondaryColor}"
                  >
                    Accent
                  </div>
                  <div
                    class="flex-1 h-20 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                    style="background: linear-gradient(135deg, {branding.primaryColor} 0%, {branding.secondaryColor} 100%)"
                  >
                    Gradient
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- Typography -->
          <Card>
            {#snippet header()}
              <div class="flex items-center gap-2">
                <Type class="w-5 h-5 text-accent-600" />
                <h2 class="font-semibold text-navy-900">Typography</h2>
              </div>
            {/snippet}

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-navy-700 mb-2">
                  Font Family
                </label>
                <select
                  bind:value={branding.fontFamily}
                  class="w-full px-3 py-2.5 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  {#each fontOptions as font}
                    <option value={font}>{font.split(',')[0]}</option>
                  {/each}
                </select>
              </div>

              <div class="p-4 bg-cream-50 rounded-xl">
                <p class="text-xs text-cream-500 uppercase tracking-wider mb-3">Font Preview</p>
                <div style="font-family: {branding.fontFamily}">
                  <p class="text-2xl font-bold text-navy-900 mb-2">Heading Example</p>
                  <p class="text-navy-600">
                    This is how your report text will appear. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <!-- Footer Text -->
          <Card>
            {#snippet header()}
              <h2 class="font-semibold text-navy-900">Report Footer</h2>
            {/snippet}

            <Textarea
              label="Footer Text"
              placeholder="Confidential - Prepared exclusively for client use"
              bind:value={branding.footerText}
              rows={2}
            />
            <p class="text-sm text-cream-500 mt-2">
              This text appears at the bottom of every report page
            </p>
          </Card>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4">
            <Button onclick={resetToDefaults} variant="ghost">
              <RefreshCw class="w-4 h-4" />
              Reset to Defaults
            </Button>

            <div class="flex gap-3">
              <Button onclick={() => showPreview = true} variant="secondary">
                <Eye class="w-4 h-4" />
                Preview
              </Button>
              <Button onclick={handleSave} variant="primary" disabled={saving}>
                {#if saving}
                  <Spinner size="sm" />
                  Saving...
                {:else}
                  <Save class="w-4 h-4" />
                  Save Changes
                {/if}
              </Button>
            </div>
          </div>
        </div>

        <!-- Live Preview Panel -->
        <div class="hidden lg:block">
          <div class="sticky top-6">
            <Card>
              {#snippet header()}
                <h3 class="font-semibold text-navy-900">Live Preview</h3>
              {/snippet}

              <div class="space-y-4">
                <!-- Mini Report Header Preview -->
                <div
                  class="p-4 rounded-xl text-white"
                  style="background: linear-gradient(135deg, {branding.primaryColor} 0%, {branding.secondaryColor} 100%)"
                >
                  {#if branding.logoUrl}
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      class="h-6 object-contain mb-3"
                      onerror={(e) => e.currentTarget.style.display = 'none'}
                    />
                  {:else}
                    <p class="font-bold mb-3" style="font-family: {branding.fontFamily}">
                      {branding.agencyName}
                    </p>
                  {/if}
                  <p class="text-sm opacity-90">SEO Audit Report</p>
                  <p class="text-xs opacity-70">Client Name</p>
                </div>

                <!-- Score Card Preview -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 rounded-lg bg-cream-50 text-center">
                    <p
                      class="text-2xl font-bold"
                      style="color: {branding.primaryColor}"
                    >
                      85
                    </p>
                    <p class="text-xs text-cream-600">Overall</p>
                  </div>
                  <div class="p-3 rounded-lg bg-cream-50 text-center">
                    <p
                      class="text-2xl font-bold"
                      style="color: {branding.secondaryColor}"
                    >
                      +45%
                    </p>
                    <p class="text-xs text-cream-600">Growth</p>
                  </div>
                </div>

                <!-- Button Preview -->
                <button
                  class="w-full py-2.5 rounded-lg text-white text-sm font-medium"
                  style="background-color: {branding.secondaryColor}"
                >
                  View Full Report
                </button>

                <!-- Footer Preview -->
                <div class="pt-3 border-t border-cream-200 text-center">
                  <p class="text-xs text-cream-500" style="font-family: {branding.fontFamily}">
                    {branding.footerText || 'Confidential'}
                  </p>
                  {#if branding.contactEmail}
                    <p class="text-xs mt-1" style="color: {branding.secondaryColor}">
                      {branding.contactEmail}
                    </p>
                  {/if}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  {/if}
</AppShell>
