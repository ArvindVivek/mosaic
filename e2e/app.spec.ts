import { expect, test, type Page } from "@playwright/test"

const C9 = "79"

function watchErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  return errors
}

const PAGES: [string, RegExp][] = [
  ["/reports", /Scout any VCT Americas team/],
  [`/reports?team=${C9}`, /Cloud9/],
  [`/reports?team=${C9}&tab=strategies`, /Cloud9/],
  [`/reports?team=${C9}&tab=players`, /Cloud9/],
  [`/reports?team=${C9}&tab=compositions`, /Cloud9/],
  [`/reports?team=${C9}&tab=maps`, /Cloud9/],
  [`/reports?team=${C9}&tab=counters`, /Cloud9/],
  [`/reports?team=${C9}&t=826992&map=lotus`, /Cloud9/],
  ["/reports?snapshot=abc123", /Scout any VCT Americas team/],
]

for (const [path, heading] of PAGES) {
  test(`page ${path} loads with data and no errors`, async ({ page }) => {
    const errors = watchErrors(page)
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading)
    await expect(page.getByText(/Legal Jibber Jabber/)).toBeVisible()
    await expect(page.getByText(/© \d{4} Kitchen Labs/)).toBeVisible()
    await page.waitForLoadState("networkidle")
    expect(errors).toEqual([])
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test("the root redirects to the reports", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/reports$/)
})

test("picking a team, a map and a tab", async ({ page }) => {
  await page.goto("/reports")
  await page.getByRole("link", { name: /Sentinels/ }).click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sentinels")
  await page.getByLabel("Map").selectOption("lotus")
  await expect(page).toHaveURL(/map=lotus/)
  await page.getByRole("link", { name: "How to beat them" }).click()
  await expect(page).toHaveURL(/tab=counters/)
  await expect(page.getByText(/Based on \d+/).first()).toBeVisible()
})

test("the AI brief and the analyst answer with numbers when the AI is unavailable", async ({ page }) => {
  await page.goto(`/reports?team=${C9}`)
  await page.getByRole("button", { name: "Write the AI brief" }).click()
  await expect(page.getByText(/AI unavailable right now/)).toBeVisible()
  await page.getByRole("button", { name: "Ask the analyst" }).click()
  await page.getByLabel("Your question").fill("How are their pistol rounds?")
  await page.getByRole("button", { name: "Send question" }).click()
  await expect(page.getByText(/Pistols won \d+ of \d+/)).toBeVisible()
})

test("the API routes answer", async ({ request }) => {
  const stream = await request.post("/api/reports/stream", { data: { teamId: C9 } })
  expect(stream.status()).toBe(200)
  expect(await stream.text()).toContain('"stage":"complete"')
  const chat = await request.post("/api/chat", { data: { messages: [{ role: "user", content: "How do we beat them?" }], teamId: C9 } })
  expect(chat.status()).toBe(200)
  expect((await chat.json()).source).toBe("fallback")
  expect((await request.post("/api/chat", { data: { teamId: C9 } })).status()).toBe(400)
})

test("the theme toggle switches to dark", async ({ page }) => {
  await page.goto("/reports")
  await page.getByRole("button", { name: /Switch to dark mode/ }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
})
