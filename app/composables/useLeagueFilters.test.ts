import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function visit(query: Record<string, string | string[]>): Promise<void> {
  await useRouter().replace({ path: '/', query });
}

describe('useLeagueFilters', () => {
  let configuredSource: string;

  beforeEach(async () => {
    configuredSource = useRuntimeConfig().public.leagueSource;
    await visit({});
  });

  afterEach(() => {
    useRuntimeConfig().public.leagueSource = configuredSource;
    vi.restoreAllMocks();
  });

  it('defaults to no search, All Sports, and the configured source', () => {
    const { filters } = useLeagueFilters();

    expect(filters.value).toEqual({ q: '', sport: undefined, source: 'live' });
  });

  it('reads the filters from the URL query', async () => {
    await visit({ q: 'nba', sport: 'Basketball', source: 'fixture' });

    expect(useLeagueFilters().filters.value).toEqual({
      q: 'nba',
      sport: 'Basketball',
      source: 'fixture'
    });
  });

  it('keeps a Sport absent from the data', async () => {
    await visit({ sport: 'Curling' });

    expect(useLeagueFilters().filters.value.sport).toBe('Curling');
  });

  it('falls back to the defaults for invalid or repeated values', async () => {
    await visit({ q: ['a', 'b'], sport: '', source: 'bogus' });

    expect(useLeagueFilters().filters.value).toEqual({
      q: '',
      sport: undefined,
      source: 'live'
    });
  });

  it('falls back to the configured source, whichever it is', async () => {
    useRuntimeConfig().public.leagueSource = 'fixture';
    await visit({ source: 'bogus' });

    expect(useLeagueFilters().filters.value.source).toBe('fixture');
  });

  it('writes the search and the Sport by replacing the history entry, never pushing', async () => {
    const router = useRouter();
    const push = vi.spyOn(router, 'push');
    const replace = vi.spyOn(router, 'replace');
    const { filters, setQuery, setSport } = useLeagueFilters();

    await setQuery('nba');
    await setSport('Basketball');

    expect(filters.value).toMatchObject({ q: 'nba', sport: 'Basketball' });
    expect(replace).toHaveBeenCalledTimes(2);
    expect(push).not.toHaveBeenCalled();
  });

  it('drops an empty search and All from the URL', async () => {
    await visit({ q: 'nba', sport: 'Basketball' });
    const { setQuery, setSport } = useLeagueFilters();

    await setQuery('');
    await setSport(undefined);

    expect(useRoute().query).toEqual({});
  });

  it('keeps the search and clears the Sport on a source switch', async () => {
    await visit({ q: 'league', sport: 'Soccer' });
    const { setSource } = useLeagueFilters();

    await setSource('fixture');

    expect(useRoute().query).toEqual({ q: 'league', source: 'fixture' });
  });

  it('clears the search and the Sport but keeps the source', async () => {
    await visit({ q: 'nba', sport: 'Basketball', source: 'fixture' });
    const { clearFilters } = useLeagueFilters();

    await clearFilters();

    expect(useRoute().query).toEqual({ source: 'fixture' });
  });
});
