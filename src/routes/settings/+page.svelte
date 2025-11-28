<script lang="ts">
  import { AppShell } from '$lib/components/layout';
  import { Card, Button, Input, Avatar } from '$lib/components/ui';
  import { currentUser, currentFamily, authStore } from '$lib/stores/auth';
  import { success, error as showError } from '$lib/stores/ui';
  import { doc, updateDoc } from 'firebase/firestore';
  import { updatePassword } from 'firebase/auth';
  import { auth, db } from '$lib/firebase/client';
  import { User, Mail, Lock, Building } from 'lucide-svelte';

  const user = $derived($currentUser);
  const family = $derived($currentFamily);

  let profileData = $state({
    name: '',
    email: ''
  });

  let passwordData = $state({
    current: '',
    new: '',
    confirm: ''
  });

  let profileSaving = $state(false);
  let passwordSaving = $state(false);

  $effect(() => {
    if (user) {
      profileData.name = user.name;
      profileData.email = user.email;
    }
  });

  async function handleProfileUpdate() {
    if (!user) return;

    if (!profileData.name.trim()) {
      showError('Name is required');
      return;
    }

    profileSaving = true;

    try {
      await updateDoc(doc(db, 'users', user.id), {
        name: profileData.name.trim()
      });

      authStore.setUser({ ...user, name: profileData.name.trim() });
      success('Profile updated');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      profileSaving = false;
    }
  }

  async function handlePasswordUpdate() {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      showError('All password fields are required');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    passwordSaving = true;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      await updatePassword(currentUser, passwordData.new);

      passwordData = { current: '', new: '', confirm: '' };
      success('Password updated');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        showError('Current password is incorrect');
      } else if (err.code === 'auth/requires-recent-login') {
        showError('Please sign out and sign in again to change your password');
      } else {
        showError(err.message || 'Failed to update password');
      }
    } finally {
      passwordSaving = false;
    }
  }
</script>

<svelte:head>
  <title>Settings - WealthSync</title>
</svelte:head>

<AppShell title="Settings">
  <div class="max-w-2xl space-y-6">
    <!-- Profile -->
    <Card>
      <div class="flex items-center gap-3 mb-6">
        <User class="w-5 h-5 text-navy-800" />
        <h2 class="font-semibold text-navy-800">Profile</h2>
      </div>

      <div class="flex items-center gap-4 mb-6">
        <Avatar name={user?.name || ''} src={user?.avatarUrl} size="xl" />
        <div>
          <p class="font-medium text-navy-800">{user?.name}</p>
          <p class="text-sm text-cream-600">{user?.email}</p>
          <p class="text-xs text-cream-500 mt-1">
            {user?.role === 'primary' ? 'Primary Account Holder' : 'Family Member'}
          </p>
        </div>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} class="space-y-4">
        <Input
          label="Full Name"
          bind:value={profileData.name}
          placeholder="John Smith"
          required
        />

        <Input
          type="email"
          label="Email"
          value={profileData.email}
          disabled
          hint="Contact support to change your email address"
        />

        <div class="flex justify-end">
          <Button type="submit" loading={profileSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>

    <!-- Password -->
    <Card>
      <div class="flex items-center gap-3 mb-6">
        <Lock class="w-5 h-5 text-navy-800" />
        <h2 class="font-semibold text-navy-800">Password</h2>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }} class="space-y-4">
        <Input
          type="password"
          label="Current Password"
          bind:value={passwordData.current}
          autocomplete="current-password"
        />

        <Input
          type="password"
          label="New Password"
          bind:value={passwordData.new}
          autocomplete="new-password"
        />

        <Input
          type="password"
          label="Confirm New Password"
          bind:value={passwordData.confirm}
          autocomplete="new-password"
        />

        <div class="flex justify-end">
          <Button type="submit" loading={passwordSaving}>
            Update Password
          </Button>
        </div>
      </form>
    </Card>

    <!-- Family Office -->
    <Card>
      <div class="flex items-center gap-3 mb-6">
        <Building class="w-5 h-5 text-navy-800" />
        <h2 class="font-semibold text-navy-800">Family Office</h2>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-cream-600">Family Office Name</p>
          <p class="font-medium text-navy-800">{family?.name || 'Not set'}</p>
        </div>

        <div class="flex flex-wrap gap-4">
          <Button href="/settings/team" variant="secondary">
            Manage Team
          </Button>
          <Button href="/settings/billing" variant="secondary">
            Billing & Plan
          </Button>
        </div>
      </div>
    </Card>
  </div>
</AppShell>
