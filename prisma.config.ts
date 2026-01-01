import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Use direct connection for migrations (falls back to DATABASE_URL if not set)
// This allows migrations to use a direct connection while the app uses a pooled connection
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL_DIRECT') || env('DATABASE_URL'),
  },
})

