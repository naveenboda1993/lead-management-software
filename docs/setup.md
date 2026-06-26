# Setup Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- A Supabase project (free tier works)
- (Optional) OpenAI API key or OpenRouter API key for AI features
- (Optional) Exotel / Twilio / Knowlarity account for IVR features
- (Optional) Google Ads API access for ad management
- (Optional) Google AdSense account for revenue tracking

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for seed script) |

### AI / LLM
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (fallback LLM) |
| `OPENROUTER_API_KEY` | OpenRouter API key (default LLM) |
| `OPENROUTER_REFERRER` | OpenRouter referrer header |
| `OPENROUTER_APP_NAME` | OpenRouter app name |
| `LLM_BASE_URL` | Custom LLM base URL |
| `LLM_MODEL` | LLM model name (default: gpt-4) |

### IVR (Optional)
| Variable | Description |
|----------|-------------|
| `EXOTEL_API_KEY` | Exotel API key |
| `EXOTEL_API_SECRET` | Exotel API secret |
| `EXOTEL_ACCOUNT_SID` | Exotel account SID |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `KNOWLARITY_API_KEY` | Knowlarity API key |
| `KNOWLARITY_API_SECRET` | Knowlarity API secret |

### Google Ads (Optional)
| Variable | Description |
|----------|-------------|
| `GOOGLE_ADS_CLIENT_ID` | Google Ads OAuth client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Ads OAuth client secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads developer token |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads customer ID |

### Google AdSense (Optional)
| Variable | Description |
|----------|-------------|
| `GOOGLE_ADSENSE_CLIENT_ID` | AdSense OAuth client ID |
| `GOOGLE_ADSENSE_CLIENT_SECRET` | AdSense OAuth client secret |

### App
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Application URL (http://localhost:3000 for dev) |

## Database Setup

### Step 1: Run Base Migration
1. Go to Supabase dashboard → SQL Editor
2. Run `supabase/schema.sql` — creates base tables, enums, indexes, RLS, triggers

### Step 2: Run Modules Migration
1. Run `supabase/migrations/002_modules_schema.sql` — creates all extended module tables (properties, tickets, campaigns, call_logs, products, orders, attendance, leaves, payroll, google_ads, adsense, etc.)

## Auth Users Workaround

Supabase's GoTrue API has a known 500 error. To create test users:

1. Go to Supabase → SQL Editor
2. Run `supabase/seed-auth-users.sql`
3. This inserts auth users directly into `auth.users`

## Seed Data

```bash
npx tsx --env-file=.env.local supabase/seed.ts
```

Creates:
- 3 organizations
- 15 test users (one per role)
- 50+ leads across all stages
- 30+ tasks
- 10+ documents
- 20+ properties
- 15+ products
- Sample orders, campaigns, tickets, attendance records

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@leadcrm.com | Test@123456 |
| Admin | admin@leadcrm.com | Test@123456 |
| Employer | employer@leadcrm.com | Test@123456 |
| Manager | manager@leadcrm.com | Test@123456 |
| Team Leader | teamleader@leadcrm.com | Test@123456 |
| Employee | employee@leadcrm.com | Test@123456 |
| Sales Executive | executive@leadcrm.com | Test@123456 |
| Sales Manager | salesmanager@leadcrm.com | Test@123456 |
| Marketing Executive | marketing@leadcrm.com | Test@123456 |
| HR | hr@leadcrm.com | Test@123456 |
| Recruiter | recruiter@leadcrm.com | Test@123456 |
| Finance | finance@leadcrm.com | Test@123456 |
| Customer | customer@leadcrm.com | Test@123456 |
| Vendor | vendor@leadcrm.com | Test@123456 |
| Viewer | viewer@leadcrm.com | Test@123456 |

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker Deployment

```bash
docker-compose up --build
```

## Running Tests

```bash
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check
npm run build     # Production build
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Middleware invocation failed` on Vercel | Add Supabase env vars to Vercel project |
| `Database error creating new user` | Use `seed-auth-users.sql` workaround |
| Seed script fails WebSocket | `npm install ws` (Node 20 workaround) |
| AI features return 500 | Check OpenRouter/OpenAI API key validity |
| IVR features not working | Ensure Twilio/Exotel/Knowlarity credentials are set |
| Google Ads API errors | Verify developer token and OAuth consent screen |
