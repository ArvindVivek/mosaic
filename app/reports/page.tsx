import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, FileSearch } from "lucide-react"
import { Card, EmptyState, Icon } from "@/components/kl"
import { PageHeader } from "@/components/mosaic/page-header"
import { TeamBadge } from "@/components/mosaic/team-badge"
import { UrlPicker } from "@/components/mosaic/url-picker"
import { ShareButton } from "@/components/mosaic/share-button"
import { AnalystChat } from "@/components/mosaic/analyst-chat"
import { AiBrief } from "@/components/mosaic/ai-brief"
import { CompositionsSection, CountersSection, MapsSection, OverviewSection, PlayersSection, StrategySection } from "@/components/mosaic/sections"
import { shortDate } from "@/components/mosaic/format"
import { getDb } from "@/lib/data"
import { mapLabel, tournamentLabel } from "@/lib/data/names"
import { buildScoutingReport, scoutOptions, teamCards } from "@/lib/scouting"
import { cn } from "@/lib/kl/cn"

type Props = { searchParams: Promise<{ team?: string; t?: string; map?: string; tab?: string; snapshot?: string }> }

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "strategies", label: "Strategy" },
  { key: "players", label: "Players" },
  { key: "compositions", label: "Compositions" },
  { key: "maps", label: "Maps" },
  { key: "counters", label: "How to beat them" },
] as const
type TabKey = (typeof TABS)[number]["key"]

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { team } = await searchParams
  const name = team ? getDb().team.get(team)?.name : undefined
  return name
    ? { title: `${name} scouting report`, description: `How ${name} play and how to beat them, from real VCT Americas matches.` }
    : { title: "Scouting reports", description: "Pick a VCT Americas team to see how they win, where they're weak and how to beat them." }
}

function href(params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
  return `/reports?${q.toString()}`
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams
  const db = getDb()
  const teams = teamCards(db)
  const team = params.team ? db.team.get(params.team) : undefined

  if (!team) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="VALORANT scouting"
          title="Scout any VCT Americas team"
          description="Pick an opponent. Mosaic reads every round they played in 32 playoff series and tells you how they win, where they're weak and how to beat them."
        />
        {params.snapshot && (
          <Card tone="inset" className="text-[15px] text-ink">
            That link came from Mosaic&apos;s hackathon version, whose saved reports are gone. Pick the team again below; reports now
            rebuild from the link alone.
          </Card>
        )}
        {params.team && !team && <Card tone="inset" className="text-[15px] text-ink">We couldn&apos;t find that team. Pick one below.</Card>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Link key={t.id} href={href({ team: t.id })} className="group flex items-center gap-4 rounded-lg bg-surface p-5 shadow-[var(--shadow-card)] transition-colors duration-75 hover:bg-surface-2">
              <TeamBadge name={t.name} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-title3 text-ink">{t.name}</span>
                <span className="block text-[15px] text-ink-2">
                  {t.series.won}–{t.series.played - t.series.won} in series · last played {shortDate(t.lastPlayed)}
                </span>
              </span>
              <Icon icon={ChevronRight} size={20} className="text-ink-2 transition-transform duration-75 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const options = scoutOptions(db, team.id)
  const tournamentId = options.tournaments.some((t) => t.id === params.t) ? params.t : undefined
  const mapName = options.maps.includes(params.map ?? "") ? params.map : undefined
  const tab: TabKey = TABS.some((t) => t.key === params.tab) ? (params.tab as TabKey) : "overview"
  const report = buildScoutingReport(db, team.id, { tournamentId, mapName })!
  const scope = { teamId: team.id, teamName: team.name, tournamentId, mapName }
  const tournamentName = tournamentId ? db.tournament.get(tournamentId)?.name : null

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Scouting report"
        title={
          <span className="flex items-center gap-3">
            <TeamBadge name={team.name} size="lg" tone="accent" />
            {team.name}
          </span>
        }
        description={`${report.scope.series} series, ${report.scope.games} maps and ${report.scope.rounds} rounds${tournamentName ? ` in ${tournamentLabel(tournamentName)}` : " across 2024 and 2025"}${mapName ? ` on ${mapLabel(mapName)}` : ""}.`}
        actions={<ShareButton />}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <UrlPicker
          label="Team"
          param="team"
          value={team.id}
          basePath="/reports"
          keep={{ tab }}
          options={teams.map((t) => ({ value: t.id, label: t.name }))}
        />
        <UrlPicker
          label="Tournament"
          param="t"
          value={tournamentId}
          basePath="/reports"
          keep={{ team: team.id, map: mapName, tab }}
          placeholder="All tournaments"
          options={options.tournaments.map((t) => ({ value: t.id, label: tournamentLabel(t.name) }))}
        />
        <UrlPicker
          label="Map"
          param="map"
          value={mapName}
          basePath="/reports"
          keep={{ team: team.id, t: tournamentId, tab }}
          placeholder="All maps"
          options={options.maps.map((m) => ({ value: m, label: mapLabel(m) }))}
        />
      </div>

      {report.scope.games === 0 ? (
        <Card>
          <EmptyState icon={FileSearch} title="No maps in this scope" message={`${team.name} didn't play that map in the tournament you picked. Widen the filters.`} tone="neutral" />
        </Card>
      ) : (
        <>
          <nav aria-label="Report sections" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-2">
              {TABS.map((t) => (
                <li key={t.key}>
                  <Link
                    href={href({ team: team.id, t: tournamentId, map: mapName, tab: t.key === "overview" ? undefined : t.key })}
                    aria-current={tab === t.key ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-bold",
                      tab === t.key ? "bg-accent-soft text-accent-text ring-1 ring-inset ring-accent/60" : "bg-surface text-ink shadow-[var(--shadow-card)] hover:bg-surface-2",
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {tab === "overview" && (
            <div className="space-y-8">
              <AiBrief key={`${team.id}|${tournamentId}|${mapName}`} scope={scope} />
              <OverviewSection r={report} />
            </div>
          )}
          {tab === "strategies" && <StrategySection r={report} />}
          {tab === "players" && <PlayersSection r={report} />}
          {tab === "compositions" && <CompositionsSection r={report} />}
          {tab === "maps" && <MapsSection r={report} />}
          {tab === "counters" && <CountersSection r={report} />}
        </>
      )}

      <AnalystChat key={`${team.id}|${tournamentId}|${mapName}`} scope={scope} />
    </div>
  )
}
