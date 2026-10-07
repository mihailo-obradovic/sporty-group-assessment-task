import { FetchError } from 'ofetch';
import { describe, expect, it, vi } from 'vitest';

import { ResponseShapeError } from '@/utils/parseResponse';

const URL_WITH_KEY =
  'https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id=4335';

// * Shaped the way ofetch builds it: the message carries the method, the URL (API key included), and the status
function fetchError(status: number | undefined, body: unknown): FetchError {
  const error = new FetchError(`[GET] "${URL_WITH_KEY}": ${status ?? ''}`);
  error.status = status;
  error.statusCode = status;
  error.data = body;

  return error;
}

function toastFor(error: unknown): string | undefined {
  const showToast = vi.fn<(message: string) => void>();

  handleApiError(error, { showToast });

  return showToast.mock.calls[0]?.[0];
}

describe('handleApiError', () => {
  it('toasts a rate limit in user terms, never the request line or the plain-text body', () => {
    const message = toastFor(fetchError(429, 'error code: 1015'));

    expect(message).toBe(
      'TheSportsDB is rate limiting requests. Try again in a minute.'
    );
    expect(message).not.toContain('thesportsdb.com/api');
    expect(message).not.toContain('1015');
  });

  it('toasts the generic message for any other failed request', () => {
    expect(toastFor(fetchError(503, '<html>Service Unavailable</html>'))).toBe(
      'Something went wrong. Please try again.'
    );
    expect(toastFor(fetchError(undefined, undefined))).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('toasts a shape failure with its own user-facing message', () => {
    expect(
      toastFor(new ResponseShapeError('Unexpected response from the server.'))
    ).toBe('Unexpected response from the server.');
  });

  it('toasts each error once', () => {
    const showToast = vi.fn<(message: string) => void>();
    const error = fetchError(429, 'error code: 1015');

    handleApiError(error, { showToast });
    handleApiError(error, { showToast });

    expect(showToast).toHaveBeenCalledTimes(1);
  });
});
