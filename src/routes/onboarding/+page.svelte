<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, Input, Select, Card } from '$lib/components/ui';
  import { authStore, currentFamily, currentUser } from '$lib/stores/auth';
  import { updateFamily, createAdvisor, createDeadline, createEntity, logActivity } from '$lib/firebase/services';
  import { success, error as showError } from '$lib/stores/ui';
  import {
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Users,
    Calendar,
    Building,
    Sparkles,
    ArrowRight,
    Plus,
    Trash2
  } from 'lucide-svelte';
  import type { AdvisorSpecialty, DeadlineCategory, EntityType } from '$lib/types';
  import { ADVISOR_SPECIALTY_LABELS, DEADLINE_CATEGORY_LABELS, ENTITY_TYPE_LABELS } from '$lib/types';

  const family = $derived($currentFamily);
  const user = $derived($currentUser);

  let currentStep = $state(0);
  let saving = $state(false);

  // Step 1: Family Info
  let familyName = $state('');

  // Step 2: Advisors
  interface AdvisorInput {
    name: string;
    firm: string;
    email: string;
    specialty: AdvisorSpecialty | '';
  }
  let advisors = $state<AdvisorInput[]>([{ name: '', firm: '', email: '', specialty: '' }]);

  // Step 3: Entities
  interface EntityInput {
    name: string;
    type: EntityType | '';
  }
  let entities = $state<EntityInput[]>([{ name: '', type: '' }]);

  // Step 4: Upcoming Deadlines
  interface DeadlineInput {
    title: string;
    category: DeadlineCategory | '';
    dueDate: string;
  }
  let deadlines = $state<DeadlineInput[]>([{ title: '', category: '', dueDate: '' }]);

  const steps = [
    { title: 'Welcome', description: 'Set up your family office' },
    { title: 'Add Advisors', description: 'Your professional network' },
    { title: 'Wealth Entities', description: 'Trusts, LLCs, and more' },
    { title: 'Key Deadlines', description: 'Important dates to track' },
    { title: 'Complete', description: 'Ready to go!' }
  ];

  const specialtyOptions = Object.entries(ADVISOR_SPECIALTY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const entityTypeOptions = Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const deadlineCategoryOptions = Object.entries(DEADLINE_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  function addAdvisor() {
    advisors = [...advisors, { name: '', firm: '', email: '', specialty: '' }];
  }

  function removeAdvisor(index: number) {
    advisors = advisors.filter((_, i) => i !== index);
  }

  function addEntity() {
    entities = [...entities, { name: '', type: '' }];
  }

  function removeEntity(index: number) {
    entities = entities.filter((_, i) => i !== index);
  }

  function addDeadline() {
    deadlines = [...deadlines, { title: '', category: '', dueDate: '' }];
  }

  function removeDeadline(index: number) {
    deadlines = deadlines.filter((_, i) => i !== index);
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 0:
        return familyName.trim().length > 0;
      case 1:
      case 2:
      case 3:
        return true; // Optional steps
      case 4:
        return true;
      default:
        return false;
    }
  }

  async function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  async function completeOnboarding() {
    if (!family?.id || !user?.id) return;

    saving = true;

    try {
      // Update family name
      const updatedName = familyName.trim() || family.name;
      await updateFamily(family.id, { name: updatedName, onboardingCompleted: true });

      // Update local store
      authStore.updateFamily({ name: updatedName, onboardingCompleted: true });

      // Create advisors
      for (const advisor of advisors) {
        if (advisor.name && advisor.specialty) {
          await createAdvisor(family.id, {
            name: advisor.name,
            firm: advisor.firm,
            email: advisor.email,
            phone: '',
            specialty: advisor.specialty as AdvisorSpecialty,
            notes: '',
            createdBy: user.id
          });
        }
      }

      // Create entities
      for (const entity of entities) {
        if (entity.name && entity.type) {
          await createEntity(family.id, {
            name: entity.name,
            type: entity.type as EntityType,
            createdBy: user.id
          });
        }
      }

      // Create deadlines
      for (const deadline of deadlines) {
        if (deadline.title && deadline.category && deadline.dueDate) {
          await createDeadline(family.id, {
            title: deadline.title,
            category: deadline.category as DeadlineCategory,
            dueDate: new Date(deadline.dueDate),
            recurrence: 'one_time',
            notes: '',
            reminders: [7, 3, 1],
            status: 'upcoming',
            createdBy: user.id
          });
        }
      }

      await logActivity(family.id, {
        type: 'onboarding_completed',
        description: 'Completed onboarding wizard',
        userId: user.id
      });

      success('Welcome to WealthSync.ai! Your family office is ready.');
      goto('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      showError('Failed to complete setup. Please try again.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Welcome to WealthSync.ai</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-white flex flex-col">
  <!-- Header -->
  <header class="border-b border-cream-200 bg-white/80 backdrop-blur-sm">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">W</span>
        </div>
        <span class="font-display font-semibold text-navy-800 text-lg">WealthSync.ai</span>
      </a>

      <button
        class="text-sm text-cream-600 hover:text-navy-800"
        onclick={() => goto('/dashboard')}
      >
        Skip for now
      </button>
    </div>
  </header>

  <!-- Progress -->
  <div class="bg-white border-b border-cream-200">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        {#each steps as step, index}
          <div class="flex items-center">
            <div class="flex flex-col items-center">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors
                  {index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : index === currentStep
                      ? 'bg-navy-800 text-white'
                      : 'bg-cream-200 text-cream-600'}"
              >
                {#if index < currentStep}
                  <CheckCircle class="w-5 h-5" />
                {:else}
                  {index + 1}
                {/if}
              </div>
              <span class="text-xs mt-1.5 text-cream-600 hidden sm:block">{step.title}</span>
            </div>
            {#if index < steps.length - 1}
              <div
                class="w-12 sm:w-24 h-1 mx-2 rounded-full transition-colors
                  {index < currentStep ? 'bg-emerald-500' : 'bg-cream-200'}"
              ></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content -->
  <main class="flex-1 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      {#if currentStep === 0}
        <!-- Step 1: Welcome -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles class="w-10 h-10 text-gold-500" />
          </div>
          <h1 class="text-3xl font-display font-bold text-navy-800 mb-3">
            Welcome to WealthSync.ai
          </h1>
          <p class="text-lg text-cream-600 max-w-md mx-auto">
            Let's set up your family office in just a few minutes. We'll help you organize your advisors, track your wealth, and stay on top of important deadlines.
          </p>
        </div>

        <Card class="mb-6">
          <Input
            label="Family Office Name"
            bind:value={familyName}
            placeholder="e.g., The Smith Family Office"
            hint="This will be displayed throughout your dashboard"
          />
        </Card>

      {:else if currentStep === 1}
        <!-- Step 2: Advisors -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users class="w-8 h-8 text-blue-600" />
          </div>
          <h2 class="text-2xl font-display font-bold text-navy-800 mb-2">
            Add Your Advisors
          </h2>
          <p class="text-cream-600">
            Who helps manage your family's wealth? Add your CPAs, attorneys, wealth managers, and other trusted advisors.
          </p>
        </div>

        <div class="space-y-4 mb-4">
          {#each advisors as advisor, index}
            <Card class="relative">
              {#if advisors.length > 1}
                <button
                  class="absolute top-3 right-3 p-1.5 rounded-lg text-cream-500 hover:text-red-600 hover:bg-red-50"
                  onclick={() => removeAdvisor(index)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              {/if}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  bind:value={advisor.name}
                  placeholder="John Smith"
                />
                <Input
                  label="Firm"
                  bind:value={advisor.firm}
                  placeholder="Smith & Associates"
                />
                <Input
                  label="Email"
                  type="email"
                  bind:value={advisor.email}
                  placeholder="john@firm.com"
                />
                <Select
                  label="Specialty"
                  bind:value={advisor.specialty}
                  options={specialtyOptions}
                  placeholder="Select specialty"
                />
              </div>
            </Card>
          {/each}
        </div>

        <Button variant="secondary" onclick={addAdvisor} class="w-full">
          <Plus class="w-4 h-4" />
          Add Another Advisor
        </Button>

      {:else if currentStep === 2}
        <!-- Step 3: Entities -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building class="w-8 h-8 text-emerald-600" />
          </div>
          <h2 class="text-2xl font-display font-bold text-navy-800 mb-2">
            Wealth Entities
          </h2>
          <p class="text-cream-600">
            Add the legal entities that hold your family's assets - trusts, LLCs, foundations, etc.
          </p>
        </div>

        <div class="space-y-4 mb-4">
          {#each entities as entity, index}
            <Card class="relative">
              {#if entities.length > 1}
                <button
                  class="absolute top-3 right-3 p-1.5 rounded-lg text-cream-500 hover:text-red-600 hover:bg-red-50"
                  onclick={() => removeEntity(index)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              {/if}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Entity Name"
                  bind:value={entity.name}
                  placeholder="Smith Family Trust"
                />
                <Select
                  label="Type"
                  bind:value={entity.type}
                  options={entityTypeOptions}
                  placeholder="Select type"
                />
              </div>
            </Card>
          {/each}
        </div>

        <Button variant="secondary" onclick={addEntity} class="w-full">
          <Plus class="w-4 h-4" />
          Add Another Entity
        </Button>

      {:else if currentStep === 3}
        <!-- Step 4: Deadlines -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar class="w-8 h-8 text-orange-600" />
          </div>
          <h2 class="text-2xl font-display font-bold text-navy-800 mb-2">
            Important Deadlines
          </h2>
          <p class="text-cream-600">
            Add key dates you need to track - tax deadlines, policy renewals, trust reviews, etc.
          </p>
        </div>

        <div class="space-y-4 mb-4">
          {#each deadlines as deadline, index}
            <Card class="relative">
              {#if deadlines.length > 1}
                <button
                  class="absolute top-3 right-3 p-1.5 rounded-lg text-cream-500 hover:text-red-600 hover:bg-red-50"
                  onclick={() => removeDeadline(index)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              {/if}
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Title"
                  bind:value={deadline.title}
                  placeholder="Q1 Tax Payment"
                />
                <Select
                  label="Category"
                  bind:value={deadline.category}
                  options={deadlineCategoryOptions}
                  placeholder="Select category"
                />
                <Input
                  type="date"
                  label="Due Date"
                  bind:value={deadline.dueDate}
                />
              </div>
            </Card>
          {/each}
        </div>

        <Button variant="secondary" onclick={addDeadline} class="w-full">
          <Plus class="w-4 h-4" />
          Add Another Deadline
        </Button>

      {:else if currentStep === 4}
        <!-- Step 5: Complete -->
        <div class="text-center">
          <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle class="w-10 h-10 text-emerald-600" />
          </div>
          <h2 class="text-3xl font-display font-bold text-navy-800 mb-3">
            You're All Set!
          </h2>
          <p class="text-lg text-cream-600 max-w-md mx-auto mb-8">
            Your family office is ready. You can always add more advisors, entities, and deadlines from your dashboard.
          </p>

          <Card class="text-left mb-6">
            <h3 class="font-semibold text-navy-800 mb-4">What you've set up:</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Building class="w-4 h-4 text-navy-600" />
                </div>
                <span class="text-cream-700">
                  {familyName || 'Your Family Office'}
                </span>
              </div>
              {#if advisors.filter(a => a.name).length > 0}
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users class="w-4 h-4 text-blue-600" />
                  </div>
                  <span class="text-cream-700">
                    {advisors.filter(a => a.name).length} advisor{advisors.filter(a => a.name).length !== 1 ? 's' : ''}
                  </span>
                </div>
              {/if}
              {#if entities.filter(e => e.name).length > 0}
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building class="w-4 h-4 text-emerald-600" />
                  </div>
                  <span class="text-cream-700">
                    {entities.filter(e => e.name).length} entit{entities.filter(e => e.name).length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              {/if}
              {#if deadlines.filter(d => d.title).length > 0}
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar class="w-4 h-4 text-orange-600" />
                  </div>
                  <span class="text-cream-700">
                    {deadlines.filter(d => d.title).length} deadline{deadlines.filter(d => d.title).length !== 1 ? 's' : ''}
                  </span>
                </div>
              {/if}
            </div>
          </Card>

          <Button onclick={completeOnboarding} loading={saving} class="w-full" size="lg">
            Go to Dashboard
            <ArrowRight class="w-5 h-5" />
          </Button>
        </div>
      {/if}
    </div>
  </main>

  <!-- Footer Navigation -->
  {#if currentStep < 4}
    <footer class="border-t border-cream-200 bg-white">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onclick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft class="w-4 h-4" />
          Back
        </Button>

        <Button
          onclick={nextStep}
          disabled={!canProceed()}
        >
          {currentStep === 3 ? 'Review' : 'Continue'}
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </footer>
  {/if}
</div>
