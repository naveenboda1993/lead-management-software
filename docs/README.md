# LeadCRM Documentation

## Navigation

| Document | Description |
|----------|-------------|
| [Setup Guide](./setup.md) | Environment setup, installations, and configuration |
| [Tester Flow](./tester-flow.md) | End-to-end testing flows for all features |
| [API Specification](./api-specification.md) | Complete REST API documentation |

## Project Overview

LeadCRM is a production-ready multi-tenant Business Management Platform built with:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI Agents:** LangGraph with OpenAI/OpenRouter (10 agents)
- **Deployment:** Vercel, Docker

## All Modules

| # | Module | Routes | Description |
|---|--------|--------|-------------|
| 1 | **User Management** | Login, Register, Settings | 15 roles, RBAC, MFA-ready, team management |
| 2 | **CRM** | Leads, Pipeline, Tasks, Documents | Lead tracking, Kanban, CRUD, bulk actions, CSV import |
| 3 | **IVR System** | Calls, Virtual Numbers | Exotel/Twilio/Knowlarity, call recording, auto lead creation |
| 4 | **Marketing Automation** | Campaigns | SMS, Email, WhatsApp campaigns with tracking |
| 5 | **Google Ads** | Google Ads dashboard | Campaign/ad group/keyword management, CPC/CPA/ROAS |
| 6 | **AdSense** | AdSense dashboard | Ad units, revenue, impressions, RPM analytics |
| 7 | **Real Estate CRM** | Properties, Brokers | Property listings, broker management, commission tracking |
| 8 | **Ecommerce** | Products, Orders, Suppliers, Coupons | Catalog, inventory, order management, coupon system |
| 9 | **Employee Management** | Employees, Attendance, Leaves, Payroll | HR management, performance reviews |
| 10 | **Customer Portal** | Portal | Orders, tickets, properties, appointments |
| 11 | **Helpdesk** | Tickets | Ticketing system with email/WhatsApp/web portal channels |
| 12 | **Document Management** | Documents | Encrypted storage, version tracking, multi-entity attachments |
| 13 | **AI Agents** | 10 AI API endpoints | Lead scoring, scoring, property recommendation, marketing, ads optimization, support, sales forecast, meeting summary, email writer, follow-up |
| 14 | **Dashboards** | Main, Employer, Employee, Marketing, Sales | Role-specific analytics with KPIs and charts |

## Tech Stack Details

- **Frontend:** Next.js 16.2, React 19.2, TypeScript 5, Tailwind CSS v4, ShadCN UI, Recharts
- **State:** TanStack Query, React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL 15, Auth, Storage, Realtime)
- **AI:** LangGraph 1.4, LangChain, OpenAI / OpenRouter
- **Infrastructure:** Docker, GitHub Actions CI/CD, Vercel
