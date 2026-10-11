import "server-only"
import { AppError, friendlyDbError } from "@/lib/errors"
import { requireUser } from "@/lib/auth"
import { availableUnits } from "@/services/pricing"

async function ensureCart(userId: string) {
  const { supabase } = await requireUser()
  const { data: existing } = await supabase.from("carts").select("id, coupon_code").eq("user_id", userId).maybeSingle()
  if (existing) return existing
  const { data, error } = await supabase.from("carts").insert({ user_id: userId }).select("id, coupon_code").single()
  if (error || !data) throw new AppError(friendlyDbError(error), 500)
  return data
}

export async function getCart() {
  const { supabase, profile } = await requireUser()
  const cart = await ensureCart(profile.id)
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, variant_id, product_variants (id, sku, name, price_cents, product_id, products (name, slug), inventory (on_hand, reserved))")
    .eq("cart_id", cart.id)
  if (error) throw new AppError(friendlyDbError(error), 500)
  const items = (data ?? []).map((row) => {
    const variant = Array.isArray(row.product_variants) ? row.product_variants[0] : row.product_variants
    const product = variant ? (Array.isArray(variant.products) ? variant.products[0] : variant.products) : null
    const inventory = variant ? (Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory) : null
    return {
      id: row.id,
      variantId: row.variant_id,
      quantity: row.quantity,
      sku: variant?.sku ?? "",
      name: product?.name ?? "Product",
      slug: product?.slug ?? "",
      variantName: variant?.name ?? "",
      unitPriceCents: variant?.price_cents ?? 0,
      available: availableUnits(inventory?.on_hand ?? 0, inventory?.reserved ?? 0),
    }
  })
  return {
    id: cart.id,
    couponCode: cart.coupon_code,
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
  }
}

export async function addCartItem(variantId: string, quantity: number) {
  const { supabase, profile } = await requireUser()
  const cart = await ensureCart(profile.id)
  const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("cart_id", cart.id).eq("variant_id", variantId).maybeSingle()
  const next = Math.min(10, (existing?.quantity ?? 0) + quantity)
  if (next < 1) throw new AppError("Quantity must be at least 1.")
  const { error } = existing
    ? await supabase.from("cart_items").update({ quantity: next }).eq("id", existing.id)
    : await supabase.from("cart_items").insert({ cart_id: cart.id, variant_id: variantId, quantity: next })
  if (error) throw new AppError(friendlyDbError(error), 500)
  return getCart()
}

export async function updateCartItem(variantId: string, quantity: number) {
  const { supabase, profile } = await requireUser()
  const cart = await ensureCart(profile.id)
  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("cart_id", cart.id).eq("variant_id", variantId)
  } else {
    const { error } = await supabase.from("cart_items").update({ quantity: Math.min(10, quantity) }).eq("cart_id", cart.id).eq("variant_id", variantId)
    if (error) throw new AppError(friendlyDbError(error), 500)
  }
  return getCart()
}

export async function setCartCoupon(couponCode: string | null) {
  const { supabase, profile } = await requireUser()
  const cart = await ensureCart(profile.id)
  const { error } = await supabase.from("carts").update({ coupon_code: couponCode }).eq("id", cart.id)
  if (error) throw new AppError(friendlyDbError(error), 500)
  return getCart()
}

export async function mergeCart(items: Array<{ variantId: string; quantity: number }>) {
  for (const item of items) {
    if (item.variantId && item.quantity > 0) await addCartItem(item.variantId, item.quantity)
  }
  return getCart()
}

export async function clearCart() {
  const { supabase, profile } = await requireUser()
  const cart = await ensureCart(profile.id)
  await supabase.from("cart_items").delete().eq("cart_id", cart.id)
  await supabase.from("carts").update({ coupon_code: null }).eq("id", cart.id)
}
