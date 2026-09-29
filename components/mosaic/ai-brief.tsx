"use client"

import { useState } from "react"
import { Info, Sparkles } from "lucide-react"
import { Button, Card, Icon } from "@/components/kl"
import type { ScoutScope } from "./analyst-chat"

/**
 * "Write the brief": one AI answer summarising how to beat the team. Nothing is sent until the
 * button is pressed, so reading a report never spends tokens.
 */
export function AiBrief({ scope }: { scope: ScoutScope }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; text?: string; fallback?: boolean }>({ status: "idle" })

  async function ask() {
    setState({ status: "loading" })
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Write a short scouting brief: how to beat ${scope.teamName}.` }],
          teamId: scope.teamId,
          tournamentId: scope.tournamentId,
          mapName: scope.mapName,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.answer) {
        setState({ status: "error", text: body?.error?.message ?? "The analyst couldn't write the brief. Try again in a minute." })
        return
      }
      setState({ status: "done", text: body.answer, fallback: body.source === "fallback" })
    } catch (err) {
      console.error("[brief] failed", err)
      setState({ status: "error", text: "We couldn't reach the analyst. Check your connection and try again." })
    }
  }

  if (state.status === "done") {
    return (
      <Card tone="accent" className="space-y-2">
        {state.fallback && (
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink-2">
            <Icon icon={Info} size={15} />
            AI unavailable right now: this brief is written from the numbers.
          </p>
        )}
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{state.text}</p>
      </Card>
    )
  }
  return (
    <div className="space-y-2">
      <Button icon={Sparkles} loading={state.status === "loading"} onClick={ask}>
        Write the AI brief
      </Button>
      {state.status === "error" && <p className="text-[15px] font-bold text-danger-text">{state.text}</p>}
    </div>
  )
}
