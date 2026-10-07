import { z } from 'zod';

import { LeagueSourceSchema } from '@/types/league';

import type { LeagueSource } from '@/types/league';

export function useLeagueFilters() {
  const route = useRoute();
  const { leagueSource } = useRuntimeConfig().public;

  // * The URL is user-editable: a stale, hand-edited, or repeated value falls back to its default rather than erroring
  const LeagueFiltersSchema = z.object({
    q: z.string().catch(''),
    sport: z.string().min(1).optional().catch(undefined),
    source: LeagueSourceSchema.catch(LeagueSourceSchema.parse(leagueSource))
  });

  const filters = computed(() => LeagueFiltersSchema.parse(route.query));

  function setQuery(q: string) {
    return writeQuery({ q: q === '' ? undefined : q });
  }

  function setSport(sport: string | undefined) {
    return writeQuery({ sport });
  }

  // * The Sports differ between sources, so a chosen Sport does not carry over
  function setSource(source: LeagueSource) {
    return writeQuery({ source, sport: undefined });
  }

  function clearFilters() {
    return writeQuery({ q: undefined, sport: undefined });
  }

  // * `replace`, never `push`: Back leaves the page rather than stepping through every filter
  function writeQuery(changes: Record<string, string | undefined>) {
    return navigateTo(
      { query: { ...route.query, ...changes } },
      { replace: true }
    );
  }

  return { filters, setQuery, setSport, setSource, clearFilters };
}
