import { fail, ok } from "@/lib/api"
import { getSession } from "@/lib/auth"
import { stripeEnabled } from "@/lib/env"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  try {
    const session = await getSession()
    const supabase = session.supabase ?? (await createServerSupabase())
    let scenario = null
    if (supabase) {
      const { data } = await supabase.from("simulation_state").select("scenario_key, scenarios (name, default_outcome, description)").eq("id", 1).maybeSingle()
      scenario = data
    }
    return ok({ user: session.user ? { id: session.user.id, email: session.user.email } : null, profile: session.profile, scenario, stripe: stripeEnabled() })
  } catch (error) {
    return fail(error)
  }
}
