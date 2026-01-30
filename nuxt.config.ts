export default defineNuxtConfig({
  compatibilityDate: '2026-01-30',
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: '/api' 
    }
  },
  app: {
    head: {
      title: 'Mantis AI Chat',
      bodyAttrs: {
        class: 'bg-mantis-dark text-mantis-light'
      }
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})