/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_DISABLE_APPLE_MUSIC: string
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_SPOTIFY_CLIENT_SECRET: string
  readonly VITE_SPOTIFY_REDIRECT_URI: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}