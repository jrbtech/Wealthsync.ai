<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button, Input, Card } from '$lib/components/ui';
  import { signUp, completeGoogleSignUp } from '$lib/firebase/auth';
  import { authStore } from '$lib/stores/auth';
  import { error as showError } from '$lib/stores/ui';
  import { checkPasswordStrength } from '$lib/utils/validation';
  import { auth } from '$lib/firebase/client';

  const isGoogleSignup = $derived($page.url.searchParams.get('google') === 'true');
  const googleUser = $derived(auth?.currentUser);

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let familyName = $state('');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  // Pre-fill from Google
  $effect(() => {
    if (isGoogleSignup && googleUser) {
      name = googleUser.displayName || '';
      email = googleUser.email || '';
    }
  });

  const passwordStrength = $derived(checkPasswordStrength(password));

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};

    if (!name) errors.name = 'Name is required';
    if (!isGoogleSignup) {
      if (!email) errors.email = 'Email is required';
      if (!password) errors.password = 'Password is required';
      else if (passwordStrength.score < 3) {
        errors.password = passwordStrength.feedback[0] || 'Password is too weak';
      }
    }
    if (!familyName) errors.familyName = 'Family name is required';

    if (Object.keys(errors).length > 0) return;

    loading = true;

    try {
      let result;

      if (isGoogleSignup) {
        result = await completeGoogleSignUp(familyName);
      } else {
        result = await signUp(email, password, name, familyName);
      }

      authStore.setUser(result.user);
      authStore.setFamily(result.family);

      goto('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        showError('An account with this email already exists');
      } else {
        showError(err.message || 'Failed to create account');
      }
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Get Started - WealthSync</title>
</svelte:head>

<div class="min-h-screen bg-cream-200 flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <a href="/" class="inline-flex items-center gap-2">
        <div class="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center">
          <span class="text-gold-400 font-serif font-bold text-xl">W</span>
        </div>
        <span class="font-serif font-semibold text-navy-800 text-2xl">WealthSync</span>
      </a>
    </div>

    <Card>
      <h1 class="text-2xl font-serif font-semibold text-navy-800 text-center mb-2">
        {isGoogleSignup ? 'Complete Your Account' : 'Create Your Family Office'}
      </h1>
      <p class="text-cream-600 text-center mb-6">
        {isGoogleSignup
          ? 'Just a few more details to get started'
          : 'Start coordinating your advisors today'}
      </p>

      <form onsubmit={handleSubmit} class="space-y-4">
        <Input
          type="text"
          label="Your Name"
          bind:value={name}
          error={errors.name}
          placeholder="John Smith"
          autocomplete="name"
          disabled={isGoogleSignup && !!googleUser?.displayName}
          required
        />

        {#if !isGoogleSignup}
          <Input
            type="email"
            label="Email"
            bind:value={email}
            error={errors.email}
            placeholder="you@example.com"
            autocomplete="email"
            required
          />

          <div>
            <Input
              type="password"
              label="Password"
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
                <p class="text-xs text-cream-600 mt-1">
                  {passwordStrength.score <= 2 ? 'Weak' : passwordStrength.score === 3 ? 'Good' : 'Strong'}
                </p>
              </div>
            {/if}
          </div>
        {/if}

        <Input
          type="text"
          label="Family Office Name"
          bind:value={familyName}
          error={errors.familyName}
          placeholder="The Smith Family Office"
          hint="This is how your family office will be identified"
          required
        />

        <Button type="submit" class="w-full" {loading}>
          {isGoogleSignup ? 'Complete Setup' : 'Create Account'}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-cream-600">
        Already have an account?
        <a href="/auth/login" class="text-navy-600 hover:text-navy-800 font-medium">
          Sign in
        </a>
      </p>

      <p class="mt-4 text-center text-xs text-cream-500">
        By creating an account, you agree to our
        <a href="/terms" class="underline hover:text-navy-600">Terms of Service</a>
        and
        <a href="/privacy" class="underline hover:text-navy-600">Privacy Policy</a>
      </p>
    </Card>
  </div>
</div>
