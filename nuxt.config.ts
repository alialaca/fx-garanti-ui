// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts'
  },

  runtimeConfig: {
    warrantyServiceUrl: process.env.WARRANTY_SERVICE_URL || 'http://localhost:3001',
    public: {
      apiBase: '/api/v1/public'
    }
  },

  nitro: {},

  app: {
    head: {
      title: 'Garanti Yönetim Sistemi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Cihaz garanti kayıt ve sorgulama sistemi' }
      ]
    }
  },
})
