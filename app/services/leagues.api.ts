import { z } from 'zod';

import { LeagueSchema, SeasonSchema } from '@/types/league';

import type { League, Season } from '@/types/league';

// * TheSportsDB answers "none" with `null` rather than `[]`; the service turns it into `[]` so no consumer handles both
const AllLeaguesResponseSchema = z.object({
  leagues: z.array(LeagueSchema).nullable()
});

// ! An id the API rejects comes back as `{ seasons: "Invalid League ID passed" }`; the schema makes that a ResponseShapeError
const SeasonsResponseSchema = z.object({
  seasons: z.array(SeasonSchema).nullable()
});

export async function fetchAllLeagues(signal?: AbortSignal): Promise<League[]> {
  const { leagues } = parseResponse(
    AllLeaguesResponseSchema,
    await fetcher('all_leagues.php', { signal })
  );

  return leagues ?? [];
}

export async function fetchSeasons(
  idLeague: string,
  signal?: AbortSignal
): Promise<Season[]> {
  const { seasons } = parseResponse(
    SeasonsResponseSchema,
    await fetcher('search_all_seasons.php', {
      query: { badge: 1, id: idLeague },
      signal
    })
  );

  return seasons ?? [];
}
