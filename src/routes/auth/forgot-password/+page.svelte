<script lang="ts">
  import { Button, Input, Card } from '$lib/components/ui';
  import { resetPassword } from '$lib/firebase/auth';
  import { success, error as showError } from '$lib/stores/ui';
  import { ArrowLeft, Mail } from 'lucide-svelte';

  let email = $state('');
  let loading = $state(false);
  let sent = $state(false);
  let errors = $state<Record<string, string>>({});

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};

    if (!email) {
      errors.email = 'Email is required';
      return;
    }

    loading = true;

    try {
      await resetPassword(email);
      sent = true;
      success('Password reset email sent');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Don't reveal if user exists
        sent = true;
      } else {
        showError(err.message || 'Failed to send reset email');
      }
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password - WealthSync</title>
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
      {#if sent}
        <div class="text-center py-4">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail class="w-8 h-8 text-emerald-600" />
          </div>
          <h1 class="text-2xl font-serif font-semibold text-navy-800 mb-2">
            Check Your Email
          </h1>
          <p class="text-cream-600 mb-6">
            If an account exists for {email}, you'll receive a password reset link shortly.
          </p>
          <Button href="/auth/login" variant="secondary">
            Return to Sign In
          </Button>
        </div>
      {:else}
        <h1 class="text-2xl font-serif font-semibold text-navy-800 text-center mb-2">
          Reset Password
        </h1>
        <p class="text-cream-600 text-center mb-6">
          Enter your email and we'll send you a reset link
        </p>

        <form onsubmit={handleSubmit} class="space-y-4">
          <Input
            type="email"
            label="Email"
            bind:value={email}
            error={errors.email}
            placeholder="you@example.com"
            autocomplete="email"
            required
          />

          <Button type="submit" class="w-full" {loading}>
            Send Reset Link
          </Button>
        </form>

        <a
          href="/auth/login"
          class="mt-6 flex items-center justify-center gap-2 text-sm text-cream-600 hover:text-navy-800"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Sign In
        </a>
      {/if}
    </Card>
  </div>
</div>
