export default defineNuxtConfig({
  css: ['@/assets/styles/main.css'],

  modules: ['@nuxt/ui'],

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

  compatibilityDate: '2026-06-30'
});
