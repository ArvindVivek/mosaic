# Mosaic: operating manual

VALORANT scouting reports + AI analyst. Next.js 16.3, React 19, Tailwind 4, KL Web 1.0.2 (vendored).
https://mosaic-plum.vercel.app (Vercel project `mosaic`, repo ArvindVivek/mosaic, deploys from
`main`). Separate app from Lumina on purpose; they share only the fixture and the data layer's
shape. Web release standard: `kitchenlabs-kit/docs/standards/web-release-standard.md`.

## Status (2026-09-29)

- Released on the bundled fixture. `/` redirects to `/reports`; `/api/chat`, `/api/reports/stream`.
- AI: org key set on Vercel but **out of credits**; production serves the numbers-only fallback.
  Live AI check pending (`docs/AI.md`).

## Commands

- `npm run gate` (kit check, typecheck, eslint 0 warnings, vitest, build, leak check).
- `npm run build && npm run e2e` (port 3562, phone + desktop, server TZ=UTC, browser Los Angeles,
  no OpenAI key so only fallbacks run).
- `npm run screenshots` (marketing capture against production).
- Heavy commands through `kitchenlabs-kit/scripts/kl-slot.sh`.

## Map

- `lib/data/*`: copied from Lumina (fixture loader, indexes, names, synthetic test data). Keep them in
  step when either app changes them. The fixture is rebuilt in Lumina
  (`npm run fixtures` there) and copied here.
- `lib/scouting.ts`: the whole report (`buildScoutingReport`) and the "how to beat them" rules
  (`findCounters`), pure over the db.
- `lib/llm/`: `scout-facts.ts` (AI facts, fallback, schema), `coach.ts` (shared system prompt),
  `limits.ts`.
- `app/reports/page.tsx`: server-rendered report; filters and tab live in the URL.

## Gotchas

- **Never run `supabase db reset`** (the old scripts did; they're gone). There is no database.
- **Snapshots are gone.** The hackathon saved shared reports to a DB table; links are now the
  report (`?team=&t=&map=&tab=`). Old `?snapshot=` links show a friendly note.
- **No damage, headshots or spike sites** in GRID's feed: the old ACS/ADR/HS% and site-preference
  views were built on fake or empty columns and were dropped. KAST, K/D, KPR are real.
- **Sides come from logged data** (`rounds.team_a_side`), not "rounds 1-12".
- **Team logos and agent/map art are banned** (see `docs/CREDITS.md`). Use `TeamBadge` codes.
- **Don't poll the live site** after deploy; use `vercel inspect --wait`.
- Commit author for Vercel: `Arvind Vivekanandan <18371231+ArvindVivek@users.noreply.github.com>`.

## Vercel env

`OPENAI_API_KEY` (server-only). Dead, safe for the owner to delete: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `GRID_API_KEY` (and
`OPENAI_MODEL` if present).
