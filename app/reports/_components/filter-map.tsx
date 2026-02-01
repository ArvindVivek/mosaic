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

interface FilterMapProps {
  maps: string[]
}

export function FilterMap({ maps }: FilterMapProps) {
  const [mapName, setMapName] = useQueryState('map', parseAsString)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden"
        >
          <span className="truncate">{mapName ?? 'Map'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search maps..." />
          <CommandList>
            <CommandEmpty>No map found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-maps"
                onSelect={() => {
                  setMapName(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !mapName ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All Maps
              </CommandItem>
              {maps.map((map) => (
                <CommandItem
                  key={map}
                  value={map}
                  onSelect={() => {
                    setMapName(map === mapName ? null : map)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      mapName === map ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {map}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
