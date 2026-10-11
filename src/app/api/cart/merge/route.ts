import { fail, ok, readJson } from "@/lib/api"
import { mergeCart } from "@/lib/db/cart"

export async function POST(request: Request) {
  try {
    const body = await readJson<{ items: Array<{ variantId: string; quantity: number }> }>(request)
    return ok({ cart: await mergeCart(body.items ?? []) })
  } catch (error) {
    return fail(error)
  }
}
