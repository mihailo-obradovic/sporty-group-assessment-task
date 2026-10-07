export default defineNuxtConfig({
  css: ['@/assets/styles/main.css'],

  runtimeConfig: {
    public: {
      sportsdbBaseUrl: 'https://www.thesportsdb.com/api/v1/json',
      sportsdbApiKey: '3',
      leagueSource: 'live'
    }
  },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/colada-nuxt'],

  ui: {
    // * Dark only (annexes/design-system.md): no colour-mode script, no stored preference; app.vue pins `class="dark"`
    colorMode: false
  },

  fonts: {
    families: [
      { name: 'Barlow', provider: 'google', weights: [400, 500, 600] },
      {
        name: 'Barlow Condensed',
        provider: 'google',
        weights: [700, 800],
        styles: ['normal', 'italic']
      }
    ],
    defaults: { subsets: ['latin', 'latin-ext'] }
  },

  ssr: false,
  typescript: {
    tsConfig: {
      compilerOptions: {
        strict: true,
        noUncheckedIndexedAccess: true,
        verbatimModuleSyntax: true,
        noImplicitOverride: true
      }
    }
  },
  devtools: {
    enabled: true
  },

  compatibilityDate: '2026-06-30'
});
