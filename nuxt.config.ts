import vue from '@vitejs/plugin-vue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  devtools: { enabled: true },
  css: ['~/assets/main.css', '~/assets/scss/main.scss'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.ytshort.site',
      maxRankingItems: Number(process.env.MAX_RANKING_ITEMS || 10),
      maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 100),
      maxClipDurationSeconds: Number(process.env.MAX_CLIP_DURATION_SECONDS || 60),
      planPriceUsd: Number(process.env.PLAN_PRICE_USD || 9)
    }
  },
  routeRules: {
    '/dashboard/**': { ssr: false },
    '/create': { ssr: false, robots: false },
    // Proxy all API traffic through the frontend domain so users never
    // navigate directly to api.ytshort.site (avoids Safe Browsing warnings).
    '/api/**': {
      proxy: `${process.env.NUXT_PUBLIC_API_BASE || 'https://api.ytshort.site'}/api/**`
    }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    rollupConfig: {
      plugins: [vue()]
    },
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
