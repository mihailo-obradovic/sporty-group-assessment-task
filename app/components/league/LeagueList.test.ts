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

// * Counts seasons lookups per League id, answering each with `respond(id)`
function serveSeasons(respond: (idLeague: string) => Response) {
  const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;
  const requests: string[] = [];

  mswServer.use(
    http.get(
      `${sportsdbBaseUrl}/${sportsdbApiKey}/search_all_seasons.php`,
      ({ request }) => {
        const idLeague = new URL(request.url).searchParams.get('id') ?? '';
        requests.push(idLeague);

        return respond(idLeague);
      }
    )
  );

  return requests;
}

const BADGED_SEASONS = {
  seasons: [
    { strSeason: '2019-2020', strBadge: 'https://example.test/2019.png' },
    { strSeason: '2020-2021', strBadge: 'https://example.test/2020.png' },
    { strSeason: '2021-2022', strBadge: null }
  ]
};

function cardToggle(name: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(name) });
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

  it('reveals the most recent badged season on expand, and collapses on a second click', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    serveSeasons(() => HttpResponse.json(BADGED_SEASONS));
    await renderPage();
    await findLeagueNames();

    const toggle = cardToggle('English Premier League');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    await fireEvent.click(toggle);

    const badge = await screen.findByRole('img', {
      name: 'English Premier League badge, 2020-2021'
    });
    expect(badge.getAttribute('src')).toBe('https://example.test/2020.png');
    expect(screen.getByText('2020-2021')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    await fireEvent.click(toggle);

    expect(screen.queryByRole('img')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the cached badge on re-expanding, without a second request', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    const requests = serveSeasons(() => HttpResponse.json(BADGED_SEASONS));
    await renderPage();
    await findLeagueNames();
    const toggle = cardToggle('English Premier League');

    await fireEvent.click(toggle);
    await screen.findByRole('img');
    await fireEvent.click(toggle);
    await fireEvent.click(toggle);

    expect(screen.getByRole('img')).toBeTruthy();
    expect(requests).toEqual(['4328']);
  });

  it('keeps several cards open at once', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    serveSeasons(() => HttpResponse.json(BADGED_SEASONS));
    await renderPage();
    await findLeagueNames();

    await fireEvent.click(cardToggle('English Premier League'));
    await fireEvent.click(cardToggle('German Bundesliga'));

    await vi.waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2));
  });

  it('says there is no badge when no season has one', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    serveSeasons(() =>
      HttpResponse.json({
        seasons: [{ strSeason: '1892-1893', strBadge: null }]
      })
    );
    await renderPage();
    await findLeagueNames();

    await fireEvent.click(cardToggle('English League Championship'));

    expect(await screen.findByText('No badge for this League')).toBeTruthy();
  });

  it('says the image could not load when the badge fails, without a toast-worthy error', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    serveSeasons(() => HttpResponse.json(BADGED_SEASONS));
    await renderPage();
    await findLeagueNames();

    await fireEvent.click(cardToggle('English Premier League'));
    await fireEvent.error(await screen.findByRole('img'));

    expect(screen.getByText('No badge for this League')).toBeTruthy();
    expect(screen.getByText('The image could not load.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('shows an in-card error with Retry when the lookup fails, leaving other cards alone', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    let fail = true;
    const requests = serveSeasons((idLeague) =>
      fail && idLeague === '4328'
        ? new HttpResponse('error code: 1015', {
            status: 429,
            headers: { 'Content-Type': 'text/plain' }
          })
        : HttpResponse.json(BADGED_SEASONS)
    );
    await renderPage();
    await findLeagueNames();

    await fireEvent.click(cardToggle('English Premier League'));
    await fireEvent.click(cardToggle('German Bundesliga'));

    expect(
      await screen.findByText('Could not load the season badge')
    ).toBeTruthy();
    expect(
      await screen.findByRole('img', { name: /German Bundesliga badge/ })
    ).toBeTruthy();

    fail = false;
    await fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(
      await screen.findByRole('img', { name: /English Premier League badge/ })
    ).toBeTruthy();
    expect(requests.filter((id) => id === '4328')).toHaveLength(2);
  });
});

describe('Fixture banner', () => {
  afterEach(() => {
    cleanup();
    const queryCache = useQueryCache();

    for (const entry of queryCache.getEntries()) {
      queryCache.remove(entry);
    }
  });

  it('is absent on the live list', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    await renderPage();
    await findLeagueNames();

    expect(screen.queryByText('Sample data')).toBeNull();
  });

  it('shows with the fixture list and switches to live, keeping the search and clearing the Sport', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    await renderPage({ source: 'fixture', q: 'league', sport: 'Rugby' });

    expect(await screen.findByText('Sample data')).toBeTruthy();

    await fireEvent.click(
      screen.getByRole('button', { name: 'Show the live list' })
    );

    await vi.waitFor(() =>
      expect(useRoute().query).toEqual({ q: 'league', source: 'live' })
    );
    expect(screen.queryByText('Sample data')).toBeNull();
  });

  it('marks the active source and switches with the toggle, keeping the search and clearing the Sport', async () => {
    serveLeaguesJson(LIVE_LEAGUES);
    await renderPage({ q: 'league', sport: 'Soccer' });
    await findLeagueNames();

    const live = screen.getByRole('button', { name: 'Live' });
    const sample = screen.getByRole('button', { name: 'Sample' });
    expect(live.getAttribute('aria-pressed')).toBe('true');
    expect(sample.getAttribute('aria-pressed')).toBe('false');

    await fireEvent.click(sample);

    await vi.waitFor(() =>
      expect(useRoute().query).toEqual({ q: 'league', source: 'fixture' })
    );
    expect(await screen.findByText('Sample data')).toBeTruthy();
    expect(sample.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('Result count', () => {
  afterEach(() => {
    cleanup();
    const queryCache = useQueryCache();

    for (const entry of queryCache.getEntries()) {
      queryCache.remove(entry);
    }
  });

  it('counts every fixture League with no filters', async () => {
    await renderPage({ source: 'fixture' });
    await findLeagueNames();

    expect(screen.getByRole('status').textContent).toMatch(
      /^\s*19\s*leagues\s*$/
    );
  });

  it('counts what the filters leave', async () => {
    await renderPage({ source: 'fixture', sport: 'Basketball', q: 'nba' });
    await findLeagueNames();

    expect(screen.getByRole('status').textContent).toMatch(
      /^\s*2\s*leagues\s*$/
    );
  });
});
