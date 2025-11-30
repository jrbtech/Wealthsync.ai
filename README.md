# WealthSync.ai

AI-powered wealth audit platform for RIAs, estate counsel, and wealth advisors. Generate institutional-quality client reports and bill $5k/client.

**Value Proposition:** "AI Wealth Audits → Bill $5k/client"

## Features

- **AI Wealth Analysis** - Comprehensive net worth assessment with Claude AI
- **Risk Assessment** - Systematic identification of tax, legal, insurance, and liquidity exposures
- **PDF Report Generator** - White-label, institutional-quality PDFs with your firm branding
- **Advisor Coordination** - Action plans for CPAs, estate counsel, and wealth managers
- **Compliance Calendar** - 12-month regulatory and filing deadline tracking
- **Stripe Billing** - $997/mo subscription with Stripe Checkout

## Tech Stack

- **Frontend:** SvelteKit 2.0 + Svelte 5 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn-svelte components
- **Backend/Auth:** Firebase (Firestore + Auth)
- **Payments:** Stripe
- **AI:** Anthropic Claude API
- **PDF:** jsPDF (Cloudflare-compatible)
- **Hosting:** Cloudflare Pages

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your API keys in .env

# Start development server
npm run dev
```

Open http://localhost:5173

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication > Google Sign-In
3. Create Firestore database
4. Copy config to `.env`:
   - PUBLIC_FIREBASE_API_KEY
   - PUBLIC_FIREBASE_AUTH_DOMAIN
   - PUBLIC_FIREBASE_PROJECT_ID
   - PUBLIC_FIREBASE_STORAGE_BUCKET
   - PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - PUBLIC_FIREBASE_APP_ID

5. Generate Admin SDK key:
   - Project Settings > Service accounts > Generate new private key
   - Copy private key and client email to `.env`

## Stripe Setup

1. Create Stripe account at https://dashboard.stripe.com
2. Copy API keys to `.env`:
   - PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
3. Create a product with $997/mo price
4. Copy price ID to `.env`:
   - STRIPE_FOUNDATION_PRICE_ID

## Claude API Setup

1. Get API key from https://console.anthropic.com
2. Add to `.env`:
   - ANTHROPIC_API_KEY

## Development

```bash
# Development server
npm run dev

# Type checking
npm run check

# Run tests
npm run test:run

# Build for production
npm run build
```

## Deploy to Cloudflare Pages

### Option 1: CLI Deploy

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run deploy
```

### Option 2: Git Integration

1. Push to GitHub/GitLab
2. Connect repo in Cloudflare Pages dashboard
3. Set build command: `npm run build`
4. Set build output: `.svelte-kit/cloudflare`
5. Add environment variables in Cloudflare dashboard

### Environment Variables in Cloudflare

Add these in Cloudflare Pages > Settings > Environment Variables:

```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_CLIENT_EMAIL
PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_FOUNDATION_PRICE_ID
ANTHROPIC_API_KEY
PUBLIC_APP_URL (your cloudflare URL)
```

## Project Structure

```
src/
├── lib/
│   ├── components/        # UI components
│   │   ├── ui/           # Base UI (Button, Card, Modal, etc.)
│   │   └── layout/       # AppShell, Sidebar
│   ├── firebase/         # Firebase client & admin
│   ├── stores/           # Svelte stores (auth, etc.)
│   ├── types/            # TypeScript types
│   └── utils/            # Formatters, PDF generator
├── routes/
│   ├── +page.svelte      # Landing page with demo form
│   ├── auth/             # Login/signup
│   ├── dashboard/        # Main dashboard
│   ├── wealth-clients/   # Client management
│   ├── report/[id]/      # Report viewer
│   └── api/
│       ├── demo/         # Demo sample generation
│       └── wealth-reports/ # AI report generation
└── app.css               # Global styles
```

## File Structure for Key Features

### Landing Page Demo Form
- `src/routes/+page.svelte` - Hero with "Free Sample Report" button
- `src/routes/api/demo/generate-sample/+server.ts` - AI → jsPDF generation

### AI Report Generation
- `src/routes/api/wealth-reports/generate/+server.ts` - Claude AI prompts
- `src/routes/api/wealth-reports/pdf/+server.ts` - jsPDF PDF generation

### Firebase Auth
- `src/lib/firebase/client.ts` - Firebase client init
- `src/lib/stores/auth.ts` - Auth state store
- `src/routes/+layout.svelte` - Auth guard

### Stripe Checkout
- `src/routes/api/stripe/checkout/+server.ts` - Create checkout session
- `src/routes/api/stripe/webhook/+server.ts` - Handle webhooks

## Firestore Schema

```
users/{userId}
  - email
  - displayName
  - firmName
  - subscriptionStatus
  - createdAt

clients/{clientId}
  - firmId
  - clientName
  - clientType
  - estimatedNetWorth
  - entities[]
  - assets[]
  - liabilities[]
  - advisors[]
  - createdAt

reports/{reportId}
  - firmId
  - clientId
  - type (wealth_audit | advisor_coordination | compliance_calendar | estate_summary | quarterly_review)
  - title
  - executiveSummary
  - netWorthSummary
  - risks[]
  - recommendations[]
  - createdAt

subscriptions/{userId}
  - stripeCustomerId
  - stripeSubscriptionId
  - status
  - planId
```

## Pricing

| Plan | Price | Reports/mo |
|------|-------|------------|
| Pro | $997/mo | Unlimited |

## License

Proprietary - All rights reserved
