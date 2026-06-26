# LeadCRM Documentation

## Navigation

| Document | Description |
|----------|-------------|
| [Setup Guide](./setup.md) | Environment setup, installations, and configuration |
| [Tester Flow](./tester-flow.md) | End-to-end testing flows for all features |

## Project Overview

LeadCRM is a production-ready AI-powered Lead Management SaaS built with:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI Agents:** LangGraph with OpenAI/OpenRouter integration
- **Deployment:** Vercel

## Key Features

- **Lead Management** — CRUD, bulk actions, CSV import, filters, search
- **Pipeline Kanban** — Drag-and-drop lead stage management
- **Task Management** — Assign, track, complete/cancel tasks per lead
- **Document Storage** — Upload, preview, download, version tracking via Supabase Storage
- **Dashboard & Analytics** — KPIs, charts, conversion metrics, team performance
- **AI-Powered Tools** — Lead scoring, follow-up generation, email writing, meeting summaries, conversion prediction
- **Role-Based Access Control** — 5 roles with granular permissions
- **Audit Logging** — Full activity trail with export
- **Real-time Updates** — Live data via Supabase Realtime subscriptions
