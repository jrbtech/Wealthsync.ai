# WealthSync.ai

A family office operating system for high-net-worth families ($50M+) who need to coordinate multiple advisors, track wealth across entities, and manage critical deadlines.

**Value Proposition:** "Stop juggling your advisors. Start coordinating them."

## Features

- **Advisor Directory** - Manage all your advisors (CPAs, attorneys, wealth managers, etc.) in one place
- **Deadline Tracker** - Never miss critical tax, legal, or insurance deadlines with calendar views and reminders
- **Document Vault** - Securely store and organize estate plans, tax returns, policies, and more
- **Net Worth Tracker** - Track wealth across multiple entities (trusts, LLCs, foundations)
- **Meeting Notes** - Log advisor meetings with action items and follow-ups
- **AI Assistant** - Summarize documents, clean up meeting notes, and generate reports
- **Family Collaboration** - Invite family members with role-based permissions

## Tech Stack

- **Frontend:** SvelteKit 5 + TypeScript
- **Styling:** Tailwind CSS 4
- **Backend/Auth:** Firebase (Firestore + Auth)
- **Payments:** Stripe
- **AI:** Anthropic Claude API
- **File Storage:** Firebase Storage

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Stripe account
- Anthropic API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and fill in your keys
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for required environment variables:

- Firebase configuration (API key, project ID, etc.)
- Firebase Admin credentials
- Stripe keys and price IDs
- Anthropic API key

## Development

```bash
# Development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

1. Set up Firebase project with Authentication and Firestore enabled
2. Create Stripe products for pricing tiers (Foundation, Growth, Legacy)
3. Configure environment variables in your hosting platform
4. Deploy to Vercel, Render, or any Node.js hosting

```bash
npm run build
```

## Pricing Tiers

| Tier | Price | Family Members | Advisors |
|------|-------|----------------|----------|
| Foundation | $2,000/mo | 3 | 10 |
| Growth | $3,500/mo | 8 | Unlimited |
| Legacy | $6,000/mo | Unlimited | Unlimited |

## License

Proprietary - All rights reserved
