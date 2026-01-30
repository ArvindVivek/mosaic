// Counter-strategy detection with confidence scoring
// Identifies exploitable patterns and timing-based recommendations

import { differenceInDays } from 'date-fns';
import type {
  TeamStrategiesSummary,
  MapWinRate,
  ExploitablePattern,
  TimingPattern,
  CounterStrategy,
  CounterStrategiesSummary,
  ConfidenceLevel,
} from './types';

// =============================================================================
// Confidence Scoring (COUNTER-02)
// =============================================================================

/**
 * Calculate confidence level based on sample size
 * Thresholds: HIGH >= 30, MEDIUM >= 10, LOW < 10
 */
export function calculateConfidence(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 30) return 'HIGH';
  if (sampleSize >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculate recency score using exponential decay
 * Formula: e^(-lambda * days)
 * Lambda = 0.15 (moderate-fast decay for esports meta)
 */
export function calculateRecencyScore(seriesDateStr: string): number {
  const daysAgo = differenceInDays(new Date(), new Date(seriesDateStr));
  const lambda = 0.15;
  return Math.exp(-lambda * daysAgo);
}

// =============================================================================
// Pattern Detection (COUNTER-01)
// =============================================================================

/**
 * Detect exploitable patterns with low win rates (<40%)
 * Identifies weaknesses opponent can exploit
 */
export function detectExploitablePatterns(
  strategies: TeamStrategiesSummary,
  maps: MapWinRate[]
): ExploitablePattern[] {
  const patterns: ExploitablePattern[] = [];

  // Economy patterns: Find weak buy types
  for (const econ of strategies.economy_patterns) {
    if (econ.win_rate < 40 && econ.occurrences >= 5) {
      patterns.push({
        scenario: `${formatEconomyType(econ.economy_type)} rounds`,
        win_rate: econ.win_rate,
        sample_size: econ.occurrences,
        confidence: calculateConfidence(econ.occurrences),
        pattern_type: 'economy',
        counter_recommendation: `Force ${formatEconomyType(econ.economy_type)} situations with aggressive early pressure`,
      });
    }
  }

  // Site preferences: Find weak sites (low success rate)
  for (const site of strategies.site_preferences) {
    if (site.win_rate < 45 && site.attacks >= 10) {
      patterns.push({
        scenario: `${site.map_name} ${site.site} site attacks`,
        win_rate: site.win_rate,
        sample_size: site.attacks,
        confidence: calculateConfidence(site.attacks),
        pattern_type: 'site_preference',
        counter_recommendation: `Stack ${site.site} site defense on ${site.map_name}`,
      });
    }
  }

  // Map weaknesses
  for (const map of maps) {
    if (map.win_rate < 40 && map.games_played >= 3) {
      patterns.push({
        scenario: `Playing ${map.map_name}`,
        win_rate: map.win_rate,
        sample_size: map.games_played,
        confidence: calculateConfidence(map.games_played),
        pattern_type: 'composition',
        counter_recommendation: `Force ${map.map_name} pick in map veto`,
      });
    }
  }

  // Sort by win rate ascending (worst first)
  return patterns.sort((a, b) => a.win_rate - b.win_rate);
}

// =============================================================================
// Timing Pattern Detection (COUNTER-04)
// =============================================================================

/**
 * Detect predictable timing patterns (60%+ frequency)
 * Identifies tendencies opponent can anticipate
 */
export function detectTimingPatterns(
  strategies: TeamStrategiesSummary
): TimingPattern[] {
  const patterns: TimingPattern[] = [];

  // Pistol round tendencies
  const totalPistolRounds = strategies.pistol_patterns.reduce(
    (sum, p) => sum + p.occurrences,
    0
  );

  if (totalPistolRounds > 0) {
    for (const pistol of strategies.pistol_patterns) {
      const frequency = (pistol.occurrences / totalPistolRounds) * 100;

      if (frequency >= 60) {
        patterns.push({
          trigger: 'Pistol round',
          behavior: `${formatPistolPattern(pistol.pattern_type)} strategy`,
          frequency: Math.round(frequency),
          sample_size: pistol.occurrences,
          confidence: calculateConfidence(pistol.occurrences),
          counter_recommendation: getPistolCounterRecommendation(pistol.pattern_type),
        });
      }
    }
  }

  // Economy tendencies (e.g., force buy after loss)
  const forceBuy = strategies.economy_patterns.find(e => e.economy_type === 'force_buy');
  if (forceBuy && forceBuy.occurrences >= 10) {
    const totalEcoRounds = strategies.economy_patterns.reduce(
      (sum, e) => sum + e.occurrences,
      0
    );
    const forceFrequency = (forceBuy.occurrences / totalEcoRounds) * 100;

    if (forceFrequency >= 40) {
      patterns.push({
        trigger: 'After round loss',
        behavior: `Force buy ${Math.round(forceFrequency)}% of time`,
        frequency: Math.round(forceFrequency),
        sample_size: forceBuy.occurrences,
        confidence: calculateConfidence(forceBuy.occurrences),
        counter_recommendation: 'Expect force buy after pistol/round losses, prepare for upgraded weapons',
      });
    }
  }

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

// =============================================================================
// Generate Counter-Strategy Recommendations (COUNTER-03)
// =============================================================================

/**
 * Generate actionable counter-strategy recommendations
 * Combines exploitable patterns and timing patterns into unified recommendations
 */
export function generateCounterStrategies(
  strategies: TeamStrategiesSummary,
  maps: MapWinRate[]
): CounterStrategiesSummary {
  const exploitablePatterns = detectExploitablePatterns(strategies, maps);
  const timingPatterns = detectTimingPatterns(strategies);

  // Convert to unified recommendations
  const recommendations: CounterStrategy[] = [];

  // Add top 3 exploitable patterns
  for (const pattern of exploitablePatterns.slice(0, 3)) {
    recommendations.push({
      title: `Exploit: ${pattern.scenario}`,
      description: pattern.counter_recommendation,
      data_backing: `Win rate: ${pattern.win_rate}% (${pattern.sample_size} occurrences)`,
      confidence: pattern.confidence,
      sample_size: pattern.sample_size,
      pattern_type: pattern.pattern_type,
      recency_score: 1.0, // Default without series dates
    });
  }

  // Add top 2 timing patterns
  for (const pattern of timingPatterns.slice(0, 2)) {
    recommendations.push({
      title: `Predict: ${pattern.trigger}`,
      description: pattern.counter_recommendation,
      data_backing: `${pattern.behavior} (${pattern.frequency}% of time, ${pattern.sample_size} instances)`,
      confidence: pattern.confidence,
      sample_size: pattern.sample_size,
      pattern_type: 'timing',
      recency_score: 1.0,
    });
  }

  // Calculate data quality metrics
  const allSampleSizes = [
    ...exploitablePatterns.map(p => p.sample_size),
    ...timingPatterns.map(p => p.sample_size),
  ];
  const totalRounds = allSampleSizes.reduce((sum, n) => sum + n, 0);
  const hasHighConfidence = recommendations.some(r => r.confidence === 'HIGH');

  return {
    exploitable_patterns: exploitablePatterns,
    timing_patterns: timingPatterns,
    recommendations,
    data_quality: {
      total_rounds_analyzed: totalRounds,
      avg_recency_score: 1.0, // Default without series date info
      has_sufficient_data: hasHighConfidence,
    },
  };
}

// =============================================================================
// Helpers
// =============================================================================

function formatEconomyType(type: string): string {
  const labels: Record<string, string> = {
    eco: 'Eco',
    half_buy: 'Half-buy',
    force_buy: 'Force buy',
    full_buy: 'Full buy',
  };
  return labels[type] ?? type;
}

function formatPistolPattern(type: string): string {
  const labels: Record<string, string> = {
    fast_execute: 'Fast execute',
    default: 'Default setup',
    no_plant: 'No plant/pick',
  };
  return labels[type] ?? type;
}

function getPistolCounterRecommendation(pattern: string): string {
  const recommendations: Record<string, string> = {
    fast_execute: 'Set up early stack defense, expect quick site take within 30s',
    default: 'Play standard retake setup, opponent takes time to execute',
    no_plant: 'Play aggressive for picks, opponent unlikely to commit to site',
  };
  return recommendations[pattern] ?? 'Adjust based on observed tendencies';
}
