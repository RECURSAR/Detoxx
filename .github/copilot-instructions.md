# Project Guidelines

## Architecture
- Detoxx is a two-service monorepo:
  - Gateway (TypeScript/Fastify) handles Slack and Teams ingestion and responses.
  - Pipeline (Python/FastAPI) rewrites text through ordered stages and provider execution.
- Keep platform adapters isolated to their folders:
  - Slack: [apps/gateway/src/adapters/slack/slackAdapter.ts](apps/gateway/src/adapters/slack/slackAdapter.ts)
  - Teams: [apps/gateway/src/adapters/teams/teamsAdapter.ts](apps/gateway/src/adapters/teams/teamsAdapter.ts)
- Preserve the gateway -> pipeline boundary via UnifiedMessage. Any contract change must be synchronized across:
  - [packages/shared-types/unified-message.schema.json](packages/shared-types/unified-message.schema.json)
  - [apps/gateway/src/unified/types.ts](apps/gateway/src/unified/types.ts)
  - [apps/pipeline/app/api/schemas.py](apps/pipeline/app/api/schemas.py)
- For detailed module ownership and data flow, use [CODEBASE.md](CODEBASE.md).

## Build And Test
- Install JS dependencies from repo root: `npm install`
- Install Python dependencies for pipeline: `pip install -r apps/pipeline/requirements.txt`
- Gateway dev: `npm run dev:gateway`
- Gateway build: `npm run build:gateway`
- Pipeline dev: `cd apps/pipeline && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Pipeline tests: `pytest apps/pipeline/tests/`
- Full local stack: `docker compose -f infra/docker-compose.yml up --build`

## Conventions
- Prefer additive, minimal edits; do not refactor across services unless task requires it.
- In gateway adapters, normalize source payloads to UnifiedMessage before calling pipeline.
- In pipeline, keep rewrite flow order intact unless explicitly redesigning behavior:
  - normalize -> context -> system prompt -> prompt build -> execute -> postprocess
- Add new LLM providers by implementing the base provider contract in [apps/pipeline/app/providers/base.py](apps/pipeline/app/providers/base.py) and wiring executor dispatch.
- Validate required env vars through existing config/settings modules instead of reading environment variables ad hoc:
  - [apps/gateway/src/config/index.ts](apps/gateway/src/config/index.ts)
  - [apps/pipeline/app/config/settings.py](apps/pipeline/app/config/settings.py)

## Environment Notes
- Start from [.env.example](.env.example); missing keys will cause startup failures.
- Keep secrets out of source and tests.