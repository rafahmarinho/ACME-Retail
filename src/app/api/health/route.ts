import { ok } from "@/lib/api"
import { publicEnv, stripeEnabled } from "@/lib/env"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const env = publicEnv()
  if (!env) return ok({ configured: false, database: "unconfigured", stripe: false })
  const supabase = await createServerSupabase()
  const { error } = await supabase!.from("categories").select("slug").limit(1)
  return ok({ configured: true, database: error ? "error" : "ok", message: error?.message, stripe: stripeEnabled() })
}
