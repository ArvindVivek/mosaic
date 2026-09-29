import { expect, test } from "@playwright/test"

// Opt-in: spends real OpenAI tokens (2 calls, under 2k tokens in all). Run once, after the org key
// has credits:  E2E_LIVE_AI=1 npx playwright test e2e/live-ai.spec.ts --project=desktop
test.skip(process.env.E2E_LIVE_AI !== "1", "live AI checks are opt-in (E2E_LIVE_AI=1)")

test("the analyst and the brief answer from the model", async ({ request }) => {
  for (const content of ["How are their pistol rounds?", "Write a short scouting brief: how to beat Cloud9."]) {
    const res = await request.post("/api/chat", { data: { messages: [{ role: "user", content }], teamId: "79" } })
    const body = await res.json()
    expect(res.status()).toBe(200)
    expect(body.source, content).toBe("ai")
    expect(body.answer.length).toBeGreaterThan(20)
  }
})
