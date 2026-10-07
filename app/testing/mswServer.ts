import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

// ! The lifecycle lives here, not in a Vitest `setupFiles` entry: under the Nuxt environment a setup file loads in its own module graph, so it would start a different server from the one a test adds handlers to
export const mswServer = setupServer();

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
