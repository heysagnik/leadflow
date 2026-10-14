# LeadFlow

A single-screen lead management tool. Reps can see every lead with its status, last note and time since last discussion, find today's follow-ups pinned at the top, log discussions in a timeline dialog, set follow-ups, change status, and add leads.

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, Radix Dialog, react-hook-form + zod
- **Backend:** FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, SQLite
- Rules and architecture for contributors live in [AGENT.md](AGENT.md).

## Features

- Lead list: name, company, status badge, last note, "time ago", status filter, name/company search
- Today's follow-ups pinned in their own section; overdue follow-ups highlighted in red and sorted first
- Timeline dialog: discussion history newest first, add a note with an optional follow-up date and time, change status (Ctrl/Cmd+Enter saves the note)
- Changes show up in the list immediately; status changes are optimistic and roll back on error
- Won and Lost leads are de-emphasised and cannot carry follow-ups (closing a lead clears its follow-up)
- Seed script with 7 leads and their discussions, including a follow-up today and an overdue one

## Quick start with Docker

```bash
docker compose up --build
```

Open <http://localhost:3000>. The API runs migrations and seeds sample data on first start; API docs are at <http://localhost:8000/docs>. Data persists in the `leadflow-data` volume.

## Manual setup

Requirements: Python 3.12+, Node.js 22+.

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The Next.js server proxies `/api/*` to `http://localhost:8000`; set `API_INTERNAL_URL` to point elsewhere.

## Configuration

| Variable | Used by | Default |
|---|---|---|
| `DATABASE_URL` | api | `sqlite:///./data/leadflow.db`; any `postgres://` / `postgresql://` URL (for example Neon) also works |
| `API_INTERNAL_URL` | web (local dev and Docker only) | `http://localhost:8000` |

Examples: [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example). Both variables are optional locally; the defaults work out of the box.

## Deploy to Vercel with Neon

One Vercel project with two services (declared in [vercel.json](vercel.json)) plus a Neon Postgres database. `/api/*` goes to the FastAPI service and everything else to the Next.js service, on one domain. Neither service calls the other server-side, so no service bindings are needed, and the browser keeps calling `/api/v1/...` on its own origin.

**1. Database (Neon).** Create a project at <https://neon.com> and copy two connection strings from the **Connect** dialog:
- the **direct** string (toggle *Connection pooling* off), used once to migrate and seed;
- the **pooled** string (hostname contains `-pooler`), used by the deployed API.

**2. Migrate and seed (once, from your machine).** Use the direct string:

```bash
cd backend
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require" alembic upgrade head
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require" python -m app.seed
```

On Windows PowerShell set `$env:DATABASE_URL = "..."` first. Seeding is optional and skips itself if leads already exist.

**3. Vercel project.** Import the repo with **Root Directory** left at the repository root (Vercel reads `vercel.json`). Add the environment variable `DATABASE_URL` with the **pooled** string and deploy. Check `/api/v1/leads` and the home page.

Only `/api/*` is public on the API: `/health` and `/docs` are not routed by the config. Run `vercel dev` to try both services locally, with `DATABASE_URL` set.

Notes: the first request after idle can be slow (function and Neon compute cold starts). `API_INTERNAL_URL` and the Next.js rewrite are only used for local dev and Docker Compose, which keep using SQLite.

## Tests and checks

```bash
# backend
cd backend && ruff check . && ruff format --check . && mypy app && pytest -q

# frontend
cd frontend && npm run check      # eslint + tsc + vitest
```

`make check` runs both (the Makefile assumes a POSIX venv path).

## Project layout

```
backend/app/   core/ models/ schemas/ repositories/ services/ api/routes/ seed.py tests/
frontend/src/  app/ components/ hooks/ lib/
```

## Use of AI

This project was built with Claude Code (Claude Sonnet 5.5). The AI wrote the code, tests, Docker setup and this README from the task brief and wireframes, and designed the interface using the Impeccable, Emil Design Engineering and Make Interfaces Feel Better skills. Layout and design deviate from the suggested wireframes: add-lead is an inline panel rather than a modal, and status is a one-click picker rather than a dropdown. I ran the backend tests, linters, type checks, frontend tests and a production build, and exercised the list, timeline dialog, status change and follow-up flows in a browser at desktop and phone widths. `docker compose` was written but not run, because Docker is not installed on the machine used for development.

## Decisions and trade-offs

- SQLite keeps local setup to zero accounts; SQL is portable, and the same code runs on Postgres (Neon in production) by changing `DATABASE_URL`. The test suite also passes against a real Postgres via `TEST_DATABASE_URL`.
- The list endpoint returns all matching leads without pagination, which suits the single-screen scope.
- "Today's follow-ups" are computed in the browser so they follow the rep's timezone.
