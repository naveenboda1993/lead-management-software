# LeadCRM - AI-Powered Lead Management SaaS

## Documentation

See the [`docs/`](./docs) folder for full documentation:

| Document | Description |
|----------|-------------|
| [Setup Guide](./docs/setup.md) | Environment setup, installations, seed data |
| [Tester Flow](./docs/tester-flow.md) | End-to-end testing flows, permissions, edge cases |

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with your Supabase credentials
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, ShadCN UI
- **Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI:** LangGraph, OpenAI / OpenRouter
- **Deployment:** Vercel, Docker, PWA, Capacitor (Android / iOS)

## PWA & Mobile

- **PWA** — Installable on mobile home screen with offline caching and push notifications
- **Capacitor** — Native Android APK and iOS IPA builds for App Store / Play Store distribution

See [docs/setup.md](./docs/setup.md) for PWA and Capacitor setup instructions.
