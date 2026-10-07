import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { mswServer } from '@/testing/mswServer';

describe('fetcher', () => {
  it('requests the path under the configured base URL and API key, as JSON', async () => {
    const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;
    let acceptHeader: string | null = null;

    mswServer.use(
      http.get(
        `${sportsdbBaseUrl}/${sportsdbApiKey}/all_leagues.php`,
        ({ request }) => {
          acceptHeader = request.headers.get('accept');

          return HttpResponse.json({ leagues: [] });
        }
      )
    );

    await expect(fetcher('all_leagues.php')).resolves.toEqual({ leagues: [] });
    expect(acceptHeader).toBe('application/json');
  });
});
