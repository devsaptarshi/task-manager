# Task Manager

A simple task manager: sign up, create and manage your own tasks, and add tasks by typing a plain sentence — an AI quick-add parses it into a structured task.

Built with Next.js (App Router) + TypeScript, PostgreSQL + Prisma, JWT auth with per-user data isolation, and a small AI-powered "quick add" feature that works with either Claude or OpenAI. See [`PLAN.md`](./PLAN.md) for the reasoning behind these choices, and the [deliverables below](#assessment-deliverables) for what was deliberately left out.

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS + shadcn/ui
- **Data:** PostgreSQL + Prisma ORM
- **Auth:** Custom JWT in an httpOnly cookie, bcrypt password hashing, every task scoped to its owning user
- **AI:** provider-agnostic quick add — uses Anthropic Claude (`claude-opus-5-5`) if `ANTHROPIC_API_KEY` is set, otherwise OpenAI (`gpt-6-luna`) if `OPENAI_API_KEY` is set. Both go through the same Zod schema (`src/lib/validation.ts`), so the structured output is identical regardless of provider — see `src/lib/ai.ts`.
- **Testing:** Vitest (unit) + Playwright (e2e)

## Running it locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set environment variables** — copy `.env` (already present with a working temporary dev database) or create your own:

   ```bash
   DATABASE_URL="postgresql://..."       # any Postgres connection string
   JWT_SECRET="..."                      # generate with: openssl rand -base64 32
   ANTHROPIC_API_KEY=""                  # optional — either this or OPENAI_API_KEY enables quick-add
   OPENAI_API_KEY=""                     # optional — used only if ANTHROPIC_API_KEY is unset
   ```

   The included `DATABASE_URL` points at a temporary database created with Prisma's `create-db` (good for ~24h). Claim it permanently at the `CLAIM_URL` in `.env`, or swap in your own Postgres connection string and re-run the migration step below.

3. **Run migrations**

   ```bash
   npx prisma migrate deploy
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) — it redirects to `/signup`.

## Testing

```bash
npm run test        # unit tests (Vitest) — validation schemas, password hashing, JWT round-trip
npm run test:e2e    # e2e (Playwright) — signup → create task → mark done → log out/in; AI quick-add error path
npm run eval        # accuracy eval for the AI quick-add parser (see eval/)
```

`test:e2e` starts its own dev server automatically if one isn't already running.

`npm run eval` calls the real `parseQuickAddTask()` — the same function the live route uses — against 13 hand-reviewed phrases (`eval/cases.ts`), grading priority/title/dueDate independently rather than one blended score, and writes a timestamped JSON + Markdown report to `eval/results/`. Needs `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` set locally. Latest run: **13/13 on all three fields.**

GitHub Actions (`.github/workflows/ci.yml`) runs lint, unit tests, build, and the e2e suite against a Postgres service container on every push/PR — fully self-contained, no secrets required.

## A few extra touches

Beyond the core brief: light/dark theme toggle, keyboard shortcuts (`n` for a new task, `/` to jump to quick add), loading skeletons on filter changes, and empty states that distinguish "no tasks yet" from "no tasks match these filters."

## Project structure

```
src/
  app/
    (api routes)       auth (signup/login/logout/me), tasks CRUD, AI quick-add parse
    login/, signup/     auth pages
    tasks/              the app itself (layout guards the route, page loads initial data)
  components/           UI (task board, task item, forms, quick add)
  lib/                  prisma client, auth (JWT/bcrypt), zod schemas, shared types
prisma/schema.prisma    User + Task models
e2e/                    Playwright tests
eval/                   Accuracy eval for the AI quick-add parser
```

## Assessment deliverables

### Three decisions worth knowing about

1. **Next.js/Prisma/Postgres instead of classic MERN.** One deploy target, type-safe DB access end to end, and it matches the production stack this was built to demonstrate — MongoDB's schema flexibility isn't a win for a structured entity like a `Task`.
2. **Per-user JWT auth with data isolation from day one**, even though the brief didn't require multi-user auth. Every task query is scoped to `userId` — the same access-control discipline that matters far more once an app has more than one user.
3. **One small, Zod-validated AI feature instead of a chatbot — and provider-agnostic.** The AI quick-add does one thing (turn a sentence into a structured task) with a typed, verifiable output, rather than a general-purpose assistant — smaller surface area, easy to demo. It runs on Claude or OpenAI against the same schema (whichever API key is set), which also demonstrates that the structured-output pattern is the actual skill, not lock-in to one vendor's SDK.

### What was deliberately not implemented

- **Real-time multi-user collaboration (shared task lists).** This is a personal task manager; shared permissions across users is a materially different problem than the one being scoped here.
- **Drag-and-drop Kanban board.** Polish on top of CRUD, not a signal of engineering judgment — a sortable/filterable list conveys the same information with far less UI risk in a time-boxed build.
- **Due-date reminders / notifications.** Would need a background job queue and an email/push provider — disproportionate infrastructure for this scope, even though it's the natural next feature.

### One current limitation

The AI quick-add has a confirm-before-save step, but not yet a full *feedback loop* — collecting real-world misparses in production, growing the eval's case set from them, and re-running the eval after every prompt change. What does exist now: an accuracy eval (`npm run eval`, see `eval/`) with 13 hand-reviewed cases, graded on priority/title/dueDate independently, currently at 13/13. That's the harness the feedback loop would run on; wiring up the production-feedback half of it is the honest "with one more day" answer.
