# Project Plan — Linear-like Project Management App

A team collaboration tool with workspaces, kanban boards, member management, Stripe subscriptions, and AI features.

## Milestone Overview

| # | Milestone | Status |
|---|-----------|--------|
| M1 | Foundation & Auth | Not Started |
| M2 | Workspaces & Boards | Not Started |
| M3 | Kanban Board | Not Started |
| M4 | Team & User Management | Not Started |
| M5 | Subscriptions (Stripe) | Not Started |
| M6 | AI Features | Not Started |
| M7 | Polish & Production | Not Started |

---

## M1 — Foundation & Auth

**Goal:** Standing up the core infrastructure — local Supabase, auth flows, UI shell, and onboarding.

**Tech:** Supabase (Docker), Shadcn UI, Tailwind 4, Resend

### Deliverables
- [ ] Supabase running locally via Docker (`supabase start`)
- [ ] `@supabase/ssr` configured for Next.js App Router (server + client helpers)
- [ ] Shadcn UI initialized, dark mode default with light toggle
- [ ] Auth pages: sign up, log in, log out, forgot password
- [ ] Middleware to protect authenticated routes
- [ ] Onboarding flow: create or join a workspace after first login
- [ ] Welcome email sent via Resend on signup
- [ ] Root layout with sidebar nav and header shell

**Notes:**
> _Record decisions here as they're made (e.g., auth strategy, email templates)_

---

## M2 — Workspaces & Boards

**Goal:** Core data model and CRUD for workspaces and boards.

**Tech:** Supabase (tables + RLS), Next.js Server Components, Route Handlers

### Deliverables
- [ ] DB schema: `workspaces`, `boards`, `columns`, `cards`, `workspace_members`
- [ ] Row-Level Security policies on all tables
- [ ] Workspace list and create/edit/delete
- [ ] Board list per workspace
- [ ] Board create/edit/delete

**Notes:**
> _Record schema decisions, RLS patterns, migration notes_

---

## M3 — Kanban Board

**Goal:** Interactive kanban view with drag-and-drop.

**Tech:** React (Client Components), drag-and-drop library TBD, Supabase realtime (optional)

### Deliverables
- [ ] Kanban layout: columns with cards
- [ ] Drag-and-drop: move cards between columns and reorder within a column
- [ ] Optimistic UI updates
- [ ] Card detail view: title, description, assignee, priority, due date, labels
- [ ] Add, edit, delete cards and columns

**Notes:**
> _Library choice (e.g., @dnd-kit/core vs native HTML5), reordering strategy_

---

## M4 — Team & User Management

**Goal:** Invite members, assign roles, manage membership.

**Tech:** Resend (invite emails), Supabase (workspace_members), Shadcn UI

### Deliverables
- [ ] Invite member by email (sends invite link via Resend)
- [ ] Accept invite flow
- [ ] Roles: Owner, Admin, Member (enforced via RLS)
- [ ] Member list page: view, change role, remove member
- [ ] User profile settings (name, avatar)

**Notes:**
> _Invite token strategy, role enforcement details_

---

## M5 — Subscriptions (Stripe)

**Goal:** Lite and Pro plans with feature gating.

**Tech:** Stripe Checkout, Stripe webhooks, Supabase (subscription state)

### Deliverables
- [ ] Stripe products and prices configured (Lite, Pro)
- [ ] Checkout session flow
- [ ] Stripe webhook handler (`app/api/webhooks/stripe/route.ts`)
- [ ] Subscription state stored in Supabase and synced via webhooks
- [ ] Billing portal for plan management
- [ ] Feature gating (e.g., board/member limits on Lite)

**Notes:**
> _Plan limits definition, webhook event handling list_

---

## M6 — AI Features

**Goal:** AI-assisted card creation and board summarization.

**Tech:** AI SDK (Vercel), model TBD

### Deliverables
- [ ] AI SDK installed and configured with chosen model
- [ ] "Generate card" — user provides a prompt, AI fills title + description
- [ ] "Summarize board" — AI reads card titles/descriptions and produces a summary
- [ ] Route Handlers for AI endpoints (`app/api/ai/...`)
- [ ] Streaming responses where applicable

**Notes:**
> _Model choice, token budget, prompt templates_

---

## M7 — Polish & Production

**Goal:** Production-ready quality, deployment.

**Tech:** Vercel (or alternative), production Supabase project

### Deliverables
- [ ] Error boundaries and fallback UI
- [ ] Loading skeletons for async data
- [ ] Empty states for boards, columns, members
- [ ] Responsive layout audit (mobile-friendly at minimum)
- [ ] Environment variable audit (no secrets in client bundle)
- [ ] Production Supabase project configured
- [ ] Deploy to Vercel (or chosen host)
- [ ] Smoke test all critical paths in production

**Notes:**
> _Deployment decisions, environment configs_
