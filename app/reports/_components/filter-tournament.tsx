'use client'

import { useState } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Tournament } from '@/app/lib/data/matches'

interface FilterTournamentProps {
  tournaments: Tournament[]
}

export function FilterTournament({ tournaments }: FilterTournamentProps) {
  const [tournamentId, setTournamentId] = useQueryState('tournament', parseAsString)
  const [open, setOpen] = useState(false)

  const selectedTournament = tournaments.find((t) => t.id === tournamentId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden"
        >
          <span className="truncate">{selectedTournament?.name ?? 'Tournament'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search tournaments..." />
          <CommandList>
            <CommandEmpty>No tournament found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-tournaments"
                onSelect={() => {
                  setTournamentId(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !tournamentId ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All Tournaments
              </CommandItem>
              {tournaments.map((tournament) => (
                <CommandItem
                  key={tournament.id}
                  value={tournament.name ?? tournament.id}
                  onSelect={() => {
                    setTournamentId(tournament.id === tournamentId ? null : tournament.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      tournamentId === tournament.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {tournament.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
