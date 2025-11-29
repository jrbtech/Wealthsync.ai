<script lang="ts">
  import { onMount } from 'svelte';
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Modal, Badge, Avatar, EmptyState, Spinner } from '$lib/components/ui';
  import { currentUser, currentFamily, isPrimaryUser } from '$lib/stores/auth';
  import { success, error as showError } from '$lib/stores/ui';
  import { inviteFamilyMember } from '$lib/firebase/auth';
  import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase/client';
  import { formatDate, formatRelativeDate } from '$lib/utils/format';
  import { PLAN_LIMITS } from '$lib/types';
  import { ArrowLeft, Users, Mail, UserPlus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-svelte';
  import type { User } from '$lib/types';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);
  const canInvite = $derived($isPrimaryUser);

  let loading = $state(true);
  let members = $state<User[]>([]);
  let pendingInvites = $state<any[]>([]);

  // Invite modal
  let inviteModalOpen = $state(false);
  let inviting = $state(false);
  let inviteData = $state({
    name: '',
    email: ''
  });

  const memberLimit = $derived(PLAN_LIMITS[family?.plan || 'foundation'].familyMembers);
  const canAddMore = $derived(memberLimit === Infinity || members.length < memberLimit);

  onMount(async () => {
    await loadTeam();
  });

  async function loadTeam() {
    if (!family?.id) return;

    loading = true;

    try {
      // Load family members
      const usersQuery = query(
        collection(db, 'users'),
        where('familyId', '==', family.id)
      );
      const usersSnapshot = await getDocs(usersQuery);
      members = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Load pending invites
      const invitesQuery = query(
        collection(db, 'invites'),
        where('familyId', '==', family.id),
        where('status', '==', 'pending')
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      pendingInvites = invitesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      showError('Failed to load team members');
    } finally {
      loading = false;
    }
  }

  async function handleInvite() {
    if (!family?.id || !user?.id) return;

    if (!inviteData.name || !inviteData.email) {
      showError('Name and email are required');
      return;
    }

    if (!canAddMore) {
      showError(`Your plan allows up to ${memberLimit} family members. Please upgrade to add more.`);
      return;
    }

    inviting = true;

    try {
      const inviteId = await inviteFamilyMember(
        inviteData.email,
        inviteData.name,
        family.id,
        user.id
      );

      // In production, send invite email via Resend
      // For now, just show the invite link
      const inviteUrl = `${window.location.origin}/auth/accept-invite?id=${inviteId}`;

      pendingInvites = [
        ...pendingInvites,
        {
          id: inviteId,
          name: inviteData.name,
          email: inviteData.email,
          createdAt: new Date()
        }
      ];

      success(`Invite sent to ${inviteData.email}`);
      inviteModalOpen = false;
      inviteData = { name: '', email: '' };

      // Show invite link for testing
      alert(`Invite link (for testing):\n${inviteUrl}`);
    } catch (err: any) {
      showError(err.message || 'Failed to send invite');
    } finally {
      inviting = false;
    }
  }

  async function cancelInvite(inviteId: string) {
    if (!confirm('Cancel this invite?')) return;

    try {
      await deleteDoc(doc(db, 'invites', inviteId));
      pendingInvites = pendingInvites.filter((i) => i.id !== inviteId);
      success('Invite cancelled');
    } catch (err) {
      showError('Failed to cancel invite');
    }
  }

  async function removeMember(member: User) {
    if (member.role === 'primary') {
      showError('Cannot remove the primary account holder');
      return;
    }

    if (!confirm(`Remove ${member.name} from your family office?`)) return;

    try {
      await deleteDoc(doc(db, 'users', member.id));
      members = members.filter((m) => m.id !== member.id);
      success('Member removed');
    } catch (err) {
      showError('Failed to remove member');
    }
  }
</script>

<svelte:head>
  <title>Team - WealthSync.ai</title>
</svelte:head>

<AppShell title="Team Members">
  <div class="max-w-3xl">
    <div class="mb-6">
      <Button href="/settings" variant="ghost" size="sm">
        <ArrowLeft class="w-4 h-4" />
        Back to Settings
      </Button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    {:else}
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-display font-semibold text-navy-800">Family Members</h2>
          <p class="text-sm text-cream-600">
            {members.length} of {memberLimit === Infinity ? 'unlimited' : memberLimit} members
          </p>
        </div>
        {#if canInvite}
          <Button onclick={() => (inviteModalOpen = true)} disabled={!canAddMore}>
            <UserPlus class="w-4 h-4" />
            Invite Member
          </Button>
        {/if}
      </div>

      <!-- Members List -->
      <Card padding="none" class="mb-6">
        <div class="divide-y divide-cream-200">
          {#each members as member}
            <div class="flex items-center gap-4 p-4">
              <Avatar name={member.name} src={member.avatarUrl} size="md" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-navy-800">{member.name}</p>
                  {#if member.role === 'primary'}
                    <Badge variant="gold">Owner</Badge>
                  {:else}
                    <Badge variant="gray">Member</Badge>
                  {/if}
                </div>
                <p class="text-sm text-cream-600">{member.email}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-cream-500">Last active</p>
                <p class="text-sm text-cream-700">{formatRelativeDate(member.lastLogin)}</p>
              </div>
              {#if canInvite && member.role !== 'primary'}
                <button
                  class="p-2 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                  onclick={() => removeMember(member)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </Card>

      <!-- Pending Invites -->
      {#if pendingInvites.length > 0}
        <h3 class="font-semibold text-navy-800 mb-3">Pending Invites</h3>
        <Card padding="none">
          <div class="divide-y divide-cream-200">
            {#each pendingInvites as invite}
              <div class="flex items-center gap-4 p-4">
                <div class="p-2 bg-cream-100 rounded-full">
                  <Mail class="w-5 h-5 text-cream-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-navy-800">{invite.name}</p>
                  <p class="text-sm text-cream-600">{invite.email}</p>
                </div>
                <div class="flex items-center gap-2">
                  <Badge variant="orange">
                    <Clock class="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                  {#if canInvite}
                    <button
                      class="p-2 rounded-lg text-cream-600 hover:text-red-600 hover:bg-red-50"
                      onclick={() => cancelInvite(invite.id)}
                    >
                      <XCircle class="w-4 h-4" />
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      <!-- Upgrade prompt -->
      {#if !canAddMore}
        <Card class="mt-6 bg-gold-50 border-gold-200">
          <div class="flex items-start gap-4">
            <div class="p-2 bg-gold-100 rounded-lg">
              <Users class="w-5 h-5 text-gold-600" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-navy-800">Need more team members?</h4>
              <p class="text-sm text-cream-700 mt-1">
                Your current plan allows {memberLimit} family members.
                Upgrade to add more people to your family office.
              </p>
              <Button href="/settings/billing" variant="gold" size="sm" class="mt-3">
                View Plans
              </Button>
            </div>
          </div>
        </Card>
      {/if}
    {/if}
  </div>

  <!-- Invite Modal -->
  <Modal bind:open={inviteModalOpen} title="Invite Family Member">
    <form onsubmit={(e) => { e.preventDefault(); handleInvite(); }} class="space-y-4">
      <Input
        label="Name"
        bind:value={inviteData.name}
        placeholder="Jane Smith"
        required
      />

      <Input
        type="email"
        label="Email"
        bind:value={inviteData.email}
        placeholder="jane@example.com"
        required
      />

      <p class="text-sm text-cream-600">
        They'll receive an email invitation to join your family office.
      </p>
    </form>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (inviteModalOpen = false)}>Cancel</Button>
      <Button onclick={handleInvite} loading={inviting}>
        <Mail class="w-4 h-4" />
        Send Invite
      </Button>
    {/snippet}
  </Modal>
</AppShell>
