import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/data"
import { buildScoutingReport } from "@/lib/scouting"

const Body = z.object({
  teamId: z.string().min(1).max(40),
  tournamentId: z.string().max(40).optional(),
  mapName: z.string().max(40).optional(),
})

const STAGES = [
  ["initializing", "Reading the matches"],
  ["team-strategies", "Pistols, economy and the spike"],
  ["player-analytics", "Players"],
  ["compositions", "Compositions"],
  ["maps", "Maps"],
  ["assembling", "How to beat them"],
] as const

/**
 * The report as Server-Sent Events, kept for API callers of the hackathon version: one progress
 * event per stage, then `{"stage":"complete","data":report}`. The report computes in a few
 * milliseconds from the bundled matches, so the stages arrive together.
 */
export async function POST(request: NextRequest) {
  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "teamId is required" }, { status: 400 })
  const { teamId, tournamentId, mapName } = parsed.data
  const report = buildScoutingReport(getDb(), teamId, { tournamentId, mapName })
  if (!report) return NextResponse.json({ error: "Team not found" }, { status: 404 })

  const encoder = new TextEncoder()
  const event = (value: unknown) => encoder.encode(`data: ${JSON.stringify(value)}\n\n`)
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      STAGES.forEach(([stage, message], i) => controller.enqueue(event({ stage, message, progress: Math.round((i / STAGES.length) * 100) })))
      controller.enqueue(event({ stage: "complete", message: "Report ready", progress: 100, data: report }))
      controller.close()
    },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } })
}
