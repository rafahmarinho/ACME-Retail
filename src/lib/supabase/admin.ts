import "server-only"
import { createClient } from "@supabase/supabase-js"
import { publicEnv } from "@/lib/env"

export function createAdminSupabase() {
  const env = publicEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!env || !serviceKey) return null
  return createClient(env.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
