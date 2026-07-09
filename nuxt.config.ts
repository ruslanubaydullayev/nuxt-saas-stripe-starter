import vue from '@vitejs/plugin-vue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  devtools: { enabled: true },
  css: ['~/assets/main.css', '~/assets/scss/main.scss'],
  runtimeConfig: {
    AuthSecret: '',
    GoogleClientId: '',
    GoogleClientSecret: '',
    ResendApiKey: '',
    public: {
      SiteUrl: '',
      maxRankingItems: Number(process.env.MAX_RANKING_ITEMS || 10),
      maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 100),
      maxClipDurationSeconds: Number(process.env.MAX_CLIP_DURATION_SECONDS || 60)
    }
  },
  routeRules: {
    '/dashboard/**': { ssr: false },
    '/create': { ssr: false, robots: false }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    rollupConfig: {
      plugins: [vue()]
    },
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },
  auth: {
    baseURL: `${process.env.NUXT_PUBLIC_SITE_URL}/api/auth`,
    provider: {
      type: 'authjs'
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
