import { FetchError } from 'ofetch';

import type { ErrorContext, ErrorHandling } from '@/types/api';

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const handledErrors = new WeakSet<object>();

// * The app's whole policy: the API is public and read-only, so there is no 401, 403, or 422 path — every failure is one toast beside the query's own error state
export function handleApiError(
  error: unknown,
  context: ErrorContext,
  options: ErrorHandling = {}
): void {
  if (typeof error !== 'object' || error === null) {
    return;
  }
  if (isAbort(error) || handledErrors.has(error)) {
    return;
  }
  handledErrors.add(error);

  if (options.suppressToasts === 'all') {
    return;
  }
  context.showToast(readMessage(error));
}

function isAbort(error: object): boolean {
  return (
    error instanceof FetchError &&
    error.cause instanceof DOMException &&
    error.cause.name === 'AbortError'
  );
}

function readMessage(error: object): string {
  if (error instanceof FetchError) {
    const apiMessage: unknown = error.data?.message;

    if (typeof apiMessage === 'string' && apiMessage !== '') {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message !== '') {
    return error.message;
  }

  return GENERIC_MESSAGE;
}
