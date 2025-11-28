<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isLoading, isAuthenticated, isInitialized } from '$lib/stores/auth';
  import { onAuthChange, getCurrentUser } from '$lib/firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase/client';
  import { Spinner } from '$lib/components/ui';
  import '../app.css';

  let { children } = $props();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/accept-invite'];

  const loading = $derived($isLoading);
  const authenticated = $derived($isAuthenticated);
  const initialized = $derived($isInitialized);
  const currentPath = $derived($page.url.pathname);

  const isPublicRoute = $derived(
    publicRoutes.some(route =>
      route === '/' ? currentPath === '/' : currentPath.startsWith(route)
    )
  );

  onMount(() => {
    if (!browser) return;

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await getCurrentUser();
          if (user) {
            authStore.setUser(user);

            // Get family data
            const familyDoc = await getDoc(doc(db, 'families', user.familyId));
            if (familyDoc.exists()) {
              authStore.setFamily({
                id: familyDoc.id,
                ...familyDoc.data()
              } as any);
            }
          } else {
            authStore.reset();
          }
        } catch (err) {
          console.error('Error loading user:', err);
          authStore.reset();
        }
      } else {
        authStore.reset();
      }

      authStore.setInitialized();
    });

    return () => unsubscribe();
  });

  // Handle route protection
  $effect(() => {
    if (!browser || !initialized) return;

    if (!authenticated && !isPublicRoute) {
      goto('/auth/login');
    } else if (authenticated && currentPath.startsWith('/auth/') && !currentPath.includes('accept-invite')) {
      goto('/dashboard');
    }
  });
</script>

<svelte:head>
  <title>WealthSync - Family Office Operating System</title>
</svelte:head>

{#if !initialized && !isPublicRoute}
  <div class="min-h-screen bg-cream-200 flex items-center justify-center">
    <div class="text-center">
      <div class="w-12 h-12 bg-navy-800 rounded-lg flex items-center justify-center mx-auto mb-4">
        <span class="text-gold-400 font-serif font-bold text-2xl">W</span>
      </div>
      <Spinner size="lg" />
    </div>
  </div>
{:else}
  {@render children()}
{/if}
