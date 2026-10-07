import {
  fetchAllLeagues,
  fetchSeasons,
  loadFixtureLeagues
} from '@/services/leagues.api';

import type { Ref } from 'vue';

import type { AppQueryOptions } from '@/types/api';
import type { League, LeagueSource, SeasonBadge } from '@/types/league';

export const LEAGUES_ROOT = ['leagues'] as const;

// * Filters stay out of the keys: filtering is client-side, the API takes no filter parameters
export const leaguesQueryKeys = {
  fetchAllLeagues: ['leagues', 'all'],
  // * Keyed by League only: badges always come from the live API, so the source does not matter
  fetchSeasonBadge: ['leagues', 'season-badge']
} as const;

// * Both lists change a few times a year and the page has no refresh affordance, so an entry is fetched once and kept for the session (feature 001)
const SESSION_CACHE = { staleTime: Infinity, gcTime: false } as const;

export function useLeaguesQuery(
  source: Ref<LeagueSource>,
  options: Omit<AppQueryOptions<League[]>, 'key' | 'query'> = {}
) {
  return useAppQuery<League[]>({
    key: () => [...leaguesQueryKeys.fetchAllLeagues, source.value],
    query: ({ signal }) =>
      source.value === 'fixture'
        ? loadFixtureLeagues()
        : fetchAllLeagues(signal),
    ...SESSION_CACHE,
    ...options
  });
}

export function useSeasonBadgeQuery(
  idLeague: Ref<string>,
  options: Omit<AppQueryOptions<SeasonBadge | null>, 'key' | 'query'> = {}
) {
  return useAppQuery<SeasonBadge | null>({
    key: () => [...leaguesQueryKeys.fetchSeasonBadge, idLeague.value],
    query: async ({ signal }) =>
      pickSeasonBadge(await fetchSeasons(idLeague.value, signal)),
    ...SESSION_CACHE,
    ...options
  });
}
