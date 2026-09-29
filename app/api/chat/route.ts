import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AIError, generateJSON, toAIError } from "@/lib/kl/ai"
import { getDb } from "@/lib/data"
import { buildScoutingReport } from "@/lib/scouting"
import { CHAT_SCHEMA, scoutFacts, scoutFallback } from "@/lib/llm/scout-facts"
import { COACH_SYSTEM } from "@/lib/llm/coach"
import { checkAiLimit } from "@/lib/llm/limits"

export const maxDuration = 30

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(30),
  teamId: z.string().min(1).max(40),
  tournamentId: z.string().max(40).optional(),
  mapName: z.string().max(40).optional(),
})

/** Recent turns only, trimmed: older context costs tokens and rarely changes the answer. */
const HISTORY_TURNS = 4
const HISTORY_CHARS = 400
/** Output cap: a 100-word answer is ~140 tokens; the rest is room for low-effort reasoning. */
const MAX_OUTPUT_TOKENS = 500

/** The analyst: answers questions about one team's scouting report from its computed numbers. */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null))
  const last = parsed.success ? parsed.data.messages.at(-1) : undefined
  if (!parsed.success || last?.role !== "user") {
    return NextResponse.json({ error: { code: "bad_request", message: "Pick a team and send a question." } }, { status: 400 })
  }
  const db = getDb()
  const { teamId, tournamentId, mapName } = parsed.data
  const report = buildScoutingReport(db, teamId, { tournamentId, mapName })
  if (!report) return NextResponse.json({ error: { code: "not_found", message: "We couldn't find that team." } }, { status: 404 })
  const limited = checkAiLimit(req)
  if (limited) return limited

  const question = last.content.slice(0, 500)
  const lines = scoutFacts(report, tournamentId ? db.tournament.get(tournamentId)?.name : null)
  const history = parsed.data.messages
    .slice(-1 - HISTORY_TURNS, -1)
    .map((m) => `${m.role === "user" ? "User" : "Analyst"}: ${m.content.slice(0, HISTORY_CHARS)}`)
    .join("\n")

  try {
    const out = await generateJSON<{ answer: string; follow_up: string | null }>({
      system: `${COACH_SYSTEM} You are scouting ${report.team.name} for the team that will play them.`,
      user: `Data:\n${lines.join("\n")}\n${history ? `\nEarlier:\n${history}\n` : ""}\nQuestion: ${question}`,
      schema: CHAT_SCHEMA,
      reasoningEffort: "low",
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      timeoutMs: 15_000,
      label: "chat",
      signal: req.signal,
    })
    return NextResponse.json({ answer: out.answer, follow_up: out.follow_up, stats: [], source: "ai" })
  } catch (err) {
    const e = err instanceof AIError ? err : toAIError(err)
    console.warn(`[ai] fallback label=chat code=${e.code}`, e.detail)
    return NextResponse.json({ answer: scoutFallback(report.team.name, lines, question), follow_up: null, stats: [], source: "fallback" })
  }
}
