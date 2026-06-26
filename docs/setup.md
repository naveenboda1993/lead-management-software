# Setup Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- A Supabase project (free tier works)
- (Optional) OpenAI API key or OpenRouter API key for AI features

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Service role key (for seed script) |
| `OPENAI_API_KEY` | No | OpenAI API key (fallback LLM) |
| `OPENROUTER_API_KEY` | No | OpenRouter API key (default LLM) |

*\*Required only for the seed script, not for the running application.*

## Database Setup

### Option A: Run Migration (Recommended)

1. Go to your Supabase project dashboard → SQL Editor
2. Open and run `supabase/schema.sql` — this creates all tables, enums, indexes, RLS policies, triggers, and functions

### Option B: Run Migration File

1. Go to Supabase → SQL Editor
2. Open and run `supabase/migrations/001_initial_schema.sql`

## Auth Users Workaround

Supabase's GoTrue API has a known issue returning `500 Database error creating new user`. To work around this:

1. Go to Supabase → SQL Editor
2. Open and run `supabase/seed-auth-users.sql`
3. This creates test auth users directly in the `auth.users` table

## Seed Data

After running the SQL migration and auth users SQL:

```bash
npx tsx --env-file=.env.local supabase/seed.ts
```

This creates:
- 3 organizations
- 5 test users (one per role)
- 50+ leads across all stages
- 30+ tasks
- 10+ documents
- Activity history and audit logs

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@leadcrm.com | Test@123456 |
| Admin | admin@leadcrm.com | Test@123456 |
| Sales Manager | manager@leadcrm.com | Test@123456 |
| Sales Executive | executive@leadcrm.com | Test@123456 |
| Viewer | viewer@leadcrm.com | Test@123456 |

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Middleware invocation failed` on Vercel | Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel project env vars |
| `Database error creating new user` | Use `seed-auth-users.sql` workaround instead of API |
| Seed script fails with WebSocket error | Ensure `ws` package is installed (`npm install ws`) |
| AI features return 500 | Check OpenRouter/OpenAI API key is valid |
