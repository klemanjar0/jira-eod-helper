# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Jira EOD (End of Day) report generator built with Next.js 16 and Supabase. Users authenticate via Jira, configure report templates and mail settings, then generate end-of-day reports from Jira issues.

## Commands

- `make dev` — start dev server (uses `.env.local` automatically)
- `make prod` — build and start production server
- `make build` — build only
- `make lint` — run ESLint
- `make db-push` — push Supabase migrations via `scripts/db-push.sh`
- `make clean` — remove `.next` and `node_modules`

## Architecture

- **Framework**: Next.js 16 (App Router) with TypeScript, Tailwind CSS v4
- **Database**: Supabase (Postgres) via `@supabase/ssr`
- **Supabase clients**: `app/database/client.ts` (browser) and `app/database/server.ts` (server, cookie-based auth)
- **Migrations**: `supabase/migrations/` — raw SQL files
- **Path alias**: `@/*` maps to project root

## Database Schema

Two tables: `users` (Jira identity, keyed by `jira_id`) and `user_settings` (1:1 with users — report templates, mail config, project/assignee filters).

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
