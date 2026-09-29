"use client"

import { Link2 } from "lucide-react"
import { Button, useToast } from "@/components/kl"

/**
 * Copies the report's link. Reports are computed from the bundled matches, so the link alone
 * reproduces them: no snapshot needs storing (the hackathon version saved each one to a database).
 */
export function ShareButton() {
  const toast = useToast()
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.show("Link copied. Anyone with it sees this report.", { tone: "success" })
    } catch (err) {
      console.error("[share] clipboard failed", err)
      toast.show("Couldn't copy the link. Copy it from the address bar instead.", { tone: "danger" })
    }
  }
  return (
    <Button variant="secondary" size="sm" icon={Link2} onClick={copy}>
      Copy link
    </Button>
  )
}
