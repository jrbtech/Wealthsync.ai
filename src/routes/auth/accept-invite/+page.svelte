<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Input, Card, Spinner } from '$lib/components/ui';
  import { acceptInvite } from '$lib/firebase/auth';
  import { authStore } from '$lib/stores/auth';
  import { error as showError } from '$lib/stores/ui';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase/client';
  import { checkPasswordStrength } from '$lib/utils/validation';

  const inviteId = $derived($page.url.searchParams.get('id'));

  let invite = $state<any>(null);
  let loadingInvite = $state(true);
  let inviteError = $state<string | null>(null);

  let password = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  const passwordStrength = $derived(checkPasswordStrength(password));

  onMount(async () => {
    if (!inviteId) {
      inviteError = 'Invalid invite link';
      loadingInvite = false;
      return;
    }

    try {
      const inviteDoc = await getDoc(doc(db, 'invites', inviteId));

      if (!inviteDoc.exists()) {
        inviteError = 'Invite not found';
        return;
      }

      const data = inviteDoc.data();

      if (data.status !== 'pending') {
        inviteError = 'This invite has already been used';
        return;
      }

      if (new Date(data.expiresAt.toDate()) < new Date()) {
        inviteError = 'This invite has expired';
        return;
      }

      // Get family name
      const familyDoc = await getDoc(doc(db, 'families', data.familyId));
      const familyName = familyDoc.exists() ? familyDoc.data().name : 'Family Office';

      invite = { ...data, familyName };
    } catch (err: any) {
      inviteError = 'Failed to load invite';
    } finally {
      loadingInvite = false;
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      errors.password = passwordStrength.feedback[0] || 'Password is too weak';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) return;

    loading = true;

    try {
      const user = await acceptInvite(inviteId!, password);

      // Get family data
      const familyDoc = await getDoc(doc(db, 'families', user.familyId));
      const family = familyDoc.exists()
        ? { id: familyDoc.id, ...familyDoc.data() }
        : null;

      authStore.setUser(user);
      authStore.setFamily(family as any);

      goto('/dashboard');
    } catch (err: any) {
      showError(err.message || 'Failed to accept invite');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Accept Invite - WealthSync.ai</title>
</svelte:head>

<div class="min-h-screen bg-cream-200 flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <a href="/" class="inline-flex items-center gap-2">
        <div class="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xl">W</span>
        </div>
        <span class="font-display font-semibold text-navy-800 text-2xl">WealthSync.ai</span>
      </a>
    </div>

    <Card>
      {#if loadingInvite}
        <div class="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      {:else if inviteError}
        <div class="text-center py-4">
          <h1 class="text-2xl font-display font-semibold text-navy-800 mb-2">
            Invalid Invite
          </h1>
          <p class="text-cream-600 mb-6">{inviteError}</p>
          <Button href="/auth/login" variant="secondary">
            Go to Sign In
          </Button>
        </div>
      {:else if invite}
        <h1 class="text-2xl font-display font-semibold text-navy-800 text-center mb-2">
          You're Invited
        </h1>
        <p class="text-cream-600 text-center mb-6">
          Join <strong class="text-navy-800">{invite.familyName}</strong> on WealthSync
        </p>

        <div class="bg-cream-100 rounded-lg p-4 mb-6">
          <p class="text-sm text-cream-600">Invited as</p>
          <p class="font-medium text-navy-800">{invite.name}</p>
          <p class="text-sm text-cream-600">{invite.email}</p>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">
          <div>
            <Input
              type="password"
              label="Create Password"
              bind:value={password}
              error={errors.password}
              placeholder="Create a strong password"
              autocomplete="new-password"
              required
            />
            {#if password && !errors.password}
              <div class="mt-2">
                <div class="flex gap-1">
                  {#each [0, 1, 2, 3] as i}
                    <div
                      class="h-1 flex-1 rounded-full transition-colors {i < passwordStrength.score
                        ? passwordStrength.score <= 2
                          ? 'bg-red-400'
                          : passwordStrength.score === 3
                            ? 'bg-gold-400'
                            : 'bg-emerald-400'
                        : 'bg-cream-300'}"
                    ></div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <Input
            type="password"
            label="Confirm Password"
            bind:value={confirmPassword}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            autocomplete="new-password"
            required
          />

          <Button type="submit" class="w-full" {loading}>
            Accept Invite
          </Button>
        </form>
      {/if}
    </Card>
  </div>
</div>
