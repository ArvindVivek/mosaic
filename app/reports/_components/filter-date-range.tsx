'use client'

import { useState, useEffect } from 'react'
import { parseAsIsoDate, useQueryStates } from 'nuqs'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function FilterDateRange() {
  const [dateRange, setDateRange] = useQueryStates({
    from: parseAsIsoDate,
    to: parseAsIsoDate,
  })

  const [open, setOpen] = useState(false)
  const [localRange, setLocalRange] = useState<DateRange | undefined>(
    undefined
  )

  // Initialize local state from URL params
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      setLocalRange({
        from: dateRange.from ?? undefined,
        to: dateRange.to ?? undefined,
      })
    }
  }, [dateRange.from, dateRange.to])

  const handleSelect = (range: DateRange | undefined) => {
    setLocalRange(range)
    // Update URL state
    setDateRange({
      from: range?.from ?? null,
      to: range?.to ?? null,
    })
  }

  const displayText = () => {
    if (localRange?.from) {
      if (localRange.to) {
        return `${format(localRange.from, 'MMM dd, yyyy')} - ${format(localRange.to, 'MMM dd, yyyy')}`
      }
      return format(localRange.from, 'MMM dd, yyyy')
    }
    return 'Pick a date range'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !localRange?.from && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={localRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
