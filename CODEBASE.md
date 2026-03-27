---

# Section 1: Project Overview

Detoxx rewrites direct or emotionally charged workplace messages into professional language before they are sent. Incoming messages from Slack or Teams are normalized into a shared TypeScript/Python contract (`UnifiedMessage`) and forwarded to a Python FastAPI pipeline. The pipeline cleans the text, builds conversational context, composes an LLM prompt, executes a selected provider, and postprocesses the response. The gateway then returns the rewritten text to the same channel so the user can send a polished version.

# Section 2: Architecture Diagram (ASCII)

```
+-------------------+       +------------------------------+
| Slack DM Events   | ----> | Gateway (Fastify + Adapters) |
+-------------------+       +------------------------------+
					 ^                           |
					 |                           | POST /rewrite (UnifiedMessage)
					 |                           v
+-------------------+       +------------------------------+
| Teams Messages    | ----> | Pipeline (FastAPI)           |
+-------------------+       | normalize -> context ->      |
														| prompt -> execute ->         |
														| postprocess                  |
														+------------------------------+
																						|
																						v
														+------------------------------+
														| LLM Provider                 |
														| OpenAI / Anthropic / Gemini |
														| / OpenRouter                |
														+------------------------------+
																						|
																						v
														+------------------------------+
														| Rewritten Text               |
														+------------------------------+
																						|
																						v
														+------------------------------+
														| Gateway replies in DM        |
														+------------------------------+
```

# Section 3: Tech Stack

- TypeScript: Gateway app typing and adapter orchestration.
- Fastify (`apps/gateway`): lightweight HTTP server and route/middleware model.
- Slack Bolt (`apps/gateway`): Slack event handling and chat message APIs.
- Bot Framework SDK (`apps/gateway`): Teams adapter and turn context processing.
- Axios (`apps/gateway`): HTTP client for pipeline calls and platform context APIs.
- Dotenv (`apps/gateway`): env loading for local execution.
- Python 3.12 (`apps/pipeline`): pipeline and provider orchestration runtime.
- FastAPI (`apps/pipeline`): API framework for `/rewrite` endpoint.
- Pydantic + pydantic-settings (`apps/pipeline`): strict request schema and settings.
- Uvicorn (`apps/pipeline`): ASGI server for FastAPI.
- OpenAI SDK (`apps/pipeline`): OpenAI provider implementation.
- Anthropic SDK (`apps/pipeline`): Anthropic provider implementation.
- Google Generative AI SDK (`apps/pipeline`): Gemini provider implementation.
- HTTPX (`apps/pipeline`): OpenRouter REST integration.
- Pytest (`apps/pipeline/tests`): stage/provider unit test stubs.
- Docker + Docker Compose (`infra`): local two-service orchestration.
- JSON Schema Draft-07 (`packages/shared-types`): language-agnostic contract for `UnifiedMessage`.

# Section 4: Repository Layout

```
.
├── .env.example                         # Environment template for gateway and pipeline runtime.
├── CODEBASE.md                          # Senior-engineer handoff document for architecture and module contracts.
├── package.json                         # Monorepo metadata and workspace-level scripts.
├── apps
│   ├── gateway
│   │   ├── package.json                 # Gateway dependencies and build/dev scripts.
│   │   ├── tsconfig.json                # TypeScript strict compiler config for gateway.
│   │   └── src
│   │       ├── index.ts                 # Gateway entrypoint: Fastify bootstrap + route registration.
│   │       ├── adapters
│   │       │   ├── slack
│   │       │   │   ├── slackAdapter.ts          # Slack Bolt app orchestration and event/action handlers.
│   │       │   │   ├── slackContextFetcher.ts   # Slack conversations.history fetch + map to history items.
│   │       │   │   └── slackPayloadNormalizer.ts# Slack event -> UnifiedMessage mapping.
│   │       │   └── teams
│   │       │       ├── teamsAdapter.ts          # Bot Framework adapter and Teams message handler.
│   │       │       ├── teamsContextFetcher.ts   # Microsoft Graph chat history fetch + map to history items.
│   │       │       └── teamsPayloadNormalizer.ts# Teams activity -> UnifiedMessage mapping.
│   │       ├── config
│   │       │   └── index.ts             # Typed env config loader with required variable checks.
│   │       ├── middleware
│   │       │   ├── auth.ts              # Platform pre-handler auth checks for Slack/Teams requests.
│   │       │   └── errorHandler.ts      # Global Fastify error sanitizer + logger integration.
│   │       ├── routes
│   │       │   ├── slack.routes.ts      # HTTP webhook endpoints for Slack events/actions.
│   │       │   └── teams.routes.ts      # HTTP webhook endpoint for Teams messages.
│   │       ├── services
│   │       │   └── pipelineClient.ts    # HTTP client for Python pipeline `/rewrite`.
│   │       └── unified
│   │           ├── messageBuilder.ts    # UnifiedMessage constructor + validation guardrails.
│   │           └── types.ts             # Shared gateway-side types for UnifiedMessage contract.
│   └── pipeline
│       ├── requirements.txt             # Python dependencies for API, providers, and tests.
│       ├── tests
│       │   ├── test_normalizer.py       # Tests for text cleanup behavior.
│       │   ├── test_prompt_builder.py   # Tests for message sequence assembly.
│       │   └── test_providers.py        # Tests for provider interface behavior with dummy provider.
│       └── app
│           ├── __init__.py              # Package marker for app imports.
│           ├── main.py                  # FastAPI app creation, CORS setup, and uvicorn launch path.
│           ├── api
│           │   ├── __init__.py          # Package marker for API module.
│           │   ├── router.py            # `/rewrite` endpoint wiring to pipeline stages.
│           │   └── schemas.py           # Pydantic request/response models and UnifiedMessage mirror.
│           ├── config
│           │   ├── __init__.py          # Package marker for config module.
│           │   └── settings.py          # Settings object loading provider keys and runtime config.
│           ├── pipeline
│           │   ├── __init__.py          # Package marker for pipeline module.
│           │   ├── context_builder.py   # Converts history into role/content context blocks.
│           │   ├── executor.py          # Provider registry + provider execution dispatch.
│           │   ├── normalizer.py        # Cleanup logic for user input text.
│           │   ├── postprocessor.py     # Final output cleanup for LLM boilerplate prefixes.
│           │   └── prompt_builder.py    # Builds final prompt list for provider completion call.
│           ├── prompts
│           │   ├── __init__.py          # Package marker for prompts module.
│           │   ├── system_prompt.py     # Template loader for tone preset prompt selection.
│           │   └── templates
│           │       ├── assertive.txt    # Prompt policy for firm but professional style.
│           │       ├── default.txt      # Prompt policy for standard professional rewrite.
│           │       └── diplomatic.txt   # Prompt policy for empathetic collaborative style.
│           └── providers
│               ├── __init__.py          # Provider exports for module-level imports.
│               ├── anthropic_provider.py# Anthropic provider implementation.
│               ├── base.py              # Abstract base provider interface.
│               ├── gemini_provider.py   # Gemini provider implementation.
│               ├── openai_provider.py   # OpenAI provider implementation.
│               └── openrouter_provider.py# OpenRouter REST provider implementation.
├── infra
│   ├── docker-compose.yml               # Two-service local runtime: gateway + pipeline.
│   ├── Dockerfile.gateway               # Node multi-stage build/runtime image.
│   └── Dockerfile.pipeline              # Python image for uvicorn pipeline service.
└── packages
		└── shared-types
				└── unified-message.schema.json  # Draft-07 canonical UnifiedMessage schema.
```

# Section 5: The UnifiedMessage Contract

Schema (TypeScript shape):

```ts
interface MessageHistoryItem {
	role: "user" | "bot";
	text: string;
	timestamp: string;
}

interface UnifiedMessage {
	messageId: string;
	platform: "slack" | "teams";
	userId: string;
	channelId: string;
	rawText: string;
	history: MessageHistoryItem[];
	metadata: Record<string, unknown>;
}
```

Field notes:
- `messageId`: platform-native identifier (Slack `ts`, Teams `id`, etc.).
- `platform`: source origin; drives routing/analytics context.
- `userId`: sender identity from source platform.
- `channelId`: conversation/channel/chat identifier.
- `rawText`: unrewritten user message before pipeline stages.
- `history`: ordered recent context with `role`, `text`, `timestamp`.
- `metadata`: adapter-specific extension data with no schema lock.

This is the boundary between TypeScript and Python. Changes here must be reflected in both `types.ts` and `schemas.py`.

# Section 6: Module Reference — Gateway (TypeScript)

### apps/gateway/src/unified/types.ts
- Purpose: Defines gateway-side canonical request contracts.
- Exports: `SupportedPlatform`, `MessageHistoryItem`, `UnifiedMessage`, `PipelineRequest`.
- Depends on: none.
- Called by: all adapter normalizers, builder, and pipeline client.

### apps/gateway/src/unified/messageBuilder.ts
- Purpose: Validates required fields and assembles a safe `UnifiedMessage`.
- Exports: `UnifiedMessageInput`, `buildUnifiedMessage`.
- Depends on: `./types`.
- Called by: `slackPayloadNormalizer.ts`, `teamsPayloadNormalizer.ts`.

### apps/gateway/src/config/index.ts
- Purpose: Loads and validates environment configuration.
- Exports: `config`.
- Depends on: `dotenv`.
- Called by: entrypoint, adapters, and service clients.

### apps/gateway/src/services/pipelineClient.ts
- Purpose: Calls Python pipeline `/rewrite` endpoint with timeout/error wrapping.
- Exports: `callPipeline`.
- Depends on: `axios`, `../config`, `../unified/types`.
- Called by: Slack and Teams adapters.

### apps/gateway/src/middleware/auth.ts
- Purpose: Basic pre-handler auth checks for Slack signature and Teams bearer token.
- Exports: `platformAuthPreHandler`.
- Depends on: Fastify types, `../config`.
- Called by: `src/index.ts` via `app.addHook("preHandler", ...)`.

### apps/gateway/src/middleware/errorHandler.ts
- Purpose: Global error logger and sanitized JSON error output.
- Exports: `registerErrorHandler`.
- Depends on: Fastify types.
- Called by: `src/index.ts` during app bootstrap.

### apps/gateway/src/routes/slack.routes.ts
- Purpose: Defines Slack webhook routes.
- Exports: `slackRoutes` plugin.
- Depends on: Fastify types, `../adapters/slack/slackAdapter`.
- Called by: `src/index.ts` through `app.register(slackRoutes)`.

### apps/gateway/src/routes/teams.routes.ts
- Purpose: Defines Teams webhook route.
- Exports: `teamsRoutes` plugin.
- Depends on: Fastify types, `../adapters/teams/teamsAdapter`.
- Called by: `src/index.ts` through `app.register(teamsRoutes)`.

### apps/gateway/src/adapters/slack/slackContextFetcher.ts
- Purpose: Pulls Slack message history from `conversations.history`.
- Exports: `fetchSlackContext`.
- Depends on: `axios`, `../../config`, `../../unified/types`.
- Called by: `slackAdapter.ts`.

### apps/gateway/src/adapters/slack/slackPayloadNormalizer.ts
- Purpose: Maps Slack event fields into `UnifiedMessage`.
- Exports: `normalizeSlackPayload`.
- Depends on: `../../unified/messageBuilder`, `../../unified/types`.
- Called by: `slackAdapter.ts`.

### apps/gateway/src/adapters/slack/slackAdapter.ts
- Purpose: Slack Bolt orchestration, listener registration, pipeline invocation, DM response.
- Exports: `handleSlackEvent`, `handleSlackAction`.
- Depends on: `@slack/bolt`, config, context fetcher, payload normalizer, pipeline client.
- Called by: `slack.routes.ts`; internal Bolt listener path.

### apps/gateway/src/adapters/teams/teamsContextFetcher.ts
- Purpose: Pulls Teams chat history using Microsoft Graph API.
- Exports: `fetchTeamsContext`.
- Depends on: `axios`, `../../unified/types`.
- Called by: `teamsAdapter.ts`.

### apps/gateway/src/adapters/teams/teamsPayloadNormalizer.ts
- Purpose: Maps Teams activity payload into `UnifiedMessage`.
- Exports: `normalizeTeamsPayload`.
- Depends on: `../../unified/messageBuilder`, `../../unified/types`.
- Called by: `teamsAdapter.ts`.

### apps/gateway/src/adapters/teams/teamsAdapter.ts
- Purpose: Bot Framework adapter orchestration for Teams message processing and response.
- Exports: `teamsAdapter`, `handleTeamsMessage`, `memoryStorage`.
- Depends on: `botbuilder`, config, context fetcher, payload normalizer, pipeline client.
- Called by: `teams.routes.ts`.

### apps/gateway/src/index.ts
- Purpose: Fastify bootstrap, hook registration, route registration, and server listen.
- Exports: none (startup side effect).
- Depends on: Fastify, config, middleware, route plugins.
- Called by: runtime entrypoint (`ts-node src/index.ts` or compiled JS).

# Section 7: Module Reference — Pipeline (Python)

### apps/pipeline/app/api/schemas.py
- Purpose: Validates inbound/outbound API models and mirrors `UnifiedMessage`.
- Exports: `MessageHistoryItem`, `UnifiedMessage`, `RewriteRequest`, `RewriteResponse`.
- Depends on: `pydantic`.
- Called by: router and pipeline stages using typed request objects.

### apps/pipeline/app/api/router.py
- Purpose: Implements `POST /rewrite` orchestration across all pipeline stages.
- Exports: `router`.
- Depends on: schemas, settings, normalizer/context/prompt/executor/postprocessor, system prompt loader.
- Called by: `app/main.py` via `app.include_router(router)`.

### apps/pipeline/app/pipeline/normalizer.py
- Purpose: Removes profanity markers, emojis, and whitespace noise.
- Exports: `normalize`.
- Depends on: `re`.
- Called by: `api/router.py`.

### apps/pipeline/app/pipeline/context_builder.py
- Purpose: Converts message history to `[{role, content}]` shape for chat providers.
- Exports: `build_context`.
- Depends on: `app.api.schemas.MessageHistoryItem`.
- Called by: `api/router.py`.

### apps/pipeline/app/pipeline/prompt_builder.py
- Purpose: Merges system prompt + history + current user message.
- Exports: `build_prompt`.
- Depends on: none.
- Called by: `api/router.py`.

### apps/pipeline/app/pipeline/executor.py
- Purpose: Builds provider registry and executes configured provider.
- Exports: `execute`.
- Depends on: settings and all provider implementations.
- Called by: `api/router.py`.

### apps/pipeline/app/pipeline/postprocessor.py
- Purpose: Removes assistant-style prefixes and trims final output.
- Exports: `postprocess`.
- Depends on: `re`.
- Called by: `api/router.py`.

### apps/pipeline/app/providers/base.py
- Purpose: Defines abstract provider interface.
- Exports: `LLMProvider`.
- Depends on: `abc`.
- Called by: concrete provider modules and tests.

### apps/pipeline/app/providers/openai_provider.py
- Purpose: OpenAI chat completions adapter.
- Exports: `OpenAIProvider`.
- Depends on: `openai`, settings, base provider.
- Called by: executor registry.

### apps/pipeline/app/providers/anthropic_provider.py
- Purpose: Anthropic messages API adapter.
- Exports: `AnthropicProvider`.
- Depends on: `anthropic`, settings, base provider.
- Called by: executor registry.

### apps/pipeline/app/providers/gemini_provider.py
- Purpose: Gemini SDK adapter.
- Exports: `GeminiProvider`.
- Depends on: `google.generativeai`, settings, base provider.
- Called by: executor registry.

### apps/pipeline/app/providers/openrouter_provider.py
- Purpose: OpenRouter HTTP adapter.
- Exports: `OpenRouterProvider`.
- Depends on: `httpx`, settings, base provider.
- Called by: executor registry.

### apps/pipeline/app/providers/__init__.py
- Purpose: Re-export convenience module for provider imports.
- Exports: provider class names through `__all__`.
- Depends on: provider modules.
- Called by: optional module imports; not required by core flow.

### apps/pipeline/app/prompts/system_prompt.py
- Purpose: Loads prompt template by tone preset with fallback.
- Exports: `get_system_prompt`.
- Depends on: `pathlib`.
- Called by: `api/router.py`.

### apps/pipeline/app/config/settings.py
- Purpose: Central runtime settings and env binding.
- Exports: `Settings`, `settings`.
- Depends on: `pydantic_settings`.
- Called by: router, executor, providers, main app launcher.

### apps/pipeline/app/main.py
- Purpose: FastAPI entrypoint and CORS setup.
- Exports: `app`.
- Depends on: FastAPI, uvicorn, router, settings.
- Called by: uvicorn runtime and Docker CMD.

# Section 8: The Pipeline Execution Flow

1. Slack or Teams sends a DM webhook to the gateway route.
2. Fastify pre-handler runs platform auth checks.
3. Route handler calls adapter (`handleSlackEvent` or `handleTeamsMessage`).
4. Adapter fetches recent channel/chat history via platform API.
5. Adapter normalizes payload into `UnifiedMessage` through message builder validation.
6. Gateway service posts payload to pipeline `POST /rewrite`.
7. FastAPI router validates request against Pydantic schemas.
8. `normalizer.normalize` cleans user text.
9. `context_builder.build_context` prepares prior messages.
10. `system_prompt.get_system_prompt` loads tone template.
11. `prompt_builder.build_prompt` assembles final message array.
12. `executor.execute` selects provider by configured default.
13. Provider `complete` calls external LLM and returns text + tokens.
14. `postprocessor.postprocess` removes boilerplate artifacts.
15. Router returns `RewriteResponse` to gateway.
16. Gateway adapter posts rewritten text back to the DM channel.

# Section 9: How to Add a New LLM Provider

1. Create `apps/pipeline/app/providers/<name>_provider.py` implementing `LLMProvider.complete(messages) -> tuple[str, int]` and read any needed API key from `settings`.
2. Import the class in `apps/pipeline/app/pipeline/executor.py` and register it in `_provider_registry()` under a new key (for example, `"mistral"`).
3. Add new env variable(s) in `apps/pipeline/app/config/settings.py` and `.env.example`, then set `DEFAULT_PROVIDER` to the new key if you want it as default.

# Section 10: How to Add a New Platform (e.g. Discord)

1. Create adapter files in `apps/gateway/src/adapters/discord/`:
	 - `discordAdapter.ts` (event handling + reply)
	 - `discordContextFetcher.ts` (message history fetch)
	 - `discordPayloadNormalizer.ts` (raw event -> UnifiedMessage)
2. Create `apps/gateway/src/routes/discord.routes.ts` exposing webhook endpoint(s), then register it in `apps/gateway/src/index.ts`.
3. Extend `SupportedPlatform` in `apps/gateway/src/unified/types.ts` and the Python model enum in `apps/pipeline/app/api/schemas.py`.
4. Update auth middleware `apps/gateway/src/middleware/auth.ts` for Discord signature/token verification.
5. Update `packages/shared-types/unified-message.schema.json` `platform` enum and `.env.example` with any new platform credentials.
6. Document the new files and flow in this `CODEBASE.md` module references and execution flow section.

# Section 11: How to Add a New Tone Preset

1. Create `apps/pipeline/app/prompts/templates/<preset>.txt` with style instructions.
2. Call `/rewrite` with `tone_preset` set to `<preset>` (router already passes through).
3. Update this document and tests to include expected behavior for the new preset.

# Section 12: Environment Variables Reference

- `SLACK_BOT_TOKEN` (string, gateway): Slack API token; startup fails if missing.
- `SLACK_SIGNING_SECRET` (string, gateway): Slack request verification secret; startup fails if missing.
- `TEAMS_APP_ID` (string, gateway): Bot Framework app id; startup fails if missing.
- `TEAMS_APP_PASSWORD` (string, gateway): Bot Framework secret; startup fails if missing.
- `PIPELINE_URL` (string URL, gateway): base URL to pipeline service; request path fails if invalid/unreachable.
- `PORT` (integer, gateway): Fastify listen port; defaults to `3000`.
- `PIPELINE_PORT` (integer, pipeline): uvicorn listen port; defaults to `8000`.
- `DEFAULT_PROVIDER` (string, pipeline): provider key used by executor (`openai`, `anthropic`, `gemini`, `openrouter`); unknown value raises runtime error.
- `OPENAI_API_KEY` (string, pipeline): required only when OpenAI provider is used.
- `ANTHROPIC_API_KEY` (string, pipeline): required only when Anthropic provider is used.
- `GEMINI_API_KEY` (string, pipeline): required only when Gemini provider is used.
- `OPENROUTER_API_KEY` (string, pipeline): required only when OpenRouter provider is used.

# Section 13: Known Constraints and Trade-offs

- Stateless gateway and pipeline: no persisted user session state; context is fetched per request from platform APIs.
- Unified boundary contract: TypeScript and Python communicate through a strict JSON shape, reducing drift but requiring synchronized edits.
- Adapter thinness: business logic is intentionally in pipeline stages, not adapter handlers.
- Provider initialization trade-off: executor currently instantiates all providers when building the registry; this is simple but can fail if unused providers lack credentials.
- Manual copy-paste trade-off: rewritten output is generated and sent back; users still decide whether to send/edit final text.
- Bot must be in channel/chat: history fetch and reply actions only work where the bot has permissions and membership.

# Section 14: What NOT to Do

- Do not add business logic (tone/risk policy) inside Slack or Teams adapters.
- Do not call LLM providers directly from gateway modules.
- Do not mutate the `UnifiedMessage` shape in one language only.
- Do not bypass `messageBuilder` validation in adapter normalizers.
- Do not auto-send rewritten content outside explicit bot reply paths.
- Do not hardcode API keys or secrets in source files.