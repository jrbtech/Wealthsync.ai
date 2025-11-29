<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Privacy Policy - WealthSync.ai</title>
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
    <h1 class="text-4xl font-display font-bold text-navy-900 mb-4">Privacy Policy</h1>
    <p class="text-navy-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

    <div class="prose prose-navy max-w-none">
      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">1. Introduction</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        WealthSync Technologies, Inc. ("WealthSync.ai", "we", "us", or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our family office management platform and related services.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">2. Information We Collect</h2>
      <p class="text-navy-700 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
      <ul class="list-disc pl-6 text-navy-700 space-y-2 mb-6">
        <li>Account information (name, email address, password)</li>
        <li>Family office information (family name, member details)</li>
        <li>Financial data (assets, liabilities, entity structures)</li>
        <li>Advisor and contact information</li>
        <li>Documents and files you upload</li>
        <li>Communications and correspondence</li>
      </ul>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">3. How We Use Your Information</h2>
      <p class="text-navy-700 leading-relaxed mb-4">We use the information we collect to:</p>
      <ul class="list-disc pl-6 text-navy-700 space-y-2 mb-6">
        <li>Provide, maintain, and improve our services</li>
        <li>Process transactions and send related information</li>
        <li>Send technical notices, updates, and administrative messages</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Monitor and analyze trends, usage, and activities</li>
        <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
      </ul>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">4. Data Security</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        We implement industry-standard security measures to protect your data, including 256-bit AES encryption at rest and in transit, SOC 2 Type II compliance, and regular security audits. Access to personal information is restricted to authorized personnel who require it for legitimate business purposes.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">5. Data Retention</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
      </p>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">6. Your Rights</h2>
      <p class="text-navy-700 leading-relaxed mb-4">You have the right to:</p>
      <ul class="list-disc pl-6 text-navy-700 space-y-2 mb-6">
        <li>Access your personal information</li>
        <li>Correct inaccurate or incomplete data</li>
        <li>Request deletion of your data</li>
        <li>Object to or restrict processing</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h2 class="text-2xl font-display font-semibold text-navy-900 mt-10 mb-4">7. Contact Us</h2>
      <p class="text-navy-700 leading-relaxed mb-6">
        If you have any questions about this Privacy Policy, please contact us at:
        <br /><br />
        <strong>WealthSync Technologies, Inc.</strong><br />
        Email: <a href="mailto:privacy@wealthsync.ai" class="text-accent-600 hover:underline">privacy@wealthsync.ai</a>
      </p>
    </div>
  </main>
</div>
