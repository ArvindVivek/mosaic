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
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Match Count</label>
      <div className="flex gap-2">
        {MATCH_COUNT_OPTIONS.map((count) => (
          <Button
            key={count}
            variant={matchCount === count ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMatchCount(count)}
          >
            {count === 0 ? 'All' : count}
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {matchCount === 0
          ? 'Analyze all available matches'
          : `Analyze last ${matchCount} matches`}
      </p>
    </div>
  )
}
