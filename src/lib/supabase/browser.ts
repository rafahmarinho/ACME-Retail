import { createBrowserClient } from "@supabase/ssr"
import { publicEnv } from "@/lib/env"

export function createBrowserSupabase() {
  const env = publicEnv()
  if (!env) return null
  return createBrowserClient(env.url, env.anonKey)
}
