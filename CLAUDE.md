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

## Architecture

Uses the Next.js App Router (`app/` directory). Pages and layouts are Server Components by default — add `'use client'` only for components that need interactivity, browser APIs, or React state/effects.

### Key conventions

- **Tailwind 4**: uses `@theme inline` in `globals.css` to define CSS variables; no separate config file
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`
- **Path alias**: import with `@/app/...` or `@/lib/...` etc.

## Next.js 16 / React 19 notes

- `params` in pages/layouts is now a `Promise` — must be `await`ed: `const { id } = await params`
- Prefer Server Components for data fetching; use Client Components only at the interactivity boundary
- Route Handlers live at `app/api/.../route.ts`
