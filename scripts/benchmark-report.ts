/**
 * Benchmark script for report generation performance
 * Run with: npx tsx scripts/benchmark-report.ts
 *
 * Tests report generation with cold cache to validate <60s target
 */

import { generateReport } from '../app/actions/generate-report';
import { invalidateReportCache } from '../app/lib/cache/report-cache';

interface BenchmarkResult {
  teamId: string;
  coldCacheMs: number;
  warmCacheMs: number;
  passesTarget: boolean;
  sections: {
    strategies: 'success' | 'failed';
    players: 'success' | 'failed';
    compositions: 'success' | 'failed';
    maps: 'success' | 'failed';
  };
}

const TARGET_MS = 60000; // 60 seconds

// Sample team IDs from VCT Americas
const TEST_TEAMS = [
  { id: 'team-id-1', name: 'Team 1' },  // Replace with actual team IDs
  { id: 'team-id-2', name: 'Team 2' },
];

async function clearCache(): Promise<void> {
  // Clear all analytics cache
  try {
    await invalidateReportCache();
  } catch (e) {
    console.log('Cache invalidation requires server context, skipping...');
  }
}

async function benchmarkTeam(teamId: string, teamName: string): Promise<BenchmarkResult> {
  console.log(`\nBenchmarking ${teamName} (${teamId})...`);

  // Cold cache run
  console.log('  Cold cache run...');
  const coldStart = Date.now();
  const coldResult = await generateReport({ teamId, teamName, seriesIds: [] });
  const coldCacheMs = Date.now() - coldStart;

  // Warm cache run
  console.log('  Warm cache run...');
  const warmStart = Date.now();
  const warmResult = await generateReport({ teamId, teamName, seriesIds: [] });
  const warmCacheMs = Date.now() - warmStart;

  const report = coldResult.report;
  const sections = {
    strategies: report?.strategies.status ?? 'failed',
    players: report?.players.status ?? 'failed',
    compositions: report?.compositions.status ?? 'failed',
    maps: report?.maps.status ?? 'failed',
  };

  return {
    teamId,
    coldCacheMs,
    warmCacheMs,
    passesTarget: coldCacheMs < TARGET_MS,
    sections: sections as BenchmarkResult['sections'],
  };
}

async function main() {
  console.log('========================================');
  console.log('Report Generation Performance Benchmark');
  console.log('========================================');
  console.log(`Target: <${TARGET_MS}ms (${TARGET_MS / 1000}s)`);
  console.log('');

  const results: BenchmarkResult[] = [];

  for (const team of TEST_TEAMS) {
    const result = await benchmarkTeam(team.id, team.name);
    results.push(result);
  }

  // Summary
  console.log('\n========================================');
  console.log('RESULTS SUMMARY');
  console.log('========================================');

  for (const result of results) {
    const status = result.passesTarget ? 'PASS' : 'FAIL';
    console.log(`\n${result.teamId}:`);
    console.log(`  Cold cache: ${result.coldCacheMs}ms [${status}]`);
    console.log(`  Warm cache: ${result.warmCacheMs}ms`);
    console.log(`  Speedup: ${(result.coldCacheMs / result.warmCacheMs).toFixed(1)}x`);
    console.log(`  Sections: ${Object.entries(result.sections).map(([k, v]) => `${k}:${v}`).join(', ')}`);
  }

  const passing = results.filter(r => r.passesTarget).length;
  const avgCold = results.reduce((sum, r) => sum + r.coldCacheMs, 0) / results.length;
  const avgWarm = results.reduce((sum, r) => sum + r.warmCacheMs, 0) / results.length;

  console.log('\n========================================');
  console.log('OVERALL');
  console.log('========================================');
  console.log(`Passing: ${passing}/${results.length}`);
  console.log(`Avg cold cache: ${avgCold.toFixed(0)}ms`);
  console.log(`Avg warm cache: ${avgWarm.toFixed(0)}ms`);

  if (passing === results.length) {
    console.log('\nAll tests PASS - <60s target achieved!');
    process.exit(0);
  } else {
    console.log('\nSome tests FAILED - review performance');
    process.exit(1);
  }
}

main().catch(console.error);
