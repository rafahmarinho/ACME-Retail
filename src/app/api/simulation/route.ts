import { fail, ok, readJson } from "@/lib/api"
import { callRpc } from "@/lib/db/orders"
import { simulationView } from "@/services/office"
import { requireRole } from "@/lib/auth"
import { runSeed } from "@/lib/seed/run"
import { createAdminSupabase } from "@/lib/supabase/admin"
import { AppError } from "@/lib/errors"

export const maxDuration = 60

export async function GET() {
  try {
    return ok(await simulationView())
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<{ action: string; scenario?: string; confirmation?: string }>(request)
    if (body.action === "scenario") return ok({ result: await callRpc("set_scenario", { p_key: body.scenario }) })
    if (body.action === "advance") return ok({ result: await callRpc("advance_simulation", {}) })
    if (body.action === "reset") {
      await requireRole(["administrator"])
      if (body.confirmation !== "RESET") throw new AppError("Type RESET to restore the demo data.")
      const admin = createAdminSupabase()
      if (!admin) throw new AppError("SUPABASE_SERVICE_ROLE_KEY is required to reset demo data.", 503)
      return ok({ result: await runSeed(admin) })
    }
    return fail(new Error("Unknown simulation action."))
  } catch (error) {
    return fail(error)
  }
}
