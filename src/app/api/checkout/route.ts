import { fail, ok, readJson } from "@/lib/api"
import { placeCheckout, quoteCheckout } from "@/services/checkout"

export async function POST(request: Request) {
  try {
    const body = await readJson<{ quote?: boolean; subtotalCents?: number; couponCode?: string; shippingMethod?: "standard" | "express" }>(request)
    if (body.quote) {
      return ok({ quote: await quoteCheckout({ subtotalCents: body.subtotalCents ?? 0, couponCode: body.couponCode, shippingMethod: body.shippingMethod ?? "standard" }) })
    }
    return ok({ result: await placeCheckout(body) })
  } catch (error) {
    return fail(error)
  }
}
