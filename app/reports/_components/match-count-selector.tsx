'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { Button } from '@/components/ui/button'

const MATCH_COUNT_OPTIONS = [5, 10, 15, 20, 0] as const // 0 = All

export function MatchCountSelector() {
  const [matchCount, setMatchCount] = useQueryState(
    'matchCount',
    parseAsInteger.withDefault(10)
  )

  return (
    <div className="flex gap-1">
      {MATCH_COUNT_OPTIONS.map((count) => (
        <Button
          key={count}
          variant={matchCount === count ? 'default' : 'outline'}
          size="sm"
          className="h-9 px-2.5 text-xs"
          onClick={() => setMatchCount(count)}
        >
          {count === 0 ? 'All' : count}
        </Button>
      ))}
    </div>
  )
}
