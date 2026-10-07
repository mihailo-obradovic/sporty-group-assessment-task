// * Regenerates app/fixtures/leagues.ts from TheSportsDB's lookupleague.php, so the fixture is a transcription, never typed by hand (feature 001, KNOWN_FAKES.md).
// * Usage: node scripts/capture-league-fixture.ts <capture date, YYYY-MM-DD>, then pnpm format.
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

// * The feature document's 19 ids, grouped by Sport
const LEAGUE_IDS = [
  ['4328', '4329', '4331', '4332', '4334', '4335', '4337', '4338', '4346'],
  ['4387', '4388', '4408'],
  ['4380', '4419'],
  ['4414', '4430', '4446'],
  ['4370', '4373']
].flat();

const LOOKUP_URL = 'https://www.thesportsdb.com/api/v1/json/3/lookupleague.php';
const FIELDS = ['idLeague', 'strLeague', 'strSport', 'strLeagueAlternate'];
// ! The free tier answers a burst with a Cloudflare 429
const PAUSE_MS = 1_500;
const OUTPUT = 'app/fixtures/leagues.ts';

const captureDate = process.argv[2];

if (captureDate === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(captureDate)) {
  console.error('Usage: node scripts/capture-league-fixture.ts <YYYY-MM-DD>');
  process.exit(1);
}

const leagues = [];

for (const id of LEAGUE_IDS) {
  leagues.push(await lookupLeague(id));
  await sleep(PAUSE_MS);
}

writeFileSync(
  OUTPUT,
  [
    `// ! Sample data, not the live list: a verbatim transcription of lookupleague.php for ${LEAGUE_IDS.length} real Leagues, captured ${captureDate} by scripts/capture-league-fixture.ts (KNOWN_FAKES.md)`,
    `export const leaguesFixture = ${JSON.stringify({ leagues }, null, 2)};`,
    ''
  ].join('\n')
);
console.log(`Wrote ${leagues.length} Leagues to ${OUTPUT}`);

async function lookupLeague(id: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${LOOKUP_URL}?id=${id}`);

  if (!response.ok) {
    throw new Error(`lookupleague.php?id=${id}: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { leagues?: unknown };
  const league: unknown = Array.isArray(body.leagues) ? body.leagues[0] : null;

  if (typeof league !== 'object' || league === null) {
    throw new Error(`lookupleague.php?id=${id}: no League in the response`);
  }
  if ((league as Record<string, unknown>).idLeague !== id) {
    throw new Error(`lookupleague.php?id=${id}: answered a different League`);
  }

  // * Only the fields the app reads, each exactly as returned; a field the API omits stays omitted
  return Object.fromEntries(
    FIELDS.filter((field) => field in league).map((field) => [
      field,
      (league as Record<string, unknown>)[field]
    ])
  );
}
