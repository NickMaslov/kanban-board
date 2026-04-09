# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.3** with App Router — this is a newer version with breaking changes; always read `node_modules/next/dist/docs/` before writing code
- **React 19.2.4**
- **Tailwind CSS 4** — configured via `@import "tailwindcss"` in `globals.css`, no `tailwind.config.js` needed
- **TypeScript** with strict mode; path alias `@/*` maps to repo root
- **Supabase** — local-first via Docker; use `@supabase/ssr` for server/client auth helpers
- **Shadcn UI** — component library; add components with `npx shadcn@latest add <component>`
- **Stripe** — Lite and Pro subscription plans; webhooks to gate features
- **Resend** — transactional email (welcome, invites)
- **AI SDK** — AI-assisted features via Route Handlers

## Architecture

Uses the Next.js App Router (`app/` directory). Pages and layouts are Server Components by default — add `'use client'` only for components that need interactivity, browser APIs, or React state/effects.

### Planned route structure

```
app/
  (auth)/           # login, signup, onboarding
  (app)/            # authenticated shell with sidebar
    dashboard/
    workspace/[workspaceId]/
      boards/
      board/[boardId]/   # kanban view
    settings/
      team/
      billing/
  api/
    webhooks/stripe/
    ai/
```

### Data model (Supabase)

`workspaces` → `boards` → `columns` → `cards`; `workspace_members` join table with roles (owner/admin/member); RLS on all tables.

### Key conventions

- **Tailwind 4**: uses `@theme inline` in `globals.css` to define CSS variables; no separate config file
- **Shadcn UI**: components land in `components/ui/`; app-specific components in `components/`
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx`
- **Path alias**: import with `@/app/...`, `@/components/...`, `@/lib/...` etc.
- **Dark mode**: default dark, togglable; use Shadcn's built-in dark mode support

## Next.js 16 / React 19 notes

- `params` in pages/layouts is now a `Promise` — must be `await`ed: `const { id } = await params`
- Prefer Server Components for data fetching; use Client Components only at the interactivity boundary
- Route Handlers live at `app/api/.../route.ts`

## Milestones

| # | Milestone | Key deliverables |
|---|-----------|-----------------|
| M1 | Foundation & Auth | Supabase local Docker, Shadcn UI, dark mode, auth flows, onboarding, Resend welcome email |
| M2 | Workspaces & Boards | DB schema + RLS, workspace/board CRUD, board list view |
| M3 | Kanban Board | Column/card UI, drag-and-drop, card detail view |
| M4 | Team & User Mgmt | Invite via email, roles (owner/admin/member), member management |
| M5 | Subscriptions | Stripe Checkout, webhooks, billing portal, feature gating |
| M6 | AI Features | AI card creation, board summarization via AI SDK |
| M7 | Polish & Production | Error/loading/empty states, responsive audit, deployment |
