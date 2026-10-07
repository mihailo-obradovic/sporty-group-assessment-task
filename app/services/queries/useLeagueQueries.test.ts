import { mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryCache } from '@pinia/colada';
import { http, HttpResponse } from 'msw';
import { FetchError } from 'ofetch';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useLeaguesQuery,
  useSeasonBadgeQuery
} from '@/services/queries/useLeagueQueries';
import { mswServer } from '@/testing/mswServer';
import { ResponseShapeError } from '@/utils/parseResponse';

import type { LeagueSource } from '@/types/league';

function apiUrl(path: string): string {
  const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;

  return `${sportsdbBaseUrl}/${sportsdbApiKey}/${path}`;
}

// * Counts requests to one endpoint, answering each with `respond()`
function serve(path: string, respond: () => Response) {
  const counter = { requests: 0 };

  mswServer.use(
    http.get(apiUrl(path), () => {
      counter.requests += 1;

      return respond();
    })
  );

  return counter;
}

async function mountLeagues(source: LeagueSource) {
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        return { query: useLeaguesQuery(ref(source)) };
      },
      render: () => null
    })
  );

  return { wrapper, query: wrapper.vm.query };
}

async function mountBadge(idLeague: string) {
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        return { query: useSeasonBadgeQuery(ref(idLeague)) };
      },
      render: () => null
    })
  );

  return { wrapper, query: wrapper.vm.query };
}

describe('useLeagueQueries', () => {
  afterEach(() => {
    vi.useRealTimers();
    const queryCache = useQueryCache();

    for (const entry of queryCache.getEntries()) {
      queryCache.remove(entry);
    }
  });

  it('requests all Leagues once across remounts, however long the page stays open', async () => {
    const counter = serve('all_leagues.php', () =>
      HttpResponse.json({
        leagues: [
          {
            idLeague: '4328',
            strLeague: 'English Premier League',
            strSport: 'Soccer'
          }
        ]
      })
    );

    const first = await mountLeagues('live');
    await vi.waitFor(() => expect(first.query.data.value).toHaveLength(1));

    // * An hour passes with nothing mounted: past the default staleTime (5 s) and gcTime (5 min)
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    first.wrapper.unmount();
    vi.advanceTimersByTime(60 * 60 * 1000);

    const second = await mountLeagues('live');
    vi.useRealTimers();
    expect(second.query.data.value).toHaveLength(1);
    expect(counter.requests).toBe(1);
  });

  it('serves the fixture list without an all-leagues request', async () => {
    // * No handler: onUnhandledRequest 'error' fails the test on any request
    const { query } = await mountLeagues('fixture');

    await vi.waitFor(() => expect(query.data.value).toHaveLength(19));
    expect(new Set(query.data.value?.map((league) => league.strSport))).toEqual(
      new Set(['Soccer', 'Basketball', 'Ice Hockey', 'Rugby', 'Motorsport'])
    );
  });

  it('looks up a League’s seasons once, whichever source listed it', async () => {
    const counter = serve('search_all_seasons.php', () =>
      HttpResponse.json({
        seasons: [
          { strSeason: '2020-2021', strBadge: 'https://example.test/2020.png' },
          { strSeason: '2021-2022', strBadge: null }
        ]
      })
    );

    const first = await mountBadge('4328');
    await vi.waitFor(() =>
      expect(first.query.data.value).toEqual({
        strSeason: '2020-2021',
        strBadge: 'https://example.test/2020.png'
      })
    );
    first.wrapper.unmount();

    const second = await mountBadge('4328');
    expect(second.query.data.value?.strSeason).toBe('2020-2021');
    expect(counter.requests).toBe(1);
  });

  it('answers no badge when no season has one', async () => {
    serve('search_all_seasons.php', () =>
      HttpResponse.json({
        seasons: [{ strSeason: '1892-1893', strBadge: null }]
      })
    );

    const { query } = await mountBadge('4329');

    await vi.waitFor(() => expect(query.status.value).toBe('success'));
    expect(query.data.value).toBeNull();
  });

  it('does not look up seasons while disabled', async () => {
    // * No handler: a request would fail the test
    const wrapper = await mountSuspended(
      defineComponent({
        setup() {
          return {
            query: useSeasonBadgeQuery(ref('4328'), { enabled: false })
          };
        },
        render: () => null
      })
    );

    expect(wrapper.vm.query.status.value).toBe('pending');
    expect(wrapper.vm.query.asyncStatus.value).toBe('idle');
  });

  it('surfaces a string `seasons` as a shape error', async () => {
    serve('search_all_seasons.php', () =>
      HttpResponse.json({ seasons: 'Invalid League ID passed' })
    );

    const { query } = await mountBadge('abc');

    await vi.waitFor(() =>
      expect(query.error.value).toBeInstanceOf(ResponseShapeError)
    );
  });

  it('surfaces a plain-text 429 as an error, without retrying', async () => {
    const counter = serve(
      'search_all_seasons.php',
      () =>
        new HttpResponse('error code: 1015', {
          status: 429,
          headers: { 'Content-Type': 'text/plain' }
        })
    );

    const { query } = await mountBadge('4328');

    await vi.waitFor(() =>
      expect(query.error.value).toBeInstanceOf(FetchError)
    );
    expect((query.error.value as FetchError).statusCode).toBe(429);
    expect(counter.requests).toBe(1);
  });
});
