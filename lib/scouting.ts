import { playerName, sideOf, teamName, type Db } from "./data/db"
import type { Game, Round, Series } from "./data/fixture"
import { mapLabel, teamCode } from "./data/names"

/*
 * The scouting report: everything Mosaic says about one opponent, computed from the bundled
 * match fixture. Pure over the db, so tests run it on synthetic tables. Replaces the hackathon's
 * Postgres functions and materialized views (mosaic.get_team_* and friends).
 */

export type Role = "duelist" | "initiator" | "controller" | "sentinel"

/** Agent roles as VALORANT lists them. Text only; no Riot artwork is used. */
export const AGENT_ROLES: Record<string, Role> = {
  jett: "duelist", raze: "duelist", reyna: "duelist", phoenix: "duelist", yoru: "duelist", neon: "duelist", iso: "duelist", waylay: "duelist",
  sova: "initiator", breach: "initiator", skye: "initiator", "kay/o": "initiator", fade: "initiator", gekko: "initiator", tejo: "initiator",
  brimstone: "controller", viper: "controller", omen: "controller", astra: "controller", harbor: "controller", clove: "controller",
  killjoy: "sentinel", cypher: "sentinel", sage: "sentinel", chamber: "sentinel", deadlock: "sentinel", vyse: "sentinel",
}

export interface ScoutFilters {
  tournamentId?: string | null
  mapName?: string | null
}

export interface WinLoss {
  played: number
  won: number
}

export interface PlayerLine {
  id: string
  name: string
  rounds: number
  kills: number
  deaths: number
  assists: number
  kd: number
  kpr: number
  /** Share of rounds with a kill, an assist, a survival or a traded death. */
  kast: number
  firstKills: number
  firstDeaths: number
  clutches: WinLoss
  agents: { agent: string; rounds: number }[]
  role: Role | null
}

export interface CompLine {
  agents: string[]
  games: number
  wins: number
  maps: string[]
}

export interface MapLine {
  map: string
  games: number
  wins: number
  roundsWon: number
  roundsLost: number
  attack: WinLoss
  defense: WinLoss
  /** The composition used most on this map. */
  comp: string[] | null
}

export interface Counter {
  kind: "map" | "side" | "economy" | "player" | "pistol" | "retake" | "composition"
  title: string
  detail: string
  /** How many rounds, maps or duels the call rests on (the unit says which). */
  sample: number
  unit: "rounds" | "maps" | "duels"
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface ScoutingReport {
  team: { id: string; name: string; code: string }
  scope: { tournamentId: string | null; mapName: string | null; series: number; games: number; rounds: number }
  record: { series: WinLoss; maps: WinLoss; rounds: WinLoss }
  recent: { seriesId: string; opponent: string; won: boolean; score: string; date: string; maps: string[] }[]
  strategies: {
    pistols: { all: WinLoss; attack: WinLoss; defense: WinLoss; bonusAfterWin: WinLoss }
    economy: { buy: "eco" | "force" | "full"; rounds: number; won: number; avgSpend: number }[]
    sides: { attack: WinLoss; defense: WinLoss }
    planting: { attackRounds: number; plants: number; postPlant: WinLoss; avgPlantSeconds: number | null; retakes: WinLoss }
    firstKill: { rounds: number; ours: number; wonAfter: number; avgSeconds: number | null }
  }
  players: PlayerLine[]
  compositions: CompLine[]
  roles: Record<Role, number>
  maps: MapLine[]
  counters: Counter[]
}

const wl = (): WinLoss => ({ played: 0, won: 0 })
const rate = (x: WinLoss) => (x.played ? x.won / x.played : 0)
const pct = (x: number) => `${Math.round(x * 100)}%`

/** Sample-size confidence used across the report: 30+ solid, 10+ some, else thin. */
export function confidence(n: number): Counter["confidence"] {
  if (n >= 30) return "HIGH"
  if (n >= 10) return "MEDIUM"
  return "LOW"
}

/** Buy bands shared with Lumina: team spend under 10k is an eco, under 20k a force buy. */
export function buyOf(loadout: number): "eco" | "force" | "full" {
  if (loadout >= 20000) return "full"
  if (loadout >= 10000) return "force"
  return "eco"
}

function teamGames(db: Db, teamId: string, f: ScoutFilters) {
  const out: { series: Series; game: Game; isA: boolean }[] = []
  for (const series of db.series) {
    if (series.team_a_id !== teamId && series.team_b_id !== teamId) continue
    if (f.tournamentId && series.tournament_id !== f.tournamentId) continue
    for (const game of db.gamesBySeries.get(series.id) ?? []) {
      if (f.mapName && game.map_name !== f.mapName) continue
      out.push({ series, game, isA: series.team_a_id === teamId })
    }
  }
  return out
}

/** The five agents the team played in a game (from its first round). */
function compOf(db: Db, game: Game, teamId: string): string[] {
  const first = db.roundsByGame.get(game.id)?.[0]
  if (!first) return []
  return (db.prsByRound.get(first.id) ?? []).filter((p) => p.team_id === teamId).map((p) => p.agent).sort()
}

export function buildScoutingReport(db: Db, teamId: string, f: ScoutFilters = {}): ScoutingReport | null {
  const team = db.team.get(teamId)
  if (!team) return null
  const games = teamGames(db, teamId, f)
  const seriesIds = [...new Set(games.map((g) => g.series.id))]
  const rounds: { round: Round; game: Game; isA: boolean }[] = games.flatMap((g) => (db.roundsByGame.get(g.game.id) ?? []).map((round) => ({ round, ...g })))
  const won = (r: Round) => r.winning_team_id === teamId

  // Record
  const series = seriesIds.map((id) => db.seriesById.get(id)!)
  const record = {
    series: { played: series.length, won: series.filter((s) => s.winner_id === teamId).length },
    maps: { played: games.length, won: games.filter((g) => g.game.winner_id === teamId).length },
    rounds: { played: rounds.length, won: rounds.filter((r) => won(r.round)).length },
  }

  // Strategies
  const pistols = { all: wl(), attack: wl(), defense: wl(), bonusAfterWin: wl() }
  const econ = new Map<"eco" | "force" | "full", { rounds: number; won: number; spend: number }>()
  const sides = { attack: wl(), defense: wl() }
  const planting = { attackRounds: 0, plants: 0, postPlant: wl(), plantTimes: [] as number[], retakes: wl() }
  const firstKill = { rounds: 0, ours: 0, wonAfter: 0, times: [] as number[] }

  for (const { round: r, game, isA } of rounds) {
    const side = sideOf(r, isA)
    const w = won(r)
    if (side) {
      sides[side].played++
      if (w) sides[side].won++
    }
    if (r.round_number === 1 || r.round_number === 13) {
      pistols.all.played++
      if (w) pistols.all.won++
      if (side) {
        pistols[side].played++
        if (w) pistols[side].won++
      }
      const bonus = (db.roundsByGame.get(game.id) ?? []).find((x) => x.round_number === r.round_number + 1)
      if (w && bonus) {
        pistols.bonusAfterWin.played++
        if (won(bonus)) pistols.bonusAfterWin.won++
      }
    } else {
      const spend = isA ? r.team_a_loadout_value : r.team_b_loadout_value
      const key = buyOf(spend)
      const e = econ.get(key) ?? { rounds: 0, won: 0, spend: 0 }
      e.rounds++
      e.spend += spend
      if (w) e.won++
      econ.set(key, e)
    }
    const plant = (db.spikesByRound.get(r.id) ?? []).find((s) => s.event_type === "plant_complete")
    if (side === "attack") {
      planting.attackRounds++
      if (plant) {
        planting.plants++
        planting.plantTimes.push(plant.game_time_ms)
        planting.postPlant.played++
        if (w) planting.postPlant.won++
      }
    } else if (side === "defense" && plant) {
      planting.retakes.played++
      if (w) planting.retakes.won++
    }
    const kills = db.killsByRound.get(r.id) ?? []
    const fk = kills.find((k) => k.is_first_kill)
    if (fk?.killer_id) {
      firstKill.rounds++
      const killerTeam = (db.prsByRound.get(r.id) ?? []).find((p) => p.player_id === fk.killer_id)?.team_id
      if (killerTeam === teamId) {
        firstKill.ours++
        firstKill.times.push(fk.game_time_ms)
        if (w) firstKill.wonAfter++
      }
    }
  }
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

  // Players
  const byPlayer = new Map<string, PlayerLine & { agentMap: Map<string, number> }>()
  for (const { round: r } of rounds) {
    for (const p of db.prsByRound.get(r.id) ?? []) {
      if (p.team_id !== teamId) continue
      const line =
        byPlayer.get(p.player_id) ??
        { id: p.player_id, name: playerName(db, p.player_id), rounds: 0, kills: 0, deaths: 0, assists: 0, kd: 0, kpr: 0, kast: 0, firstKills: 0, firstDeaths: 0, clutches: wl(), agents: [], role: null, agentMap: new Map<string, number>() }
      line.rounds++
      line.kills += p.kills
      line.deaths += p.deaths
      line.assists += p.assists
      if (p.kills > 0 || p.assists > 0 || p.deaths === 0 || p.traded) line.kast++
      if (p.first_kill) line.firstKills++
      if (p.first_death) line.firstDeaths++
      if (p.clutch_situation) {
        line.clutches.played++
        if (p.clutch_won) line.clutches.won++
      }
      line.agentMap.set(p.agent, (line.agentMap.get(p.agent) ?? 0) + 1)
      byPlayer.set(p.player_id, line)
    }
  }
  const players: PlayerLine[] = [...byPlayer.values()]
    .map(({ agentMap, ...l }) => {
      const agents = [...agentMap.entries()].sort((a, b) => b[1] - a[1]).map(([agent, n]) => ({ agent, rounds: n }))
      return {
        ...l,
        kd: l.deaths ? l.kills / l.deaths : l.kills,
        kpr: l.rounds ? l.kills / l.rounds : 0,
        kast: l.rounds ? l.kast / l.rounds : 0,
        agents,
        role: agents[0] ? AGENT_ROLES[agents[0].agent] ?? null : null,
      }
    })
    .sort((a, b) => b.rounds - a.rounds || b.kd - a.kd)

  // Compositions and roles
  const comps = new Map<string, CompLine>()
  const roles: Record<Role, number> = { duelist: 0, initiator: 0, controller: 0, sentinel: 0 }
  for (const { game } of games) {
    const agents = compOf(db, game, teamId)
    if (agents.length !== 5) continue
    for (const a of agents) {
      const role = AGENT_ROLES[a]
      if (role) roles[role]++
    }
    const key = agents.join("+")
    const c = comps.get(key) ?? { agents, games: 0, wins: 0, maps: [] }
    c.games++
    if (game.winner_id === teamId) c.wins++
    if (!c.maps.includes(game.map_name)) c.maps.push(game.map_name)
    comps.set(key, c)
  }
  const compositions = [...comps.values()].sort((a, b) => b.games - a.games || b.wins - a.wins)

  // Maps
  const mapLines = new Map<string, MapLine & { compCount: Map<string, number> }>()
  for (const { game, isA } of games) {
    const m = mapLines.get(game.map_name) ?? { map: game.map_name, games: 0, wins: 0, roundsWon: 0, roundsLost: 0, attack: wl(), defense: wl(), comp: null, compCount: new Map<string, number>() }
    m.games++
    if (game.winner_id === teamId) m.wins++
    for (const r of db.roundsByGame.get(game.id) ?? []) {
      if (won(r)) m.roundsWon++
      else m.roundsLost++
      const side = sideOf(r, isA)
      if (side) {
        m[side].played++
        if (won(r)) m[side].won++
      }
    }
    const key = compOf(db, game, teamId).join("+")
    if (key) m.compCount.set(key, (m.compCount.get(key) ?? 0) + 1)
    mapLines.set(game.map_name, m)
  }
  const maps: MapLine[] = [...mapLines.values()]
    .map(({ compCount, ...m }) => {
      const top = [...compCount.entries()].sort((a, b) => b[1] - a[1])[0]
      return { ...m, comp: top ? top[0].split("+") : null }
    })
    .sort((a, b) => b.games - a.games || rate({ played: b.games, won: b.wins }) - rate({ played: a.games, won: a.wins }))

  const economy = (["eco", "force", "full"] as const)
    .filter((b) => econ.has(b))
    .map((b) => ({ buy: b, rounds: econ.get(b)!.rounds, won: econ.get(b)!.won, avgSpend: Math.round(econ.get(b)!.spend / econ.get(b)!.rounds) }))

  const report: ScoutingReport = {
    team: { id: team.id, name: team.name, code: teamCode(team.name) },
    scope: { tournamentId: f.tournamentId ?? null, mapName: f.mapName ?? null, series: series.length, games: games.length, rounds: rounds.length },
    record,
    recent: [...series]
      .sort((a, b) => b.start_time.localeCompare(a.start_time))
      .slice(0, 5)
      .map((s) => {
        const gs = db.gamesBySeries.get(s.id) ?? []
        const us = gs.filter((g) => g.winner_id === teamId).length
        return {
          seriesId: s.id,
          opponent: teamName(db, s.team_a_id === teamId ? s.team_b_id : s.team_a_id),
          won: s.winner_id === teamId,
          score: `${us}-${gs.length - us}`,
          date: s.start_time,
          maps: gs.map((g) => g.map_name),
        }
      }),
    strategies: {
      pistols,
      economy,
      sides,
      planting: {
        attackRounds: planting.attackRounds,
        plants: planting.plants,
        postPlant: planting.postPlant,
        avgPlantSeconds: avg(planting.plantTimes) == null ? null : Math.round(avg(planting.plantTimes)! / 1000),
        retakes: planting.retakes,
      },
      firstKill: {
        rounds: firstKill.rounds,
        ours: firstKill.ours,
        wonAfter: firstKill.wonAfter,
        avgSeconds: avg(firstKill.times) == null ? null : Math.round(avg(firstKill.times)! / 1000),
      },
    },
    players,
    compositions,
    roles,
    maps,
    counters: [],
  }
  report.counters = findCounters(report)
  return report
}

/**
 * How to beat this team: the weakest spots in the report, each with its evidence. A spot needs
 * at least a handful of rounds or maps to be listed; thin ones are marked LOW.
 */
export function findCounters(r: ScoutingReport): Counter[] {
  const out: Counter[] = []
  const { strategies: s } = r

  const weakMaps = r.maps.filter((m) => m.games >= 2 && m.wins / m.games < 0.5).sort((a, b) => a.wins / a.games - b.wins / b.games)
  if (weakMaps[0]) {
    const m = weakMaps[0]
    out.push({ kind: "map", title: `Pick ${mapLabel(m.map)}`, detail: `${r.team.name} won ${m.wins} of ${m.games} maps on ${mapLabel(m.map)} (${m.roundsWon}-${m.roundsLost} in rounds).`, sample: m.roundsWon + m.roundsLost, unit: "rounds", confidence: confidence(m.roundsWon + m.roundsLost) })
  }
  const bestMap = [...r.maps].filter((m) => m.games >= 2).sort((a, b) => b.wins / b.games - a.wins / a.games)[0]
  if (bestMap && bestMap.wins / bestMap.games >= 0.6) {
    out.push({ kind: "map", title: `Ban ${mapLabel(bestMap.map)}`, detail: `Their best map: ${bestMap.wins} of ${bestMap.games} won.`, sample: bestMap.roundsWon + bestMap.roundsLost, unit: "rounds", confidence: confidence(bestMap.roundsWon + bestMap.roundsLost) })
  }

  const atk = rate(s.sides.attack)
  const def = rate(s.sides.defense)
  if (s.sides.attack.played >= 20 && s.sides.defense.played >= 20 && Math.abs(atk - def) >= 0.06) {
    const weak = atk < def ? "attack" : "defense"
    out.push({
      kind: "side",
      title: weak === "attack" ? "Make them attack" : "Make them defend",
      detail: `They win ${pct(atk)} of attack rounds and ${pct(def)} on defense. Choose the side that sends them to their weaker half first.`,
      sample: s.sides.attack.played + s.sides.defense.played,
      unit: "rounds",
      confidence: confidence(Math.min(s.sides.attack.played, s.sides.defense.played)),
    })
  }

  if (s.planting.retakes.played >= 8 && rate(s.planting.retakes) < 0.3) {
    out.push({ kind: "retake", title: "Plant and hold", detail: `When the spike goes down against them, they win only ${pct(rate(s.planting.retakes))} of retakes (${s.planting.retakes.won} of ${s.planting.retakes.played}).`, sample: s.planting.retakes.played, unit: "rounds", confidence: confidence(s.planting.retakes.played) })
  }

  const eco = s.economy.find((e) => e.buy === "eco")
  if (eco && eco.rounds >= 8 && eco.won / eco.rounds < 0.3) {
    out.push({ kind: "economy", title: "Punish their saves", detail: `On eco rounds they win ${pct(eco.won / eco.rounds)} (${eco.won} of ${eco.rounds}). Full-buy into their save rounds and don't give up free kills.`, sample: eco.rounds, unit: "rounds", confidence: confidence(eco.rounds) })
  }
  const force = s.economy.find((e) => e.buy === "force")
  if (force && force.rounds >= 8 && force.won / force.rounds >= 0.5) {
    out.push({ kind: "economy", title: "Respect their force buys", detail: `They win ${pct(force.won / force.rounds)} of force-buy rounds (${force.won} of ${force.rounds}). Don't over-peek when they're half-bought.`, sample: force.rounds, unit: "rounds", confidence: confidence(force.rounds) })
  }

  if (s.pistols.all.played >= 4 && rate(s.pistols.all) < 0.45) {
    out.push({ kind: "pistol", title: "Invest in pistol rounds", detail: `They won ${s.pistols.all.won} of ${s.pistols.all.played} pistol rounds. A pistol win sets up your next two rounds.`, sample: s.pistols.all.played, unit: "rounds", confidence: confidence(s.pistols.all.played) })
  }

  const target = r.players
    .filter((p) => p.firstKills + p.firstDeaths >= 12)
    .map((p) => ({ p, share: p.firstKills / (p.firstKills + p.firstDeaths) }))
    .sort((a, b) => a.share - b.share)[0]
  if (target && target.share < 0.45) {
    out.push({ kind: "player", title: `Take early fights with ${target.p.name}`, detail: `${target.p.name} wins ${pct(target.share)} of opening duels (${target.p.firstKills}-${target.p.firstDeaths}).`, sample: target.p.firstKills + target.p.firstDeaths, unit: "duels", confidence: confidence(target.p.firstKills + target.p.firstDeaths) })
  }
  const star = [...r.players].filter((p) => p.rounds >= 50).sort((a, b) => b.kd - a.kd)[0]
  if (star && star.kd >= 1.15) {
    out.push({ kind: "player", title: `Plan around ${star.name}`, detail: `${star.name} leads them with a ${star.kd.toFixed(2)} K/D, mostly on ${star.agents.slice(0, 2).map((a) => a.agent).join(" and ")}. Use utility on their first contact.`, sample: star.rounds, unit: "rounds", confidence: confidence(star.rounds) })
  }

  const topComp = r.compositions[0]
  if (topComp && r.scope.games >= 4 && topComp.games / r.scope.games >= 0.35) {
    out.push({ kind: "composition", title: "Expect their main composition", detail: `They ran ${topComp.agents.join(", ")} in ${topComp.games} of ${r.scope.games} maps and won ${topComp.wins}.`, sample: topComp.games, unit: "maps", confidence: confidence(topComp.games) })
  }
  return out
}

/** Maps and tournaments a report can be filtered by (only those the team actually played). */
export function scoutOptions(db: Db, teamId: string) {
  const games = teamGames(db, teamId, {})
  return {
    maps: [...new Set(games.map((g) => g.game.map_name))].sort(),
    tournaments: [...new Set(games.map((g) => g.series.tournament_id))].map((id) => db.tournament.get(id)!).filter(Boolean),
  }
}

/** Teams for the picker, most series won first. */
export function teamCards(db: Db) {
  return db.teams
    .map((t) => {
      const series = db.series.filter((s) => s.team_a_id === t.id || s.team_b_id === t.id)
      const games = series.flatMap((s) => db.gamesBySeries.get(s.id) ?? [])
      const last = [...series].sort((a, b) => b.start_time.localeCompare(a.start_time))[0]
      return {
        id: t.id,
        name: t.name,
        series: { played: series.length, won: series.filter((s) => s.winner_id === t.id).length },
        maps: { played: games.length, won: games.filter((g) => g.winner_id === t.id).length },
        lastPlayed: last?.start_time ?? null,
      }
    })
    .sort((a, b) => b.series.won - a.series.won || a.name.localeCompare(b.name))
}
