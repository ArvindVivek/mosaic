# Mosaic

Scouting reports for VALORANT pro teams, built for the Cloud9 × JetBrains 2026 hackathon and rebuilt
by Kitchen Labs as a free showcase. Live: https://mosaic-plum.vercel.app

Pick an opponent and Mosaic reads every round they played: how they do on each side, on pistols and
each kind of buy, after planting and on retakes, who wins their opening duels, what they field on
each map, and a short list of ways to beat them. An AI analyst answers questions from the same
numbers.

## Data

The hackathon's Supabase database was deleted. Mosaic reads one bundled file,
`lib/data/fixtures/matches.json` (2.3 MB, 32 VCT Americas playoff series from 2024 and 2025), shared
with its sister app Lumina and rebuilt from GRID's event logs by Lumina's
`scripts/fixtures/build-fixtures.mjs`. The report is plain TypeScript (`lib/scouting.ts`) with unit
tests.

## Develop

```bash
npm install
npm run dev          # http://localhost:3562
npm run gate         # kit check, typecheck, lint (0 warnings), unit tests, build, leak check
npm run build && npm run e2e   # Playwright on the production build, phone + desktop
```

`.env.local` needs only `OPENAI_API_KEY` (server-side). Without it the analyst answers with its
numbers-only fallback.

Docs: `CLAUDE.md`, `docs/AI.md`, `docs/DESIGN.md`, `docs/CREDITS.md`, `docs/PRIVACY.md`,
`docs/SUPPORT.md`, `docs/marketing/`.

Mosaic was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games.
Riot Games does not endorse or sponsor this project.

MIT licence (see `LICENSE`). Made by Kitchen Labs.
