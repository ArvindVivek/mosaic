import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { NextRequest } from "next/server"
import { POST } from "./route"

describe("POST /api/reports/stream", () => {
  it("streams the stages, then the report", async () => {
    const res = await POST(new NextRequest("http://x", { method: "POST", body: JSON.stringify({ teamId: "79" }) }))
    const events = (await res.text()).trim().split("\n\n").map((e) => JSON.parse(e.slice(6)))
    expect(events.at(-1).stage).toBe("complete")
    expect(events.at(-1).data.team.name).toBe("Cloud9")
    expect(events.length).toBe(7)
  })
  it("needs a real team", async () => {
    expect((await POST(new NextRequest("http://x", { method: "POST", body: "{}" }))).status).toBe(400)
    expect((await POST(new NextRequest("http://x", { method: "POST", body: JSON.stringify({ teamId: "x" }) }))).status).toBe(404)
  })
})
