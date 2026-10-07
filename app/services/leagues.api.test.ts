import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { fetchAllLeagues, fetchSeasons } from '@/services/leagues.api';
import { mswServer } from '@/testing/mswServer';
import { ResponseShapeError } from '@/utils/parseResponse';

import type { JsonBodyType } from 'msw';

function apiUrl(path: string): string {
  const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;

  return `${sportsdbBaseUrl}/${sportsdbApiKey}/${path}`;
}

function respondWith(path: string, body: JsonBodyType): void {
  mswServer.use(http.get(apiUrl(path), () => HttpResponse.json(body)));
}

describe('fetchAllLeagues', () => {
  it('returns the Leagues, a missing, null, or empty Alternate name as blank', async () => {
    respondWith('all_leagues.php', {
      leagues: [
        {
          idLeague: '4328',
          strLeague: 'English Premier League',
          strSport: 'Soccer'
        },
        {
          idLeague: '4387',
          strLeague: 'NBA',
          strSport: 'Basketball',
          strLeagueAlternate: 'National Basketball Association'
        },
        {
          idLeague: '4380',
          strLeague: 'NHL',
          strSport: 'Ice Hockey',
          strLeagueAlternate: null
        },
        {
          idLeague: '4414',
          strLeague: 'English Premiership Rugby',
          strSport: 'Rugby',
          strLeagueAlternate: ''
        }
      ]
    });

    const leagues = await fetchAllLeagues();

    expect(leagues.map((league) => league.strLeagueAlternate)).toEqual([
      '',
      'National Basketball Association',
      '',
      ''
    ]);
  });

  it('returns no Leagues for `leagues: null`', async () => {
    respondWith('all_leagues.php', { leagues: null });

    await expect(fetchAllLeagues()).resolves.toEqual([]);
  });

  it('rejects a League missing its Sport with a ResponseShapeError', async () => {
    respondWith('all_leagues.php', {
      leagues: [{ idLeague: '4328', strLeague: 'English Premier League' }]
    });

    await expect(fetchAllLeagues()).rejects.toBeInstanceOf(ResponseShapeError);
  });
});

describe('fetchSeasons', () => {
  it('requests the badged seasons of one League', async () => {
    let requestedId: string | null = null;

    mswServer.use(
      http.get(apiUrl('search_all_seasons.php'), ({ request }) => {
        const query = new URL(request.url).searchParams;
        requestedId = query.get('badge') === '1' ? query.get('id') : null;

        return HttpResponse.json({
          seasons: [
            { strSeason: '1892-1893', strBadge: null },
            {
              strSeason: '1893-1894',
              strBadge: 'https://example.test/1893.png'
            }
          ]
        });
      })
    );

    await expect(fetchSeasons('4328')).resolves.toEqual([
      { strSeason: '1892-1893', strBadge: null },
      { strSeason: '1893-1894', strBadge: 'https://example.test/1893.png' }
    ]);
    expect(requestedId).toBe('4328');
  });

  it('returns no seasons for `seasons: null` (an unknown id)', async () => {
    respondWith('search_all_seasons.php', { seasons: null });

    await expect(fetchSeasons('999999')).resolves.toEqual([]);
  });

  it('rejects a string `seasons` with a ResponseShapeError', async () => {
    respondWith('search_all_seasons.php', {
      seasons: 'Invalid League ID passed'
    });

    await expect(fetchSeasons('abc')).rejects.toBeInstanceOf(
      ResponseShapeError
    );
  });
});
