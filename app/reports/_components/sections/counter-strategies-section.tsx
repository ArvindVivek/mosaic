'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, TrendingDown, Clock } from 'lucide-react';
import { generateCounterStrategies } from '@/app/lib/analytics/counter-strategies';
import type { ScoutingReport } from '@/app/lib/orchestration/types';
import type {
  CounterStrategy,
  ExploitablePattern,
  TimingPattern,
  ConfidenceLevel,
} from '@/app/lib/analytics/types';

interface CounterStrategiesSectionProps {
  report: ScoutingReport;
}

export function CounterStrategiesSection({ report }: CounterStrategiesSectionProps) {
  // Extract data from report
  const strategies = report.strategies.status === 'success' ? report.strategies.data : null;
  const maps = report.maps.status === 'success' ? report.maps.data ?? [] : [];

  // Generate counter-strategies if we have data
  if (!strategies) {
    return <EmptyState message="Strategy data unavailable for counter-strategy analysis" />;
  }

  const counterStrategies = generateCounterStrategies(strategies, maps);
  const { exploitable_patterns, timing_patterns, recommendations, data_quality } = counterStrategies;

  return (
    <div className="space-y-8">
      {/* Data Quality Notice */}
      {!data_quality.has_sufficient_data && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Limited sample size - recommendations should be validated with additional data.
            ({data_quality.total_rounds_analyzed} total data points analyzed)
          </AlertDescription>
        </Alert>
      )}

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Counter-Strategy Recommendations</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Exploitable Patterns */}
      {exploitable_patterns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Exploitable Weaknesses</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {exploitable_patterns.map((pattern, i) => (
              <ExploitablePatternCard key={i} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* Timing Patterns */}
      {timing_patterns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Predictable Tendencies</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {timing_patterns.map((pattern, i) => (
              <TimingPatternCard key={i} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && exploitable_patterns.length === 0 && timing_patterns.length === 0 && (
        <EmptyState message="No significant patterns detected - opponent plays consistently without major weaknesses" />
      )}
    </div>
  );
}

// =============================================================================
// Card Components
// =============================================================================

function RecommendationCard({ recommendation }: { recommendation: CounterStrategy }) {
  const getIcon = () => {
    switch (recommendation.pattern_type) {
      case 'timing':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'economy':
        return <TrendingDown className="h-5 w-5 text-amber-500" />;
      default:
        return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2 items-start">
            {getIcon()}
            <CardTitle className="text-base leading-tight">{recommendation.title}</CardTitle>
          </div>
          <ConfidenceBadge confidence={recommendation.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{recommendation.description}</p>
        <p className="text-xs text-muted-foreground">
          {recommendation.data_backing}
        </p>
        {recommendation.confidence === 'LOW' && (
          <LowConfidenceWarning sampleSize={recommendation.sample_size} />
        )}
      </CardContent>
    </Card>
  );
}

function ExploitablePatternCard({ pattern }: { pattern: ExploitablePattern }) {
  return (
    <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pattern.scenario}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="destructive">{pattern.win_rate}% WR</Badge>
            <ConfidenceBadge confidence={pattern.confidence} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{pattern.counter_recommendation}</p>
        <p className="text-xs text-muted-foreground">
          Based on {pattern.sample_size} occurrences
        </p>
        {pattern.confidence === 'LOW' && (
          <LowConfidenceWarning sampleSize={pattern.sample_size} />
        )}
      </CardContent>
    </Card>
  );
}

function TimingPatternCard({ pattern }: { pattern: TimingPattern }) {
  return (
    <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pattern.trigger}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{pattern.frequency}%</Badge>
            <ConfidenceBadge confidence={pattern.confidence} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">{pattern.behavior}</p>
        <p className="text-sm">{pattern.counter_recommendation}</p>
        <p className="text-xs text-muted-foreground">
          Observed in {pattern.sample_size} instances
        </p>
        {pattern.confidence === 'LOW' && (
          <LowConfidenceWarning sampleSize={pattern.sample_size} />
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const variant = confidence === 'HIGH'
    ? 'default'
    : confidence === 'MEDIUM'
    ? 'secondary'
    : 'outline';

  return <Badge variant={variant}>{confidence}</Badge>;
}

function LowConfidenceWarning({ sampleSize }: { sampleSize: number }) {
  return (
    <Alert variant="default" className="py-2 flex items-center gap-2">
      <AlertCircle className="h-3 w-3 shrink-0" />
      <AlertDescription className="text-xs">
        Sample size: {sampleSize} - insufficient for reliable pattern
      </AlertDescription>
    </Alert>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/10">
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  );
}
