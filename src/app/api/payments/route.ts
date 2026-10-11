import { fail, ok, readJson } from "@/lib/api"
import { confirmStripe, settleExisting } from "@/services/checkout"
import type { PaymentOutcome } from "@/services/pricing"

export async function POST(request: Request) {
  try {
    const body = await readJson<{ orderId: string; outcome?: PaymentOutcome; provider?: string }>(request)
    if (body.provider === "stripe") return ok({ result: await confirmStripe(body.orderId) })
    return ok({ result: await settleExisting(body.orderId, body.outcome ?? "approved") })
  } catch (error) {
    return fail(error)
  }
}
