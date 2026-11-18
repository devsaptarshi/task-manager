# Task Manager — Build Plan

Assessment brief: "Develop a simple application that allows users to create and manage tasks." Any stack/AI tool allowed. Deliverables: working app + source, a video explaining your 3 most important decisions, 3 things deliberately not implemented (+ why), and 1 limitation you'd fix with one more day.

## Why this stack (tailored to your CV)

Your resume's strongest, most recent signal is **Next.js + TypeScript + Prisma + PostgreSQL + Claude agent/tool-calling work**, backed by disciplined testing (Jest/Vitest/Playwright, 85% coverage on your current ERP). A plain React+Express+MongoDB to-do app would read as a tutorial project next to that resume. Building this in Next.js/Prisma/Postgres with one small Claude feature makes the assessment look like a miniature version of the production work you already ship — and gives you an easy, confident story for the video.

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui
- **Data:** PostgreSQL + Prisma ORM (Neon via Vercel Marketplace for a real hosted DB; Docker Postgres for local dev)
- **Auth:** Custom JWT in an httpOnly cookie, bcrypt password hashing, per-user data isolation on every query — directly mirrors the JWT/RBAC/multi-tenant line on your CV
- **AI differentiator:** One Claude-powered "quick add" — type a sentence like "Call the dentist tomorrow 3pm, high priority" and it's parsed into a structured task (title, due date, priority) via the Anthropic SDK + Zod structured output. Small surface area, directly reflects your GenAI work, and gives you a strong third talking point for the video.
- **Testing:** Vitest for unit tests (Zod schema validation, auth helpers, AI-parsing logic), Playwright for one critical e2e flow (signup → login → create task → complete → AI quick-add)
- **Deploy:** Vercel (live demo URL for the "working application" deliverable)

## Data model (Prisma)

```
User   { id, email (unique), passwordHash, createdAt }
Task   { id, userId (FK), title, description?, status (TODO|IN_PROGRESS|DONE),
         priority (LOW|MEDIUM|HIGH), dueDate?, createdAt, updatedAt }
```

## Feature scope

Core CRUD:
- Signup / login / logout (JWT httpOnly cookie, middleware-protected routes)
- Create, read, update, delete tasks — scoped to the logged-in user only
- Toggle status (todo / in progress / done), set priority and due date
- Filter (status, priority) and sort (due date, priority, created)
- Responsive, clean UI (Tailwind + shadcn/ui — table/list view, not a kanban board)

AI feature:
- "Quick add" text box → Claude extracts {title, dueDate, priority} as a Zod-validated structured object → pre-fills a confirm step → saved as a task

## Build order (milestones)

1. **Scaffold** — `create-next-app` (TS, Tailwind, App Router), Prisma init, Postgres (local Docker + Neon for deploy), base layout
2. **Auth** — signup/login/logout API routes, bcrypt hashing, JWT cookie, auth middleware, protected `/tasks` route
3. **Core CRUD** — Task API routes + Server Actions, task list/detail UI, create/edit/delete/toggle, filters + sort
4. **AI quick-add** — `/api/tasks/parse` route calling Claude with a Zod schema for structured output; wire into a "Quick add" input with a confirm-before-save step
5. **Tests** — Vitest unit tests (schema validation, auth helpers, parse logic), Playwright e2e for the one critical path
6. **Polish + deploy** — README with setup/run instructions, seed script with a demo account, deploy to Vercel, smoke-test the live URL
7. **Record the video** — script the 3 decisions, write the "not implemented" list and the "one limitation" note

## Video: 3 decisions to explain

1. **Next.js/Prisma/Postgres over classic MERN** — one deploy target, type-safe DB access, matches production patterns you actually use at work; MongoDB's schemaless flexibility isn't a win for a structured entity like a Task.
2. **Per-user JWT auth with data isolation from day one** — even though the brief doesn't mandate multi-user auth, "users" (plural) implied it, and scoping every query to `userId` is the same access-control discipline behind the RBAC/multi-tenant systems on your CV — cheap to add here, and it's the single highest-signal thing you can show in a few hours.
3. **One small Claude feature instead of a chatbot** — structured-output extraction (Zod-validated) instead of a general assistant keeps the AI surface small, reliable, and demoable in 10 seconds, while still showing the GenAI skill that differentiates you from other candidates.

## What to deliberately NOT implement (pick 3 for the video)

- **Real-time multi-user collaboration (shared task lists, WebSockets)** — the brief describes a personal task manager, not a team tool; shared permissions is a different, bigger problem than this assessment is scoping for.
- **Drag-and-drop Kanban board** — polish on top of CRUD, not a signal of engineering judgment; a sortable/filterable list gets the same information across with far less UI risk in a time-boxed build.
- **Due-date reminders/notifications (email/push)** — needs a background job queue and a delivery provider (SES/Twilio); disproportionate infra for a "simple" app, even though it's the natural next feature.
- *(Optional 4th if you want it)* **Full team/role-based workspaces** — you've already shipped this (130+ permission RBAC on your ERP); deliberately kept single-owner-per-task here to keep scope tight.

## One limitation to fix with +1 day

The AI quick-add has no correction loop beyond the initial confirm step — if Claude misparses a date or priority, there's no structured way to flag/fix it and feed that back in. With another day: add an inline edit-before-save diff view and a small eval set (10–15 sample phrases with expected output) to catch regressions — the same "LLM evaluation" discipline from your CV, just scoped down.

## Deliverables checklist

- [ ] GitHub repo (source code)
- [ ] Live Vercel URL (working application)
- [ ] README: stack, setup, how to run locally, demo login
- [ ] Video (3–5 min): 3 decisions, screen demo of core CRUD + AI quick-add
- [ ] Written list: 3 things not implemented + why
- [ ] Written note: 1 current limitation + the 1-day fix
