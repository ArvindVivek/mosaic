import { format } from 'date-fns';
import { Calendar, Database, Clock } from 'lucide-react';

interface DataFreshnessProps {
  dateRange?: {
    from: Date | string;
    to: Date | string;
  };
  matchCount: number;
  lastUpdated: Date | string;
}

export function DataFreshness({ dateRange, matchCount, lastUpdated }: DataFreshnessProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM dd, yyyy');
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM dd, yyyy h:mm a');
  };

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4 mt-6">
      {dateRange && (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Database className="h-4 w-4" />
        <span>{matchCount} {matchCount === 1 ? 'match' : 'matches'} analyzed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        <span>Updated {formatDateTime(lastUpdated)}</span>
      </div>
    </div>
  );
}
