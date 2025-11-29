<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Terms of Service - WealthSync.ai</title>
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Header -->
  <header class="border-b border-cream-200 bg-white">
    <div class="max-w-4xl mx-auto px-6 py-6">
      <Button href="/" variant="ghost" size="sm">
        <ArrowLeft class="w-4 h-4" />
        Back to Home
      </Button>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-display font-bold text-navy-900 mb-4">Terms of Service</h1>
    <p class="text-navy-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

    <div class="prose prose-navy max-w-none">
      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">1. Acceptance of Terms</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        By accessing or using WealthSync.ai (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all visitors, users, and others who access the Service.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">2. Description of Service</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        WealthSync.ai provides a cloud-based family office management platform that enables users to consolidate financial information, coordinate with advisors, track deadlines, store documents, and generate reports. The Service is designed for family offices, high-net-worth individuals, and their professional advisors.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">3. User Accounts</h2>
      <p class="text-navy-700 leading-relaxed mb-4">When you create an account with us, you must:</p>
      <ul class="list-disc pl-6 text-navy-700 space-y-2 mb-6">
        <li>Provide accurate, complete, and current information</li>
        <li>Maintain the security of your password and account</li>
        <li>Accept responsibility for all activities under your account</li>
        <li>Notify us immediately of any unauthorized access</li>
      </ul>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">4. Subscription and Billing</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        Access to certain features requires a paid subscription. Subscription fees are billed in advance on a monthly basis. You authorize us to charge your payment method for all fees incurred. Subscriptions automatically renew unless cancelled before the renewal date.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">5. Acceptable Use</h2>
      <p class="text-navy-700 leading-relaxed mb-4">You agree not to:</p>
      <ul class="list-disc pl-6 text-navy-700 space-y-2 mb-6">
        <li>Use the Service for any unlawful purpose</li>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe upon the rights of others</li>
        <li>Transmit malicious code or interfere with the Service</li>
        <li>Attempt to gain unauthorized access to any systems</li>
        <li>Use the Service to store or transmit illegal content</li>
      </ul>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">6. Data Ownership</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        You retain all rights to the data you submit to the Service. By using the Service, you grant us a limited license to use, process, and store your data solely to provide the Service to you. We do not sell, share, or monetize your data.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">7. Limitation of Liability</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        To the maximum extent permitted by law, WealthSync Technologies, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">8. Termination</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will cease immediately. You may export your data prior to termination.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">9. Changes to Terms</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">10. Contact Us</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        If you have any questions about these Terms, please contact us at:
        <br /><br />
        <strong>WealthSync Technologies, Inc.</strong><br />
        Email: <a href="mailto:legal@wealthsync.ai" class="text-accent-600 hover:underline">legal@wealthsync.ai</a>
      </p>
    </div>
  </main>
</div>
