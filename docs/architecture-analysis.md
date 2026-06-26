# LeadCRM — Complete Application Architecture Analysis

**Generated**: 2026-06-26
**Framework**: Next.js 16.2.9 (Turbopack) + TypeScript (strict)
**Database**: Supabase (PostgreSQL)
**UI**: Tailwind CSS v4 + Radix UI + shadcn-style components
**State**: TanStack React Query v5 + Zustand v5
**AI**: LangChain / LangGraph (10 agents)
**Auth**: Sup Auth (SSR)

---

## 1. Project Structure

```
lead-management-software/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Public routes: login, register, forgot-password, reset-password
│   │   ├── (dashboard)/     # Protected routes (22 modules, 48 pages)
│   │   └── api/             # REST API routes (20+ groups, 60+ files)
│   ├── agents/              # 10 LangGraph AI agents
│   ├── components/
│   │   ├── ui/              # 25 Radix-based primitives (shadcn-style)
│   │   ├── layout/          # App shell, sidebar, header, permission guard
│   │   ├── charts/          # 7 Recharts components
│   │   ├── leads/           # Lead form, filters, bulk actions, activity timeline
│   │   ├── pipeline/        # Kanban board, column, lead card
│   │   └── tasks/           # Task form, filters
│   ├── hooks/               # 21 custom React hooks (TanStack Query wrappers)
│   ├── lib/
│   │   ├── supabase/        # 4 clients: browser, server, admin, middleware
│   │   ├── ai/              # LLM factory (OpenAI / OpenRouter)
│   │   ├── api/             # Response helpers, auth, audit logging
│   │   ├── constants/       # Labels, colors, permissions, pipeline stages
│   │   ├── utils/           # cn(), formatCurrency, formatDate
│   │   └── validations/     # Zod schemas (auth, lead, task, document)
│   ├── providers/           # Auth provider, query provider, theme provider
│   └── types/               # All TypeScript interfaces & enums
├── supabase/migrations/     # 3 migration files (31 tables total)
├── docs/                    # Setup, API spec, tester flow
├── public/                  # Static assets
├── .github/                 # CI workflows
├── Dockerfile               # Multi-stage build (node:20-alpine)
└── docker-compose.yml       # Single service, port 3000
```

---

## 2. Routing & Auth Flow

### Middleware — `src/proxy.ts`

```
Request → proxy(request)
  ├─ Public route? (/login, /register, /forgot-password, /api/auth/*)
  │   └─ Yes → NextResponse.next()
  ├─ Authenticated? (supabase.auth.getUser())
  │   └─ No → redirect /login?redirect=<path>
  ├─ Role check (configured in roleRouteMap)
  │   └─ Unauthorized → redirect /dashboard
  └─ Pass → return supabaseResponse
```

### Route Groups

| Group | Layout | Routes |
|---|---|---|
| `(auth)` | Centered card + gradient bg | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `(dashboard)` | AppShell (sidebar + header) | 48 pages across 22 modules |

### Authentication Flow

1. **Auth Provider** listens to `supabase.auth.onAuthStateChange`
2. **Login**: `POST /api/auth/login` → `signInWithPassword` → session cookie
3. **Register**: `POST /api/auth/register` → admin client creates user + org + profile (with rollback on failure)
4. **Logout**: `POST /api/auth/logout` → `signOut()`
5. **Callback**: `GET /api/auth/callback` exchanges OAuth code (for future providers)

### Supabase Clients

| Client | File | Usage |
|---|---|---|
| Browser | `lib/supabase/client.ts` | `createBrowserClient` — hooks/UI |
| Server | `lib/supabase/server.ts` | `createServerClient` — API routes |
| Admin | `lib/supabase/admin.ts` | Service role — user creation |
| Middleware | `lib/supabase/middleware.ts` | `updateSession()` — proxy |

---

## 3. Database Schema — 31 Tables, 24 Enums

### Entity Relationship Diagram

```
organizations
  ├─ profiles (extends auth.users)
  │     └─ leads (owner_id, assigned_to)
  │           ├─ tasks, documents, activities
  │           ├─ tickets, call_logs, orders
  │           └─ property_interests → property_viewings
  ├─ properties (broker_id → brokers, assigned_to)
  │     ├─ commissions (broker_id)
  │     └─ property_interests
  ├─ brokers
  ├─ tickets → ticket_messages
  ├─ campaigns
  ├─ call_logs, virtual_numbers
  ├─ products → inventory, orders (JSONB items), suppliers, coupons
  ├─ attendance, leaves, payroll, performance_reviews
  ├─ google_ad_campaigns → ad_groups → ad_keywords
  └─ adsense_units, adsense_stats
```

### All Tables by Migration

**Migration 001** (7 tables): organizations, profiles, leads, tasks, documents, activities, audit_logs, lead_source_stats

**Migration 002** (22 tables): brokers, properties, commissions, tickets, ticket_messages, campaigns, call_logs, virtual_numbers, products, inventory, suppliers, orders, coupons, attendance, leaves, payroll, performance_reviews, google_ad_campaigns, google_ad_groups, google_ad_keywords, adsense_units, adsense_stats

**Migration 003** (2 tables): property_interests, property_viewings

### Key Enums (24 total)

Core: `user_role`, `lead_status`, `lead_source`, `lead_priority`, `task_status`, `task_type`, `activity_type`
Real Estate: `property_type`, `property_status`, `commission_status`, `interest_level`, `interest_status`, `viewing_status`
Support: `ticket_status`, `ticket_channel`
Marketing: `campaign_type`, `campaign_status`
Calls: `call_direction`, `call_status`
Commerce: `product_category`, `order_status`, `payment_status`
HR: `attendance_status`, `leave_status`, `leave_type`

### Row-Level Security

All 31 tables have **organization-scoped RLS** using `get_current_user_org_id()` helper:
- `org_select` — FOR SELECT USING
- `org_insert` — FOR INSERT WITH CHECK
- `org_update` — FOR UPDATE USING
- `org_delete` — FOR DELETE USING

Special cases:
- `leads`: Delete restricted to admin/manager roles
- `ticket_messages`: Public select/insert (customer portal access)

### Key Triggers

- `update_updated_at_column()` — all tables with updated_at
- `generate_lead_number()` — auto `LEAD-YYYYMMDD-NNNN`
- `log_lead_activity()` / `log_task_activity()` — auto activity entries
- `handle_new_user()` — auto profile on auth user creation
- `update_lead_source_stats()` — daily source aggregation

---

## 4. Data Flow Pattern

### Client-side (hooks pattern — primary)

```
Page ("use client")
  → Custom Hook (useQuery / useMutation)
    → Supabase Browser Client
      → supabase.from('table').select(...).eq('org_id', ...)
  → Renders UI with data / loading / error states
```

**Used by**: Leads, Properties, Tasks, Products, Orders, Suppliers, Tickets, Campaigns, Calls, HR modules

### Server-side (API route pattern — secondary)

```
Page → fetch('/api/resource')
  → API Route Handler
    → getAuthenticatedUser() (server Supabase client)
    → getOrganizationId()
    → Zod validation
    → Supabase query / mutation
    → logActivity() + logAuditEvent()
    → return successResponse() / error
```

**Used by**: Auth, CSV import, Brokers, Coupons, Documents, Dashboards, AI agents, Brokers, Ads

### Realtime

```typescript
useRealtimeLeads(orgId)  → invalidates ['leads'] on any change
useRealtimeTasks(orgId)  → invalidates ['tasks']
useRealtimeDashboard(orgId) → invalidates ['leads', 'tasks']
```

---

## 5. Permissions System — 16 Roles

All roles mapped in `src/lib/constants/index.ts` as `{ action, subject }[]`:

| Role | Level | Key Permissions |
|---|---|---|
| SUPER_ADMIN | Full | All 20+ subjects, manage permissions |
| ADMIN | Full | All subjects |
| EMPLOYER | Full | All subjects |
| MANAGER | Broad | Lead + task + property + ticket + campaign + call + attendance + leave + ads + broker, read-only user/inventory/payroll |
| SALES_MANAGER | Sales + Reports | Lead CRUD + task + document + report + call, read-only user/property/ticket/campaign |
| TEAM_LEADER | Limited | Lead CRUD + task CRUD + read document |
| SALES_EXECUTIVE | Lead-focused | Lead CRUD + task CRUD + document CRUD, read property/ticket, create ticket |
| MARKETING_EXECUTIVE | Marketing | Campaign + ads + adsense, create/read lead, read report/document |
| HR | People | User CRUD + attendance + leave + payroll + document |
| RECRUITER | Limited HR | Read user, create/read lead |
| FINANCE | Financial | Payroll + commission, read order/report |
| CUSTOMER | Self-service | Read order + ticket CRUD + read document/property |
| VENDOR | Supply | Read product/order, create supplier |
| VIEWER | Read-only | Lead, task, document, report, property |

**Sidebar filtering**: Each section uses `usePermissions` — sections without any accessible subjects are hidden entirely.

---

## 6. Feature Inventory

### Implemented (Full CRUD + UI)

| Module | Tables | Pages | Hooks | Notes |
|---|---|---|---|---|
| **Leads** | leads | List (DataTable) + Detail + Kanban | `useLeads`, `useLead`, `useCreateLead`, `useUpdateLead`, `useDeleteLead`, `useLeadActivities`, `usePipeline` | CSV import, bulk actions, AI scoring |
| **Tasks** | tasks | List | `useTasks`, `useTask`, `useCreate/Update/DeleteTask` | Filters by lead/status |
| **Properties** | properties | List + Detail | `useProperties`, `useProperty` | 3 tabs: Details, Media, Leads (with interests & viewings) |
| **Property Interests** | property_interests | Embedded in property/lead detail | `usePropertyInterestsByLead`, `usePropertyInterestsByProperty` | Interest level, status, budget |
| **Property Viewings** | property_viewings | Embedded in property/lead detail | `useViewingsByLead`, `useViewingsByProperty` | Schedule, complete, cancel |
| **Brokers** | brokers | List | `useBrokers` | CRUD with commission rate |
| **Tickets** | tickets, ticket_messages | List + Detail + messages | `useTickets` per-entity hooks | Multi-channel support |
| **Campaigns** | campaigns | List + Detail + New | `useCampaigns` per-entity hooks | AI campaign generation |
| **Calls / IVR** | call_logs, virtual_numbers | List + Virtual numbers | `useCalls` per-entity hooks | Exotel/Twilio/Knowlarity |
| **Products** | products | List + Detail | `useProducts` per-entity hooks | SKU, category, variants |
| **Inventory** | inventory | Inventory page | `useProducts` (joined) | Reorder levels |
| **Orders** | orders | List + Detail | `useOrders` per-entity hooks | Order items as JSONB |
| **Suppliers** | suppliers | List + Detail | `useSuppliers` per-entity hooks | Payment terms, lead time |
| **Coupons** | coupons | List | `useCoupons` per-entity hooks | Active toggle, usage limits |
| **Employees** | profiles | List + Detail | `useEmployees` per-entity hooks | Role management |
| **Attendance** | attendance | Dashboard-style | (via employees) | Check-in/out, late tracking |
| **Leaves** | leaves | Dashboard-style | (via employees) | Approval workflow |
| **Payroll** | payroll | Dashboard-style | (via employees) | Monthly processing |
| **Performance Reviews** | performance_reviews | Dashboard-style | (via employees) | Rating, goals, feedback |
| **Documents** | documents | List | `useDocuments` per-entity hooks | Version tracking |
| **Audit Logs** | audit_logs | List | (via API) | Append-only trail |
| **Notifications** | (Realtime channel) | List | `useNotifications` | Read/unread, mark-all-read |
| **Dashboards** | (aggregated) | Main, Employer, Sales, Marketing | `useDashboard` per-type | 7 chart components |
| **Google Ads** | google_ad_campaigns + groups + keywords | List + Detail | (via API) | Campaign management |
| **AdSense** | adsense_units + stats | Dashboard | (via API) | Earnings tracking |
| **Settings** | organizations | Settings page | `useUser` | Org profile update |
| **Customer Portal** | (orders + tickets) | Portal, Portal Orders, Portal Tickets | Existing hooks | Self-service |

### Gaps

| Feature | What's Missing |
|---|---|
| **Commissions page** | Tables & hooks exist (`useBrokers`), but no dedicated UI page with broker-property-lead linkage |
| **Full-text search** | Header search navigates to `/search?q=` but no result page |
| **Google OAuth** | Login button renders but shows "coming soon" toast |
| **Search results page** | No `/search` route exists |
| **Some dashboard sub-pages** | Routes exist with basic/default content |

---

## 7. AI Integration — 10 LangGraph Agents

### Architecture

All agents follow the same pattern:

```
LangGraph StateGraph
  → Multiple nodes (LangChain LLM calls with structured JSON output)
  → Compiled agent → exported function
  → API route: authenticate + fetch data + invoke agent + log activity
```

### Agent Inventory

| Agent | Nodes | Output | Endpoint |
|---|---|---|---|
| **Lead Scoring** | analyze | score (1-100), probability, recommendation, reasoning | `POST /api/ai/lead-scoring` |
| **Email Writer** | determineTemplate → gatherContext → draftEmail → polishEmail | subject, body, type, personalization | `POST /api/ai/email-writer` |
| **Follow-up Generator** | analyzeContext → generateMessages → formatOutput | messages (whatsapp/email/general), tone, timing | `POST /api/ai/follow-up` |
| **Conversion Prediction** | analyzeHistory → evaluateFactors → predictOutcome → suggestActions → formatPrediction | winProbability, expectedRevenue, actions, reasoning | `POST /api/ai/conversion-prediction` |
| **Meeting Summary** | parseTranscript → identifyDecisions → extractActions → assessRisks → determineNextSteps → formatSummary | summary, decisions, actionItems, risks, nextSteps | `POST /api/ai/meeting-summary` |
| **Customer Support** | analyzeIssue → suggestSolution → formatResponse | category, sentiment, response, resolution, priority, escalate | `POST /api/ai/customer-support` |
| **Marketing Campaign** | analyzeGoal → createStrategy → generateContent | campaignName, audience, channels, content, schedule, kpis | `POST /api/ai/marketing-campaign` |
| **Sales Forecast** | analyzeHistory → predictForecast → identifyRisks | forecast[], confidence, drivers, risks | `POST /api/ai/sales-forecast` |
| **Property Recommendation** | analyzePreferences → matchProperties | recommendations[], top_match | `POST /api/ai/property-recommendation` |
| **Ads Optimization** | analyzePerformance → optimizeBidding → suggestKeywords | performance, recommendations, budgetAllocation, suggestions | `POST /api/ai/ads-optimization` |

### LLM Configuration (`src/lib/ai/llm.ts`)

- Providers: OpenAI or OpenRouter (auto-detected via env vars)
- Default model: `gpt-4` (OpenAI) or `openrouter/auto`
- Temperature: 0.2–0.7 per agent
- Custom OpenRouter headers: HTTP-Referer, X-Title

---

## 8. Component Architecture

### UI Primitives (25 components in `src/components/ui/`)

All built on Radix UI + Tailwind:
`avatar`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `collapsible`, `command`, `data-table`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `scroll-area`, `select`, `separator`, `skeleton`, `switch`, `tabs`, `table`, `textarea`, `toast` (sonner), `tooltip`

### Layout Components (`src/components/layout/`)

| Component | Role |
|---|---|
| `app-shell.tsx` | Main wrapper: sidebar + header + content |
| `sidebar.tsx` | Responsive, role-filtered, 8 nav sections |
| `header.tsx` | Search bar, notifications badge, user dropdown |
| `permission-guard.tsx` | Conditionally renders children or "access denied" |
| `loading.tsx` | Spinner placeholder |

### Chart Components (`src/components/charts/`)

| Component | Type | Data Source |
|---|---|---|
| `kpi-card.tsx` | Metric card | Dashboard API |
| `leads-by-source-chart.tsx` | Pie/Bar | Leads grouped by source |
| `leads-by-status-chart.tsx` | Bar | Leads grouped by status |
| `monthly-conversions-chart.tsx` | Line | Won/lost over time |
| `sales-funnel-chart.tsx` | Funnel | Pipeline stage counts |
| `team-performance-chart.tsx` | Bar | Assignee conversion rates |

### Feature Components

| Component | Purpose |
|---|---|
| `lead-form.tsx` | Create/edit with Zod validation |
| `lead-filters.tsx` | Multi-filter: status, source, priority, date range, value |
| `bulk-actions.tsx` | Bulk assign, export CSV, delete |
| `activity-timeline.tsx` | Chronological feed per lead |
| `kanban-board.tsx` | Drag-and-drop (`@hello-pangea/dnd`) |
| `kanban-column.tsx` | Single pipeline stage |
| `lead-card.tsx` | Compact lead card for kanban |
| `task-form.tsx` | Create/edit with type, status, due date |

---

## 9. Key Configuration Files

### `package.json` — Critical Dependencies

| Category | Package |
|---|---|
| Framework | Next.js 16.2.9, React 19.2.4 |
| UI | Radix UI (11 primitives), lucide-react, recharts, sonner |
| Styling | Tailwind CSS v4, tailwindcss-animate, tailwind-merge, clsx, cva |
| Forms | react-hook-form v7.80, @hookform/resolvers, zod v4 |
| Data | @supabase/ssr, @tanstack/react-query v5, @tanstack/react-table v8 |
| AI | @langchain/core, @langchain/langgraph, @langchain/openai |
| Utilities | date-fns, papaparse, xlsx, zustand v5 |
| DnD | @hello-pangea/dnd |

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
};
```

### `tsconfig.json`

- Target: ES2017, strict mode, JSX react-jsx
- Module: bundler, path alias `@/*` → `./src/*`

### `postcss.config.mjs`

- `@tailwindcss/postcss` plugin (Tailwind v4 approach)

---

## 10. Summary Statistics

| Metric | Count |
|---|---|
| TypeScript source files | ~150+ |
| Database tables | 31 |
| Database enums | 24 |
| TypeScript enums | 17 |
| TypeScript interfaces | 28 |
| Page routes | 48 |
| API route files | 60+ |
| Custom React hooks | 21 |
| UI components | 25 |
| Chart components | 7 |
| AI agents | 10 |
| AI API endpoints | 10 |
| Role definitions | 16 |
| Permission sets | 16 |
| npm dependencies | ~40 |
