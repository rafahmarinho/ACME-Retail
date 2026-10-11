import { fail, ok, readJson } from "@/lib/api"
import { addCartItem, getCart, setCartCoupon, updateCartItem } from "@/lib/db/cart"

export async function GET() {
  try {
    return ok({ cart: await getCart() })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<{ variantId: string; quantity?: number; couponCode?: string; remove?: boolean }>(request)
    if (body.couponCode !== undefined) return ok({ cart: await setCartCoupon(body.couponCode || null) })
    if (!body.variantId) return ok({ cart: await getCart() })
    if (body.remove || body.quantity === 0) return ok({ cart: await updateCartItem(body.variantId, 0) })
    if (body.quantity && body.quantity > 0 && request.headers.get("x-acme-update") === "1") {
      return ok({ cart: await updateCartItem(body.variantId, body.quantity) })
    }
    return ok({ cart: await addCartItem(body.variantId, body.quantity ?? 1) })
  } catch (error) {
    return fail(error)
  }
}
