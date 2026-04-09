# Project Plan — Linear-like Project Management App

A team collaboration tool with workspaces, kanban boards, member management, Stripe subscriptions, and AI features.

## Milestone Overview

| # | Milestone | Status |
|---|-----------|--------|
| M1 | Foundation & Auth | Done |
| M2 | Workspaces & Boards | Done |
| M3 | Kanban Board | Done |
| M4 | Team & User Management | Not Started |
| M5 | Subscriptions (Stripe) | Not Started |
| M6 | AI Features | Not Started |
| M7 | Polish & Production | Not Started |

---

## M1 — Foundation & Auth

**Goal:** Standing up the core infrastructure — local Supabase, auth flows, UI shell, and onboarding.

**Tech:** Supabase (Docker), Shadcn UI, Tailwind 4, Resend

### Deliverables
- [x] Supabase running locally via Docker (`supabase start`)
- [x] `@supabase/ssr` configured for Next.js App Router (server + client helpers)
- [x] Shadcn UI initialized, dark mode default with light toggle
- [x] Auth pages: sign up, log in, log out, forgot password
- [x] Middleware to protect authenticated routes (`proxy.ts`)
- [x] Onboarding flow: create workspace after first login
- [x] Welcome email sent via Resend on signup
- [x] Root layout with sidebar nav and header shell

**Notes:**
- `proxy.ts` is Next.js 16's rename of `middleware.ts`; used for session refresh + route protection
- Auth keys: Supabase CLI v2.84+ uses "Publishable" (anon) and "Secret" (service_role) key names
- Shadcn CLI v4.2.0 detected Tailwind v4 automatically; no `tailwind.config.js` needed
- `useActionState` actions require `(prevState, formData)` signature (React 19 requirement)
- Full DB schema with RLS in `supabase/migrations/20260409180442_initial_schema.sql`
- Add real Resend API key to `.env.local` before going live

---

## M2 — Workspaces & Boards

**Goal:** Core data model and CRUD for workspaces and boards.

**Tech:** Supabase (tables + RLS), Next.js Server Components, Route Handlers

### Deliverables
- [x] DB schema: `workspaces`, `boards`, `columns`, `cards`, `workspace_members`
- [x] Row-Level Security policies on all tables
- [x] Workspace list and create/edit/delete
- [x] Board list per workspace
- [x] Board create/edit/delete

**Notes:**
- Shadcn UI here uses `@base-ui/react` — no `asChild` prop; apply `buttonVariants` directly to trigger elements
- `DialogTrigger`, `DialogClose`, `DropdownMenuTrigger` all render as `<button>` by default in base-ui
- Workspace switcher in sidebar reads `workspaceId` from URL params via `useParams()`
- Board CRUD: `createBoard`/`updateBoard` use `useActionState`; `deleteBoard` is a direct async call

---

## M3 — Kanban Board

**Goal:** Interactive kanban view with drag-and-drop.

**Tech:** React (Client Components), drag-and-drop library TBD, Supabase realtime (optional)

### Deliverables
- [x] Kanban layout: columns with cards
- [x] Drag-and-drop: move cards between columns and reorder within a column
- [x] Optimistic UI updates
- [x] Card detail view: title, description, priority, due date
- [x] Add, edit, delete cards and columns

**Notes:**
- Using `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop
- `useDroppable` is from `@dnd-kit/core`, not `@dnd-kit/sortable`
- Drag state is fully optimistic — DB write (reorderCards) fires after drag ends
- Cards move between columns via `onDragOver` (column_id update) + `onDragEnd` (position reorder)
- Column drop zones registered with `useDroppable({ id: column.id })`

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
