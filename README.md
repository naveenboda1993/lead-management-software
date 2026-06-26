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
- **Deployment:** Vercel
