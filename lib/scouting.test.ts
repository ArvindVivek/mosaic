import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { makeDb, C9, SEN } from "./data/testing"
import { buildScoutingReport, buyOf, confidence, findCounters, scoutOptions, teamCards } from "./scouting"
import { getDb } from "./data"

const db = makeDb()
const c9 = buildScoutingReport(db, C9)!

describe("scouting report", () => {
  it("records series, maps and rounds", () => {
    expect(c9.record).toEqual({ series: { played: 1, won: 1 }, maps: { played: 1, won: 1 }, rounds: { played: 4, won: 3 } })
    expect(c9.team).toEqual({ id: C9, name: "Cloud9", code: "C9" })
  })

  it("splits rounds by the side actually played", () => {
    expect(c9.strategies.sides).toEqual({ attack: { played: 2, won: 1 }, defense: { played: 2, won: 2 } })
    expect(buildScoutingReport(db, SEN)!.strategies.sides).toEqual({ attack: { played: 2, won: 0 }, defense: { played: 2, won: 1 } })
  })

  it("scores pistols and the round after a pistol win", () => {
    expect(c9.strategies.pistols).toEqual({
      all: { played: 2, won: 2 }, attack: { played: 1, won: 1 }, defense: { played: 1, won: 1 }, bonusAfterWin: { played: 2, won: 1 },
    })
  })

  it("groups non-pistol rounds by team buy", () => {
    expect(c9.strategies.economy).toEqual([{ buy: "full", rounds: 2, won: 1, avgSpend: 21500 }])
    expect([buyOf(9999), buyOf(10000), buyOf(20000)]).toEqual(["eco", "force", "full"])
  })

  it("tracks plants, post-plants and retakes", () => {
    expect(c9.strategies.planting).toEqual({ attackRounds: 2, plants: 1, postPlant: { played: 1, won: 0 }, avgPlantSeconds: 20, retakes: { played: 1, won: 1 } })
    expect(c9.strategies.firstKill).toEqual({ rounds: 4, ours: 2, wonAfter: 1, avgSeconds: 13 })
  })

  it("computes player lines with KAST", () => {
    const c4 = c9.players.find((p) => p.id === "c4")!
    expect(c4).toMatchObject({ rounds: 4, kills: 4, deaths: 1, kd: 4, kpr: 1, kast: 0.75, firstKills: 0 })
    expect(c9.players.every((p) => p.rounds === 4)).toBe(true)
  })

  it("reads compositions, roles and maps", () => {
    expect(c9.compositions).toEqual([{ agents: ["jett", "omen", "omen", "omen", "omen"], games: 1, wins: 1, maps: ["lotus"] }])
    expect(c9.roles).toEqual({ duelist: 1, initiator: 0, controller: 4, sentinel: 0 })
    expect(c9.maps[0]).toMatchObject({ map: "lotus", games: 1, wins: 1, roundsWon: 3, roundsLost: 1, attack: { played: 2, won: 1 } })
  })

  it("honours the tournament and map filters", () => {
    expect(buildScoutingReport(db, C9, { mapName: "bind" })!.scope.games).toBe(0)
    expect(buildScoutingReport(db, C9, { tournamentId: "tour1" })!.scope.rounds).toBe(4)
    expect(buildScoutingReport(db, "nobody")).toBeNull()
    expect(scoutOptions(db, C9).maps).toEqual(["lotus"])
  })

  it("rates confidence by sample size", () => {
    expect([confidence(5), confidence(10), confidence(30)]).toEqual(["LOW", "MEDIUM", "HIGH"])
  })

  it("lists teams by series won", () => {
    expect(teamCards(db)[0]).toMatchObject({ id: C9, series: { played: 1, won: 1 } })
  })
})

describe("counters on the real fixture", () => {
  it("finds concrete, evidenced openings for every team", () => {
    const real = getDb()
    for (const t of real.teams) {
      const r = buildScoutingReport(real, t.id)!
      const counters = findCounters(r)
      expect(counters.length, t.name).toBeGreaterThan(0)
      for (const c of counters) expect(c.detail, c.title).toMatch(/\d/)
    }
  })
})
