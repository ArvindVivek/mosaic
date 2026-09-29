import { Bomb, Coins, Crosshair, Map as MapIcon, Shield, Swords, Target, Trophy } from "lucide-react"
import { Badge, Card, EmptyState, SectionHeader, StatTile } from "@/components/kl"
import { cn } from "@/lib/kl/cn"
import { agentLabel, mapLabel } from "@/lib/data/names"
import { AGENT_ROLES, type Counter, type Role, type ScoutingReport, type WinLoss } from "@/lib/scouting"
import { credits, shortDate } from "./format"

const pct = (x: WinLoss | number) => {
  const v = typeof x === "number" ? x : x.played ? x.won / x.played : 0
  return `${Math.round(v * 100)}%`
}
const wl = (x: WinLoss) => `${x.won}–${x.played - x.won}`

const CONFIDENCE = {
  HIGH: { tone: "success", label: "Solid sample" },
  MEDIUM: { tone: "warning", label: "Small sample" },
  LOW: { tone: "neutral", label: "Thin sample" },
} as const

const ROLE_LABEL: Record<Role, string> = { duelist: "Duelist", initiator: "Initiator", controller: "Controller", sentinel: "Sentinel" }

const BUY_LABEL = { eco: "Eco (under 10k)", force: "Force buy (10k–20k)", full: "Full buy (20k+)" } as const

/** A bar that fills to a share, with the share printed beside it (never colour alone). */
function Meter({ value, label, tone = "accent" }: { value: number; label: string; tone?: "accent" | "attack" | "defense" }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[15px]">
        <span className="text-ink">{label}</span>
        <span className="tabular font-display text-title3 text-ink">{pct(value)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <div className={cn("h-full rounded-full", tone === "accent" && "bg-accent", tone === "attack" && "bg-attack", tone === "defense" && "bg-defense")} style={{ width: pct(value) }} />
      </div>
    </div>
  )
}

export function CounterCard({ c }: { c: Counter }) {
  const conf = CONFIDENCE[c.confidence]
  return (
    <Card className="flex flex-col gap-2">
      <h3 className="text-title3 text-ink">{c.title}</h3>
      <p className="text-[15px] text-ink">{c.detail}</p>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <Badge tone={conf.tone} className="whitespace-nowrap">{conf.label}</Badge>
        <span className="text-[13px] text-ink-2">Based on {c.sample} {c.unit}</span>
      </div>
    </Card>
  )
}

export function OverviewSection({ r }: { r: ScoutingReport }) {
  const s = r.strategies
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Trophy} value={wl(r.record.series)} label="Series" />
        <StatTile icon={MapIcon} value={wl(r.record.maps)} label="Maps" />
        <StatTile icon={Swords} value={pct(s.sides.attack)} label="Attack rounds won" detail={`${s.sides.attack.played} rounds`} />
        <StatTile icon={Shield} value={pct(s.sides.defense)} label="Defense rounds won" detail={`${s.sides.defense.played} rounds`} />
      </div>

      <section aria-labelledby="beat" className="space-y-4">
        <SectionHeader id="beat" title="How to beat them" description="The clearest openings in their numbers." />
        {r.counters.length === 0 ? (
          <Card>
            <EmptyState icon={Target} title="No clear weakness" message="Nothing stood out in this scope. Try all tournaments or another map." tone="neutral" />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {r.counters.slice(0, 3).map((c) => (
              <CounterCard key={c.title} c={c} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent" className="space-y-4">
        <SectionHeader id="recent" title="Recent results" />
        <Card padding="none" className="overflow-hidden">
          <ul>
            {r.recent.map((m) => (
              <li key={m.seriesId} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 last:border-b-0">
                <Badge tone={m.won ? "success" : "danger"}>{m.won ? "Won" : "Lost"}</Badge>
                <span className="font-bold text-ink">
                  <span className="tabular">{m.score}</span> vs {m.opponent}
                </span>
                <span className="text-[15px] text-ink-2">
                  {m.maps.map(mapLabel).join(", ")} · {shortDate(m.date)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}

export function StrategySection({ r }: { r: ScoutingReport }) {
  const s = r.strategies
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="flex items-center gap-2 text-title3 text-ink">
            <Target size={18} className="text-accent-text" aria-hidden="true" /> Pistol rounds
          </h3>
          <Meter label={`All pistols (${wl(s.pistols.all)})`} value={s.pistols.all.played ? s.pistols.all.won / s.pistols.all.played : 0} />
          <Meter label={`On attack (${wl(s.pistols.attack)})`} value={s.pistols.attack.played ? s.pistols.attack.won / s.pistols.attack.played : 0} tone="attack" />
          <Meter label={`On defense (${wl(s.pistols.defense)})`} value={s.pistols.defense.played ? s.pistols.defense.won / s.pistols.defense.played : 0} tone="defense" />
          <p className="text-[15px] text-ink-2">
            After winning a pistol they took the next round {s.pistols.bonusAfterWin.won} of {s.pistols.bonusAfterWin.played} times.
          </p>
        </Card>

        <Card className="space-y-4">
          <h3 className="flex items-center gap-2 text-title3 text-ink">
            <Bomb size={18} className="text-accent-text" aria-hidden="true" /> The spike
          </h3>
          <Meter label={`Planted on attack (${s.planting.plants} of ${s.planting.attackRounds})`} value={s.planting.attackRounds ? s.planting.plants / s.planting.attackRounds : 0} tone="attack" />
          <Meter label={`Won after planting (${wl(s.planting.postPlant)})`} value={s.planting.postPlant.played ? s.planting.postPlant.won / s.planting.postPlant.played : 0} tone="attack" />
          <Meter label={`Won retakes on defense (${wl(s.planting.retakes)})`} value={s.planting.retakes.played ? s.planting.retakes.won / s.planting.retakes.played : 0} tone="defense" />
          {s.planting.avgPlantSeconds != null && (
            <p className="text-[15px] text-ink-2">Their plants land about {s.planting.avgPlantSeconds} seconds after the buy phase.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="econ" className="space-y-4">
          <SectionHeader id="econ" title="Economy" description="How rounds went for each kind of team buy (pistols not counted)." />
          <Card padding="none" className="overflow-hidden">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-2">
                  <th scope="col" className="px-4 py-3 font-extrabold">Buy</th>
                  <th scope="col" className="px-2 py-3 text-right font-extrabold">Won–lost</th>
                  <th scope="col" className="px-2 py-3 text-right font-extrabold">Win rate</th>
                  <th scope="col" className="px-4 py-3 text-right font-extrabold">Avg. spend</th>
                </tr>
              </thead>
              <tbody>
                {s.economy.map((e) => (
                  <tr key={e.buy} className="border-t border-line">
                    <td className="px-4 py-2.5 font-bold text-ink">{BUY_LABEL[e.buy]}</td>
                    <td className="tabular px-2 py-2.5 text-right text-ink">{e.won}–{e.rounds - e.won}</td>
                    <td className="tabular px-2 py-2.5 text-right text-ink">{pct(e.won / e.rounds)}</td>
                    <td className="tabular px-4 py-2.5 text-right text-ink">{credits(e.avgSpend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section aria-labelledby="open" className="space-y-4">
          <SectionHeader id="open" title="Opening kills" description="Who draws first blood, and what it's worth." />
          <Card className="space-y-4">
            <Meter label={`Got the first kill (${s.firstKill.ours} of ${s.firstKill.rounds} rounds)`} value={s.firstKill.rounds ? s.firstKill.ours / s.firstKill.rounds : 0} />
            <Meter label={`Won the round after it (${s.firstKill.wonAfter} of ${s.firstKill.ours})`} value={s.firstKill.ours ? s.firstKill.wonAfter / s.firstKill.ours : 0} />
            {s.firstKill.avgSeconds != null && <p className="text-[15px] text-ink-2">Their first kills come about {s.firstKill.avgSeconds} seconds in.</p>}
          </Card>
        </section>
      </div>
    </div>
  )
}

export function PlayersSection({ r }: { r: ScoutingReport }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Players" description="Everyone who played in this scope, most rounds first. KAST: rounds with a kill, an assist, survival or a traded death." />
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead>
              <tr className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-2">
                <th scope="col" className="px-4 py-3 font-extrabold">Player</th>
                <th scope="col" className="px-2 py-3 text-right font-extrabold">Rounds</th>
                <th scope="col" className="px-2 py-3 text-right font-extrabold">K/D</th>
                <th scope="col" className="px-2 py-3 text-right font-extrabold" title="Kills per round">KPR</th>
                <th scope="col" className="px-2 py-3 text-right font-extrabold">KAST</th>
                <th scope="col" className="px-2 py-3 text-right font-extrabold">Opening duels</th>
                <th scope="col" className="px-4 py-3 text-right font-extrabold">Clutches</th>
              </tr>
            </thead>
            <tbody>
              {r.players.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-2.5">
                    <span className="block font-bold text-ink">{p.name}</span>
                    <span className="block text-[13px] text-ink-2">
                      {p.role ? `${ROLE_LABEL[p.role]} · ` : ""}
                      {p.agents.slice(0, 3).map((a) => agentLabel(a.agent)).join(", ")}
                    </span>
                  </td>
                  <td className="tabular px-2 py-2.5 text-right text-ink">{p.rounds}</td>
                  <td className="tabular px-2 py-2.5 text-right font-bold text-ink">{p.kd.toFixed(2)}</td>
                  <td className="tabular px-2 py-2.5 text-right text-ink">{p.kpr.toFixed(2)}</td>
                  <td className="tabular px-2 py-2.5 text-right text-ink">{pct(p.kast)}</td>
                  <td className={cn("tabular px-2 py-2.5 text-right font-bold", p.firstKills >= p.firstDeaths ? "text-success-text" : "text-danger-text")}>
                    {p.firstKills}–{p.firstDeaths}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right text-ink">{p.clutches.won}/{p.clutches.played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function AgentChips({ agents }: { agents: string[] }) {
  const order: Role[] = ["duelist", "initiator", "controller", "sentinel"]
  const sorted = [...agents].sort((a, b) => order.indexOf(AGENT_ROLES[a] ?? "sentinel") - order.indexOf(AGENT_ROLES[b] ?? "sentinel"))
  return (
    <ul className="flex flex-wrap gap-1.5">
      {sorted.map((a, i) => (
        <li key={`${a}-${i}`} className="rounded-full bg-surface-2 px-3 py-1 text-[13px] font-bold text-ink">
          {agentLabel(a)}
        </li>
      ))}
    </ul>
  )
}

export function CompositionsSection({ r }: { r: ScoutingReport }) {
  const totalRoles = Object.values(r.roles).reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-8">
      <section aria-labelledby="roles" className="space-y-4">
        <SectionHeader id="roles" title="Roles" description="Share of agent picks by role across every map." />
        <Card className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(r.roles) as Role[]).map((role) => (
            <Meter key={role} label={ROLE_LABEL[role]} value={totalRoles ? r.roles[role] / totalRoles : 0} />
          ))}
        </Card>
      </section>
      <section aria-labelledby="comps" className="space-y-4">
        <SectionHeader id="comps" title="Compositions" description="The five agents they fielded on a map, most-played first." />
        <div className="grid gap-3 md:grid-cols-2">
          {r.compositions.slice(0, 8).map((c) => (
            <Card key={c.agents.join("+")} className="space-y-3">
              <AgentChips agents={c.agents} />
              <p className="text-[15px] text-ink">
                <span className="font-bold">
                  {c.wins}–{c.games - c.wins}
                </span>{" "}
                in {c.games} {c.games === 1 ? "map" : "maps"} · {c.maps.map(mapLabel).join(", ")}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export function MapsSection({ r }: { r: ScoutingReport }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Map pool" description="Every map they played in this scope, with each side's round win rate." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {r.maps.map((m) => {
          const winRate = m.wins / m.games
          return (
            <Card key={m.map} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-title2 text-ink">{mapLabel(m.map)}</h3>
                  <p className="text-[15px] text-ink-2">
                    {m.wins}–{m.games - m.wins} in maps · {m.roundsWon}–{m.roundsLost} in rounds
                  </p>
                </div>
                {m.games < 2 ? (
                  <Badge tone="neutral" className="whitespace-nowrap">One map</Badge>
                ) : (
                  <Badge tone={winRate >= 0.6 ? "success" : winRate < 0.4 ? "danger" : "neutral"}>
                    {winRate >= 0.6 ? "Strong" : winRate < 0.4 ? "Weak" : "Even"}
                  </Badge>
                )}
              </div>
              <Meter label="Attack rounds" value={m.attack.played ? m.attack.won / m.attack.played : 0} tone="attack" />
              <Meter label="Defense rounds" value={m.defense.played ? m.defense.won / m.defense.played : 0} tone="defense" />
              {m.comp && (
                <div className="space-y-1.5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-2">Usual composition</p>
                  <AgentChips agents={m.comp} />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function CountersSection({ r }: { r: ScoutingReport }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="How to beat them" description="Each opening with the numbers behind it. Thin samples are marked; weigh them lightly." />
      {r.counters.length === 0 ? (
        <Card>
          <EmptyState icon={Crosshair} title="No clear weakness" message="Nothing stood out in this scope. Widen it to all tournaments or all maps." tone="neutral" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {r.counters.map((c) => (
            <CounterCard key={c.title} c={c} />
          ))}
        </div>
      )}
      <p className="flex items-center gap-2 text-[13px] text-ink-2">
        <Coins size={14} aria-hidden="true" /> Spike sites and damage aren&apos;t in the match feed, so Mosaic doesn&apos;t guess at them.
      </p>
    </div>
  )
}
