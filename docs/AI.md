# AI in Mosaic

One route talks to the model: `POST /api/chat`, used by **Ask the analyst** and **Write the AI brief**
on a scouting report. Everything else is computed from the bundled matches (`lib/scouting.ts`) and
works with no AI. No cron, background job or page load calls the model.

## Token plan

- **Model:** `gpt-5.4-mini` via `lib/kl/ai.ts` (KL Web), `reasoning_effort: "low"`, strict schema
  `CHAT_SCHEMA` (`lib/llm/scout-facts.ts`, pinned by `lib/llm/scout-facts.test.ts`).
- **Input:** about a dozen computed lines for the team and filters in view (`scoutFacts`), roughly
  300-450 tokens, plus a ~60-token system prompt and the last 4 chat turns (400 characters each).
  The hackathon version ran a tool loop of up to 5 `gpt-4o-mini` calls with 8 tool definitions.
- **Output:** capped at 500 tokens; answers asked to stay under 100 words.
- **One call per press**, no retries. Limits (`lib/llm/limits.ts`): 20 answers per visitor per hour,
  300 per server instance per day (in memory).

## Fallback

`scoutFallback` answers with the fact lines that match the question's topic (pistols, economy,
maps, players...). The UI labels it and the server logs `[ai] fallback label=chat code=…`; a real
answer logs `[ai] provider: openai label=chat in=… out=…`.

## Status (2026-09-29)

The org key is out of credits (`429 insufficient_quota`), so production serves the fallback. The
live AI check is **pending**: the request shape is unit-tested against a mocked OpenAI response
(`app/api/chat/route.test.ts`), but no real call is recorded yet.

## Testing without spending (owner rule, 2026-09-29)

- `npm run gate` and `npx playwright test` never call OpenAI. Unit tests run with a fetch guard
  (`vitest.setup.ts`) that fails any request a test didn't stub. The e2e server starts with an
  empty `OPENAI_API_KEY` and is never reused, so every AI surface exercises its fallback.
- The real check is opt-in, run once after the key has credits:
  `npm run build && E2E_LIVE_AI=1 npx playwright test e2e/live-ai.spec.ts --project=desktop`
  (`e2e/live-ai.spec.ts` asserts `source: "ai"`).
- The marketing capture has no AI shot for the same reason (see `docs/marketing/capture.json`).
