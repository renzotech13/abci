# BullyPedex Clone

A modern, full-featured replica of [bullypedex.com](https://bullypedex.com) — the global pedigree database and certification registry for the bully community — built with **Next.js 16 + TypeScript + Tailwind CSS v4**.

## What's included (functional clone)

### Core registry features (replicated from bullypedex.com)
- Landing page with hero, stats, features and testimonials
- User registration & login (localStorage-based auth)
- Kennel profile / dashboard
- **Dog registration** (3-step wizard) → instant BPKC-style certificate
- **Bulk Litter Registration** — register an entire litter at once
- **Ownership Transfers** — email-based transfer flow with status tracking
- **Certificate Verification** — public, no-account-needed cert lookup by ID
- Standalone **public certificate page** with QR code and print mode
- **Pedigree Search** — full-text search across all registered dogs
- **Breeder Directory** with country filter + individual kennel profile pages
- **Blog** with 6 articles (including the "How-to Guide on Bully Pedigrees")
- **Code of Conduct** page
- **Membership Plans** (Free / Pro / Elite) with FAQs

### Added-value features (not in original)
- AI Breed Analyzer — upload a photo, get variant prediction, color genetics and weight estimate
- Verified Marketplace — puppies, adults, stud service and equipment
- Events Calendar — shows, expos, meetups with one-click registration
- Health Vault — track vaccinations, OFA tests, weight, vet history
- Interactive 4-generation pedigree tree with COI calculator
- Dark/light theme toggle
- Printable certificates with watermark
- Help Center with searchable guides
- Contact form with topic routing

## Demo account

To skip signup, click "Try with demo account" on the login page, or use:
- Email: `demo@bullypedex.app`
- Password: `demo1234`

The demo account has 5 pre-registered dogs, health records, an active marketplace listing and an elite membership.

## Sample certificate IDs to verify

- `BPX-2025-DIESEL-01`
- `BPX-2025-NOVA-02`
- `BPX-1024-ZEUS-19`
- `BPX-2024-ROCKY-77`

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript strict mode
- Tailwind CSS v4 with custom design tokens
- localStorage for the prototype data layer (no backend needed — instantly deployable)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

```bash
npx vercel --prod
```

Or import the repo directly from the [Vercel dashboard](https://vercel.com/new).
