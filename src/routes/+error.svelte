<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui';
  import { AlertTriangle, Home, ArrowLeft } from 'lucide-svelte';

  const statusCode = $derived($page.status);
  const message = $derived($page.error?.message || 'Something went wrong');

  const errorMessages: Record<number, { title: string; description: string }> = {
    404: {
      title: 'Page not found',
      description: 'The page you are looking for does not exist or has been moved.'
    },
    500: {
      title: 'Server error',
      description: 'We encountered an unexpected error. Please try again later.'
    },
    403: {
      title: 'Access denied',
      description: 'You do not have permission to access this page.'
    },
    401: {
      title: 'Unauthorized',
      description: 'Please sign in to access this page.'
    }
  };

  const errorInfo = $derived(errorMessages[statusCode] || {
    title: 'Error',
    description: message
  });
</script>

<svelte:head>
  <title>{errorInfo.title} | WealthSync</title>
</svelte:head>

<div class="min-h-screen bg-cream-200 flex items-center justify-center p-4">
  <div class="max-w-md w-full text-center">
    <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
      <AlertTriangle class="w-10 h-10 text-red-600" />
    </div>

    <h1 class="text-6xl font-bold text-navy-800 font-serif mb-2">{statusCode}</h1>
    <h2 class="text-xl font-semibold text-navy-700 mb-3">{errorInfo.title}</h2>
    <p class="text-cream-600 mb-8">{errorInfo.description}</p>

    <div class="flex items-center justify-center gap-4">
      <Button variant="secondary" onclick={() => history.back()}>
        <ArrowLeft class="w-4 h-4" />
        Go Back
      </Button>
      <Button href="/">
        <Home class="w-4 h-4" />
        Home
      </Button>
    </div>
  </div>
</div>
