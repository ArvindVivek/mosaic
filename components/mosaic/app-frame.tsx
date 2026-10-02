import Link from "next/link"
import type { ReactNode } from "react"
import { COPYRIGHT, privacyUrl, supportUrl, ThemeToggle } from "@/components/kl"
import { RIOT_DISCLAIMER, site } from "@/lib/site"

/** Mosaic's frame: a slim header, the page, and the studio footer with Riot's fan-project notice. */
export function AppFrame({ children }: { children: ReactNode }) {
  const link = "inline-flex min-h-11 items-center px-3 font-bold text-ink-2 underline-offset-4 hover:text-ink hover:underline"
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:font-bold focus:text-ink focus:shadow-[var(--shadow-lift)]"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/reports" className="-ml-1 flex min-h-11 items-center gap-2.5 rounded-sm px-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- a 32px SVG needs no optimizer */}
            <img src="/icon.svg" alt="" width={32} height={32} className="rounded-[9px]" />
            <span className="font-display text-title3 font-semibold text-ink">Mosaic</span>
            <span className="hidden text-[15px] text-ink-2 sm:inline">Scouting reports</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-6 sm:px-8 sm:pt-10">
        {children}
      </main>
      <footer className="pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-1 border-t border-line pt-5 text-sm text-ink-2 sm:flex-row sm:justify-between">
            <p>{COPYRIGHT}</p>
            <nav aria-label="About this app" className="flex flex-wrap items-center justify-center">
              <a href={privacyUrl(site.slug)} className={link}>Privacy</a>
              <a href={supportUrl(site.slug)} className={link}>Support</a>
            </nav>
          </div>
          <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-2 sm:text-left">
            {RIOT_DISCLAIMER} VALORANT is a trademark of Riot Games, Inc. Match data: 32 VCT Americas playoff series (2024–2025) from
            GRID&apos;s esports feed, bundled with the app. Mosaic is a free, non-commercial project and is not affiliated with any team shown.
          </p>
        </div>
      </footer>
    </div>
  )
}
