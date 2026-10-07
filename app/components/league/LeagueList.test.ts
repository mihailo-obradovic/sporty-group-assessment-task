import { renderSuspended } from '@nuxt/test-utils/runtime';
import { useQueryCache } from '@pinia/colada';
import { cleanup, fireEvent, screen, within } from '@testing-library/vue';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import IndexPage from '@/pages/index.vue';
import { mswServer } from '@/testing/mswServer';

import type { JsonBodyType } from 'msw';

const LIVE_LEAGUES = {
  leagues: [
    {
      idLeague: '4329',
      strLeague: 'English League Championship',
      strSport: 'Soccer'
    },
    {
      idLeague: '4328',
      strLeague: 'English Premier League',
      strSport: 'Soccer'
    },
    { idLeague: '4331', strLeague: 'German Bundesliga', strSport: 'Soccer' }
  ]
};

function serveLeagues(respond: () => Response) {
  const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;
  const counter = { requests: 0 };

  mswServer.use(
    http.get(`${sportsdbBaseUrl}/${sportsdbApiKey}/all_leagues.php`, () => {
      counter.requests += 1;

      return respond();
    })
  );

  return counter;
}

function serveLeaguesJson(body: JsonBodyType) {
  return serveLeagues(() => HttpResponse.json(body));
}

async function renderPage(query: Record<string, string> = {}) {
  // * renderSuspended navigates to its own `route` (default `/`), so the query goes through it
  await renderSuspended(IndexPage, { route: { path: '/', query } });
}

async function findLeagueNames(): Promise<string[]> {
  const list = await screen.findByRole('list', { name: 'Leagues' });

  return within(list)
    .getAllByRole('heading')
    .map((heading) => heading.textContent?.trim() ?? '');
}

describe('League list page', () => {
  afterEach(() => {
    // * Vitest globals are off, so Testing Library does not unmount on its own; a page left mounted would refetch into the next test
    cleanup();
    const queryCache = useQueryCache();

    for (const entry of queryCache.getEntries()) {
      queryCache.remove(entry);
    }
  });

  it('lists the live Leagues sorted by name, with Sport and no blank Alternate name', async () => {
    serveLeaguesJson(LIVE_LEAGUES);

    await renderPage();

    expect(await findLeagueNames()).toEqual([
      'English League Championship',
      'English Premier League',
      'German Bundesliga'
    ]);
    expect(screen.getAllByText('Soccer').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/null|undefined/)).toBeNull();
  });

  it('shows only the fixture Leagues whose name contains the search, any case', async () => {
    await renderPage({ source: 'fixture', q: 'LEAGUE' });

    const names = await findLeagueNames();

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain('league');
    }
    expect(names).not.toContain('Formula 1');
  });

  it('combines the Sport and the search', async () => {
    await renderPage({ source: 'fixture', sport: 'Basketball', q: 'nba' });

    expect(await findLeagueNames()).toEqual(['NBA', 'NBA G League']);
    expect(screen.getByText('National Basketball Association')).toBeTruthy();
  });

  it('keeps an unknown Sport selected and offers Clear filters, which restores the list', async () => {
    serveLeaguesJson(LIVE_LEAGUES);

    await renderPage({ sport: 'Basketball', q: 'english' });

    expect(
      await screen.findByText('No leagues match these filters')
    ).toBeTruthy();
    expect(
      screen.getByRole('combobox', { name: 'Filter by Sport' }).textContent
    ).toContain('Basketball');

    await fireEvent.click(
      screen.getByRole('button', { name: 'Clear filters' })
    );

    await vi.waitFor(() => expect(useRoute().query).toEqual({}));
    expect(await findLeagueNames()).toHaveLength(3);
  });

  it('says no leagues are available, without Clear filters, for `leagues: null`', async () => {
    serveLeaguesJson({ leagues: null });

    await renderPage({ q: 'x' });

    expect(await screen.findByText('No leagues available')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull();
  });

  it('writes the search to the URL after a pause in typing', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    await renderPage();
    await findLeagueNames();

    await fireEvent.update(
      screen.getByRole('searchbox', { name: 'Search leagues by name' }),
      'german'
    );

    expect(useRoute().query.q).toBeUndefined();
    await vi.waitFor(() => expect(useRoute().query.q).toBe('german'));
    expect(await findLeagueNames()).toEqual(['German Bundesliga']);
  });

  it('shows an error with Retry, which refetches', async () => {
    let fail = true;
    const counter = serveLeagues(() =>
      fail
        ? new HttpResponse('error code: 1015', {
            status: 429,
            headers: { 'Content-Type': 'text/plain' }
          })
        : HttpResponse.json(LIVE_LEAGUES)
    );

    await renderPage();

    expect(await screen.findByText('Could not load the leagues')).toBeTruthy();
    expect(screen.queryByText(/1015/)).toBeNull();

    fail = false;
    await fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await findLeagueNames()).toHaveLength(3);
    expect(counter.requests).toBe(2);
  });
});
