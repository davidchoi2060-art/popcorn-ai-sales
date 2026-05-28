# Agent Guidance for Popcorn AI Sales

## Project overview
- This repo contains a small sales recommendation app with two main application areas:
  - `apps/web` — frontend UI, including a Next.js app and a static HTML/CSS/JS prototype in `apps/web/prototype-html`
  - `apps/api` — backend app layout for Python services, currently with placeholder files under `apps/api/app`
- `docs/` contains product requirements and wireframes.
- `scripts/etl` contains Python ETL scripts for importing CSV/spec data.
- `infra/` contains infrastructure configuration sources.

## What to prioritize
- Use `README.md` and `docs/requirements.md` as primary sources for project goals.
- Treat `apps/web/prototype-html` as a UI prototype/reference implementation rather than the production app.
- Recognize the current backend files are placeholders; avoid assuming the backend is fully implemented.
- Confirm technology choices before making major changes:
  - `apps/web/components/*.tsx` indicates React/TypeScript UI work.
  - `apps/api/app/` structure suggests a Python API service.

## Codebase conventions
- Preserve existing folder boundaries: frontend work stays in `apps/web`, backend work stays in `apps/api`, infrastructure stays in `infra`, scripts stay in `scripts/etl`.
- Link to docs instead of duplicating them. For example, reference `docs/requirements.md` rather than copying content into task answers.
- When making edits, prefer minimal, incremental changes.

## Missing or uncertain data
- There are no package manifests (`package.json`, `pyproject.toml`, `requirements.txt`) or CI workflow definitions in the repository.
- Do not invent build/test commands. Instead ask the user to confirm package manager, framework versions, and desired scripts before adding them.

## Useful paths
- `README.md` — project summary
- `docs/requirements.md` — product and business requirements
- `docs/wireframe-beginner.md`, `docs/wireframe-advanced.md` — UX flow guidance
- `apps/web/prototype-html` — static UI prototype with pages and assets
- `apps/web/components` — React/TS UI components
- `apps/api/app` — backend API layout
- `scripts/etl` — data import scripts

## Recommended next customization
- Add `.github/copilot-instructions.md` if a dedicated workspace instruction file is needed for GitHub Copilot-specific behavior.
- Add a custom skill for `frontend` vs `backend` tasks if the repository grows more complex.
