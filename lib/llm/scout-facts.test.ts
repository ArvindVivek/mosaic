import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { makeDb, C9 } from "@/lib/data/testing"
import { buildScoutingReport } from "@/lib/scouting"
import { strictSchemaProblems } from "@/lib/kl/ai"
import { CHAT_SCHEMA, scoutFacts, scoutFallback } from "./scout-facts"
import { COACH_SCHEMA } from "./coach"

const r = buildScoutingReport(makeDb(), C9)!
const lines = scoutFacts(r)

describe("analyst facts", () => {
  it("keeps the schemas inside OpenAI strict mode", () => {
    expect(strictSchemaProblems(CHAT_SCHEMA.schema)).toEqual([])
    expect(strictSchemaProblems(COACH_SCHEMA.schema)).toEqual([])
  })
  it("sends a short summary, never match logs (token budget)", () => {
    expect(lines[0]).toBe("Cloud9: series 1-0, maps 1-0, rounds won 75%.")
    expect(lines.join("\n").length).toBeLessThan(2400)
  })
  it("answers from the lines about the question's topic when the AI is down", () => {
    expect(scoutFallback("Cloud9", lines, "How are their pistol rounds?")).toContain("Pistols won 2 of 2")
    expect(scoutFallback("Cloud9", lines, "hello")).toBe(`The AI analyst can't answer right now, so here are the numbers for Cloud9. ${lines[0]}`)
  })
})
