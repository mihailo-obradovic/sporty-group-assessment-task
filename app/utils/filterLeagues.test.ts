import { describe, expect, it } from 'vitest';

import type { League, Season } from '@/types/league';

function league(strLeague: string, strSport = 'Soccer'): League {
  return {
    idLeague: strLeague,
    strLeague,
    strSport,
    strLeagueAlternate: ''
  };
}

function names(leagues: League[]): string[] {
  return leagues.map((item) => item.strLeague);
}

const LEAGUES = [
  league('spanish La Liga'),
  league('NBA', 'Basketball'),
  league('English Premier League'),
  league('Euroleague Basketball', 'Basketball'),
  league('NHL', 'Ice Hockey')
];

describe('filterLeagues', () => {
  it('sorts by name, case-insensitive, with no filters', () => {
    expect(names(filterLeagues(LEAGUES, { q: '' }))).toEqual([
      'English Premier League',
      'Euroleague Basketball',
      'NBA',
      'NHL',
      'spanish La Liga'
    ]);
  });

  it('matches a trimmed, case-insensitive substring of the name', () => {
    expect(names(filterLeagues(LEAGUES, { q: '  LEAGUE ' }))).toEqual([
      'English Premier League',
      'Euroleague Basketball'
    ]);
  });

  it('keeps only the chosen Sport', () => {
    expect(
      names(filterLeagues(LEAGUES, { q: '', sport: 'Basketball' }))
    ).toEqual(['Euroleague Basketball', 'NBA']);
  });

  it('combines search and Sport with AND', () => {
    expect(
      names(filterLeagues(LEAGUES, { q: 'nba', sport: 'Basketball' }))
    ).toEqual(['NBA']);
    expect(
      names(filterLeagues(LEAGUES, { q: 'nba', sport: 'Soccer' }))
    ).toEqual([]);
  });

  it('matches nothing for a Sport absent from the data', () => {
    expect(filterLeagues(LEAGUES, { q: '', sport: 'Curling' })).toEqual([]);
  });

  it('leaves the input array in its original order', () => {
    const input = [...LEAGUES];

    filterLeagues(input, { q: '' });

    expect(input).toEqual(LEAGUES);
  });
});

describe('listSports', () => {
  it('returns the distinct Sports, sorted', () => {
    expect(listSports(LEAGUES)).toEqual(['Basketball', 'Ice Hockey', 'Soccer']);
  });

  it('returns no Sports for no Leagues', () => {
    expect(listSports([])).toEqual([]);
  });
});

describe('pickSeasonBadge', () => {
  function season(strSeason: string, strBadge: string | null): Season {
    return { strSeason, strBadge };
  }

  it('picks the most recent season that has a badge (the API lists oldest first)', () => {
    expect(
      pickSeasonBadge([
        season('2019-2020', 'https://example.test/2019.png'),
        season('2020-2021', 'https://example.test/2020.png'),
        season('2021-2022', null)
      ])
    ).toEqual(season('2020-2021', 'https://example.test/2020.png'));
  });

  it('returns null when no season has a badge', () => {
    expect(
      pickSeasonBadge([season('1892-1893', null), season('1893-1894', null)])
    ).toBeNull();
  });

  it('returns null for no seasons', () => {
    expect(pickSeasonBadge([])).toBeNull();
  });
});
