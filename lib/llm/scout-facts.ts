import { mapLabel, tournamentLabel } from "@/lib/data/names"
import type { ScoutingReport } from "@/lib/scouting"

/*
 * What the AI is told about a scouting report: a dozen compact lines of computed numbers (about
 * 300 tokens), never match logs. The same lines are the no-AI answer.
 */

const pct = (won: number, played: number) => (played ? `${Math.round((won / played) * 100)}%` : "n/a")

export function scoutFacts(r: ScoutingReport, tournamentName?: string | null): string[] {
  const s = r.strategies
  const lines = [
    `${r.team.name}${tournamentName ? ` in ${tournamentLabel(tournamentName)}` : ""}${r.scope.mapName ? ` on ${mapLabel(r.scope.mapName)}` : ""}: series ${r.record.series.won}-${r.record.series.played - r.record.series.won}, maps ${r.record.maps.won}-${r.record.maps.played - r.record.maps.won}, rounds won ${pct(r.record.rounds.won, r.record.rounds.played)}.`,
    `Sides: attack ${pct(s.sides.attack.won, s.sides.attack.played)} of ${s.sides.attack.played} rounds, defense ${pct(s.sides.defense.won, s.sides.defense.played)} of ${s.sides.defense.played}.`,
    `Pistols won ${s.pistols.all.won} of ${s.pistols.all.played} (attack ${s.pistols.attack.won}/${s.pistols.attack.played}, defense ${s.pistols.defense.won}/${s.pistols.defense.played}).`,
    `Economy: ${s.economy.map((e) => `${e.buy} ${e.won}/${e.rounds}`).join(", ")}.`,
    `Planting: planted in ${pct(s.planting.plants, s.planting.attackRounds)} of attack rounds, won ${pct(s.planting.postPlant.won, s.planting.postPlant.played)} after planting; retakes won ${pct(s.planting.retakes.won, s.planting.retakes.played)} of ${s.planting.retakes.played}.`,
    `Opening kills: got the first kill in ${pct(s.firstKill.ours, s.firstKill.rounds)} of rounds and won ${pct(s.firstKill.wonAfter, s.firstKill.ours)} of those.`,
    `Maps: ${r.maps.map((m) => `${mapLabel(m.map)} ${m.wins}-${m.games - m.wins}`).join(", ")}.`,
    `Players: ${r.players.slice(0, 6).map((p) => `${p.name} K/D ${p.kd.toFixed(2)}, opening duels ${p.firstKills}-${p.firstDeaths}, main ${p.agents[0]?.agent ?? "?"}`).join("; ")}.`,
    ...(r.compositions[0] ? [`Most-played composition: ${r.compositions[0].agents.join(", ")} (${r.compositions[0].wins}-${r.compositions[0].games - r.compositions[0].wins}).`] : []),
    ...r.counters.slice(0, 4).map((c) => `Counter: ${c.title}. ${c.detail}`),
  ]
  return lines
}

const TOPICS: [RegExp, string][] = [
  [/pistol/i, "pistols"],
  [/eco|force|buy|money|econom/i, "economy"],
  [/plant|spike|retake|post/i, "planting"],
  [/attack|defen|side/i, "sides"],
  [/map|pick|ban|veto/i, "maps"],
  [/player|who|star|duel|k\/?d/i, "players"],
  [/comp|agent|lineup/i, "composition"],
  [/beat|counter|weak|exploit/i, "counter"],
  [/open|first (kill|blood)/i, "opening kills"],
]

/** The no-AI answer: the fact lines that match the question's topic (the headline if none do). */
export function scoutFallback(team: string, lines: string[], question: string): string {
  const topics = TOPICS.filter(([re]) => re.test(question)).map(([, key]) => key.toLowerCase())
  const picked = lines.filter((l) => topics.some((t) => l.toLowerCase().includes(t))).slice(0, 3)
  return `The AI analyst can't answer right now, so here are the numbers for ${team}. ${(picked.length ? picked : lines.slice(0, 1)).join(" ")}`
}

export const CHAT_SCHEMA = {
  name: "chat_answer",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["answer", "follow_up"],
    properties: {
      answer: { type: "string", description: "At most 100 words. Cite the numbers you use." },
      follow_up: { type: ["string", "null"], description: "A short next question the user might ask, or null." },
    },
  },
}
