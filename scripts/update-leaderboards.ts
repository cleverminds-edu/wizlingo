#!/usr/bin/env node

/**
 * Nightly leaderboard update script
 * Run at 11 PM every night to recalculate all leaderboard rankings
 *
 * Usage:
 *   node scripts/update-leaderboards.ts
 *   npm run leaderboards:update
 *
 * To schedule as cron job (11 PM):
 *   0 23 * * * cd /path/to/app && npm run leaderboards:update
 */

import { updateLeaderboards } from '../lib/leaderboard-service';

async function main() {
  const startTime = new Date();

  console.log(`[${startTime.toISOString()}] Starting leaderboard update...`);

  try {
    await updateLeaderboards();

    const duration = new Date().getTime() - startTime.getTime();
    console.log(
      `[${new Date().toISOString()}] Leaderboard update completed successfully in ${duration}ms`
    );

    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Leaderboard update failed:`, error);
    process.exit(1);
  }
}

main();
