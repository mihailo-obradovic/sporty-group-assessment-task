export default defineNuxtConfig({
  css: ['@/assets/styles/main.css'],

  runtimeConfig: {
    public: {
      sportsdbBaseUrl: 'https://www.thesportsdb.com/api/v1/json',
      sportsdbApiKey: '3'
    }
  },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/colada-nuxt'],

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
