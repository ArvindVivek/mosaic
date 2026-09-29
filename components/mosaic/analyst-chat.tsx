"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowUp, Info, MessageCircle, X } from "lucide-react"
import { Icon } from "@/components/kl"
import { cn } from "@/lib/kl/cn"

interface Stat {
  label: string
  value: string
}

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  stats?: Stat[]
  source?: "ai" | "fallback"
  followUp?: string | null
}

const STARTERS = (team: string) => [`How do we beat ${team}?`, `What do ${team} do on pistol rounds?`, `Which ${team} player should we target?`]

export interface ScoutScope {
  teamId: string
  teamName: string
  tournamentId?: string
  mapName?: string
}

/**
 * The AI analyst for one scouting report. Each question goes to /api/chat with the team and
 * filters; the server adds the report's numbers. When the AI can't answer (no credits, busy), the
 * reply is the numbers themselves.
 */
export function AnalystChat({ scope }: { scope: ScoutScope }) {
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, busy])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return
    const history = [...messages, { id: nextId.current++, role: "user" as const, content: question }]
    setMessages(history)
    setInput("")
    setBusy(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-9).map((m) => ({ role: m.role, content: m.content })),
          teamId: scope.teamId,
          tournamentId: scope.tournamentId,
          mapName: scope.mapName,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.answer) {
        const message = body?.error?.message ?? "The analyst couldn't answer that. Please try again in a minute."
        setMessages((m) => [...m, { id: nextId.current++, role: "assistant", content: message }])
      } else {
        setMessages((m) => [
          ...m,
          { id: nextId.current++, role: "assistant", content: body.answer, stats: body.stats, source: body.source, followUp: body.follow_up },
        ])
      }
    } catch (err) {
      console.error("[chat] request failed", err)
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", content: "We couldn't reach the analyst. Check your connection and try again." }])
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-accent-strong px-5 font-display text-lg font-semibold text-on-accent shadow-[0_4px_0_var(--accent-deep),var(--shadow-lift)] transition-transform duration-75 active:translate-y-[2px] active:shadow-[0_2px_0_var(--accent-deep)]"
      >
        <Icon icon={MessageCircle} size={22} />
        Ask the analyst
      </button>
    )
  }

  return (
    <section
      aria-label="Ask the analyst"
      className="fixed inset-0 z-50 flex flex-col bg-bg sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:border-l sm:border-line sm:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent-text">
            <Icon icon={MessageCircle} size={18} />
          </span>
          <div>
            <h2 className="text-title3 text-ink">Ask the analyst</h2>
            <p className="text-[13px] text-ink-2">Answers use {scope.teamName}&apos;s report.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the analyst"
          className="grid size-11 place-items-center rounded-full bg-surface-2 text-ink"
        >
          <Icon icon={X} size={20} />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-[15px] text-ink-2">
              Ask how {scope.teamName} play and how to beat them. Each answer quotes the numbers it uses.
            </p>
            <div className="flex flex-col items-start gap-2">
              {STARTERS(scope.teamName).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="min-h-11 rounded-md bg-surface px-4 py-2.5 text-left text-[15px] font-bold text-ink shadow-[var(--shadow-card)] hover:bg-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-10 rounded-md rounded-br-xs bg-accent-soft px-4 py-3 text-[15px] text-ink">
              {m.content}
            </div>
          ) : (
            <div key={m.id} className="mr-6 space-y-3 rounded-md rounded-bl-xs bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
              {m.source === "fallback" && (
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-warning-text">
                  <Icon icon={Info} size={15} />
                  AI unavailable: showing the numbers
                </p>
              )}
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{m.content}</p>
              {m.stats && m.stats.length > 0 && (
                <dl className="grid grid-cols-2 gap-2">
                  {m.stats.map((s) => (
                    <div key={s.label} className="rounded-sm bg-surface-2 px-3 py-2">
                      <dt className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-2">{s.label}</dt>
                      <dd className="tabular font-display text-title3 text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {m.followUp && (
                <button
                  type="button"
                  onClick={() => void send(m.followUp!)}
                  className="min-h-11 rounded-sm px-2 text-left text-[15px] font-bold text-accent-text hover:bg-accent-soft"
                >
                  {m.followUp}
                </button>
              )}
            </div>
          ),
        )}
        {busy && <p className="text-[15px] text-ink-2">The analyst is reading the numbers…</p>}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <label htmlFor="analyst-question" className="sr-only">
          Your question
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="analyst-question"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
            rows={1}
            maxLength={500}
            placeholder={`Ask about ${scope.teamName}`}
            className="min-h-12 flex-1 resize-none rounded-sm bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-2"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send question"
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-full",
              busy || !input.trim() ? "bg-surface-2 text-ink-2" : "bg-accent-strong text-on-accent",
            )}
          >
            <Icon icon={ArrowUp} size={22} />
          </button>
        </div>
      </form>
    </section>
  )
}
