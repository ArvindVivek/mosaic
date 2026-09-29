import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { NextRequest } from "next/server"
import { POST } from "./route"

// Against the real fixture, with OpenAI mocked at fetch. Cloud9's GRID id is 79.
const ask = (body: unknown, ip = "1.1.1.1") =>
  POST(new NextRequest("http://x/api/chat", { method: "POST", body: JSON.stringify(body), headers: { "x-forwarded-for": ip } }))
const q = (content: string, extra = {}) => ({ messages: [{ role: "user", content }], teamId: "79", ...extra })

describe("POST /api/chat", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test"
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("asks the model once with a strict, compact request", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "Ban Lotus.", follow_up: null }) }, finish_reason: "stop" }], usage: { prompt_tokens: 400, completion_tokens: 30 } }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const body = await (await ask(q("How do we beat them?"), "2.2.2.2")).json()
    expect(body).toMatchObject({ answer: "Ban Lotus.", source: "ai" })
    const sent = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(sent).toMatchObject({ model: "gpt-5.4-mini", reasoning_effort: "low", max_completion_tokens: 500 })
    expect(sent.messages[1].content.length).toBeLessThan(3000)
  })

  it("falls back to the numbers on an empty quota, without retrying", async () => {
    const fetchMock = vi.fn(async () => new Response('{"error":{"code":"insufficient_quota"}}', { status: 429 }))
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    const body = await (await ask(q("What about pistol rounds?"), "3.3.3.3")).json()
    expect(body.source).toBe("fallback")
    expect(body.answer).toMatch(/numbers for Cloud9\. Pistols won/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects bad input before spending anything", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    expect((await ask({ messages: [{ role: "user", content: "hi" }] })).status).toBe(400)
    expect((await ask(q("hi", { teamId: "nope" }))).status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("limits each visitor to 20 answers an hour", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })))
    vi.spyOn(console, "warn").mockImplementation(() => {})
    for (let i = 0; i < 20; i++) expect((await ask(q("hi"), "9.9.9.9")).status).toBe(200)
    expect((await ask(q("hi"), "9.9.9.9")).status).toBe(429)
  })
})
