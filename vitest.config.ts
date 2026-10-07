import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        // * jsdom, not the default happy-dom: happy-dom replaces the Fetch API globals, and a happy-dom `Headers` handed to Node's `fetch` loses every header before MSW sees it
        domEnvironment: 'jsdom'
      }
    },
    include: ['app/**/*.test.ts']
  }
});
