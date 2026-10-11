import { fail, ok, readJson } from "@/lib/api"
import { callRpc } from "@/lib/db/orders"
import { listInventory } from "@/services/office"

export async function GET() {
  try {
    return ok({ inventory: await listInventory() })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<{ variantId: string; onHand: number; location?: string }>(request)
    return ok({ result: await callRpc("adjust_inventory", { p_variant_id: body.variantId, p_on_hand: body.onHand, p_location: body.location ?? "" }) })
  } catch (error) {
    return fail(error)
  }
}
