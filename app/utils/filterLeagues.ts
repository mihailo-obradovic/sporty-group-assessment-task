import type { League, Season } from '@/types/league';

export type LeagueFilters = {
  q: string;
  // * Absent means All
  sport?: string;
};

export function filterLeagues(
  leagues: readonly League[],
  filters: LeagueFilters
): League[] {
  const needle = filters.q.trim().toLowerCase();

  return leagues
    .filter(
      (league) =>
        league.strLeague.toLowerCase().includes(needle) &&
        (filters.sport === undefined || league.strSport === filters.sport)
    )
    .sort((a, b) => compareNames(a.strLeague, b.strLeague));
}

export function listSports(leagues: readonly League[]): string[] {
  return [...new Set(leagues.map((league) => league.strSport))].sort(
    compareNames
  );
}

// * The API lists seasons oldest first, so the last badged one is the most recent
export function pickSeasonBadge(
  seasons: readonly Season[]
): (Season & { strBadge: string }) | null {
  return (
    seasons.findLast(
      (season): season is Season & { strBadge: string } =>
        season.strBadge !== null
    ) ?? null
  );
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}
