import { ofetch } from 'ofetch';

export type FetcherOptions = {
  query?: Record<string, string | number>;
  signal?: AbortSignal;
};

export function fetcher(
  path: string,
  options: FetcherOptions = {}
): Promise<unknown> {
  const { sportsdbBaseUrl, sportsdbApiKey } = useRuntimeConfig().public;

  // ! No `credentials: 'include'` — TheSportsDB answers `Access-Control-Allow-Origin: *`, which browsers reject for credentialed requests
  // ! No CSRF header or CSRF retry — the API is read-only and cookie-free
  return ofetch(path, {
    baseURL: `${sportsdbBaseUrl}/${sportsdbApiKey}`,
    headers: { Accept: 'application/json' },
    retry: 1,
    retryStatusCodes: [500, 502, 503, 504],
    query: options.query,
    signal: options.signal
  });
}
