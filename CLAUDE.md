# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Always respond to the user in Russian** (всегда отвечай пользователю на русском языке), including explanations, summaries, questions and commit messages.

## Project

ClinicSim — a training simulator for medical students: the student interviews an LLM-played "patient" in chat, submits a final diagnosis, and a second LLM call (acting as a teacher) grades the session. Teachers (separate role) review students' sessions and manage scenarios. All UI text, prompts, error messages and code comments are in **Russian** — keep new user-facing strings in Russian.

Monorepo: `backend/` (FastAPI + SQLAlchemy 2 + SQLite + OpenAI) and `frontend/` (React 18 + Vite + TypeScript + Tailwind + TanStack Query).

## Commands

Backend (run from `backend/`; a venv lives at `backend/.venv`, Python 3.12):

```bash
pip install -r requirements-dev.txt
cp .env.example .env                  # set OPENAI_API_KEY, JWT_SECRET_KEY, TEACHER_INVITE_CODE
uvicorn app.main:app --reload         # http://localhost:8000
python seed.py                        # add missing clinical scenarios
python seed.py --reset                # wipe DB and recreate
pytest                                # all tests
pytest tests/test_core.py::test_scores_are_clamped_to_max   # single test
```

Set `MOCK_LLM=true` in `.env` to run without OpenAI (`app/services/mock_llm.py` answers from scenario facts with keyword matching and grades heuristically — for UI debugging only).

Frontend (run from `frontend/`):

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api -> localhost:8000
npm run build      # tsc --noEmit && vite build (this is the only type-check/lint step)
```

There is no linter or formatter configured, and no frontend tests.

## Architecture

**Request flow.** The frontend always calls relative `/api/...`; Vite's dev proxy forwards to the backend, so CORS only matters outside dev. All backend routers use the `/api/<area>` prefix and are registered in `app/main.py`.

**Schema management.** There are no migrations: tables are created by `Base.metadata.create_all` on app startup (lifespan in `main.py`). Adding/changing a column on an existing model will NOT alter an existing `simulator.db` — reset it (`python seed.py --reset`) or alter it manually. `simulator.db` is committed to git.

**Auth & roles.** JWT bearer tokens (`app/services/auth.py`, PyJWT + passlib/bcrypt). `app/dependencies.py` provides `get_current_user` and `get_current_teacher` (role == `"teacher"`). Registering as a teacher requires `TEACHER_INVITE_CODE`. Student-facing endpoints scope data by ownership (e.g. `sim.user_id != current_user.id` → 404). On the frontend, `AuthContext` stores the token in `localStorage` and pushes it into `api/client.ts` via `setAuthToken`; any 401 clears it. Routes are gated by `ProtectedRoute` and `TeacherRoute` in `App.tsx`.

**Core domain (`app/models.py`).** `Scenario` holds the case: `patient_profile`, `hidden_diagnosis`, `anamnesis_facts` (sections `complaints`/`hpi`/`life_history`/`risk_factors`/`negatives`), `red_flags` — all JSON columns. `SimSession` (table `sessions`) links user + scenario, has `status` `active`→`finished`, and stores the grading result as JSON in `evaluation` plus `score`. `Message.role` is `"student"` or `"patient"`.

**Two LLM calls (`app/services/llm.py`, `app/prompts/`):**
1. *Patient chat* — `POST /api/chat/{session_id}/message` builds the system prompt from the scenario (`build_patient_prompt`, which must never leak `hidden_diagnosis` — there's a test for this), sends the last `MAX_HISTORY` messages, and streams the reply as plain text chunks (`StreamingResponse`). The first chunk is awaited before responding so LLM failures become a proper HTTP 502; the student message is saved only after that, and the patient's full reply is saved in a fresh DB session after the stream ends. Frontend reads it with `fetch` + `ReadableStream` in `streamPatientReply` (`api/client.ts`).
2. *Evaluation* — `POST /api/sessions/{id}/finish` calls `evaluate_session` (`app/services/evaluation.py`): JSON-mode completion, markdown fences stripped by `_extract_json`, validated by `_build_result` (scores clamped per criterion, total recomputed server-side), up to 2 attempts. Criteria and their max points are defined once in `CRITERIA` in `app/prompts/evaluation_prompt.py` (sum = 100) and reused by the mock evaluator and tests.

Both paths branch on `settings.mock_llm`. Config is `pydantic-settings` reading `backend/.env` (`app/config.py`).

**Frontend structure.** Providers in `main.tsx`: React Query (staleTime Infinity, no refetch on focus, no retry) → Router → Theme → Toast → Auth. All HTTP goes through the `api` object in `src/api/client.ts`; shared types are in `src/types/index.ts` and must mirror `backend/app/schemas.py`. Pages under `src/pages/`, wrapped by `Layout` and animated with framer-motion `PageTransition`.

**Theming.** Colors are CSS variables (RGB triplets) in `src/index.css` with a `[data-theme="dark"]` override, exposed to Tailwind as semantic names (`paper`, `card`, `ink`, `muted`, `line`, `teal`, `clay`, `gold`) in `tailwind.config.js`. Use these tokens rather than raw Tailwind palette colors so dark mode works. Note `font-serif` intentionally maps to Manrope (a sans-serif) for headings.
