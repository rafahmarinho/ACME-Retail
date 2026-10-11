import "server-only"
import { AppError, friendlyDbError } from "@/lib/errors"
import { requireUser } from "@/lib/auth"
import { isStaff } from "@/services/access"

const orderSelect = `
  id, number, email, payment_status, fulfillment_status, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
  coupon_code, shipping_method, shipping_address, billing_address, placed_at, user_id,
  order_items (id, sku, name, variant_name, quantity, unit_price_cents, line_total_cents, options),
  payments (id, provider, status, amount_cents, scenario, message, external_id, created_at),
  shipments (id, carrier, tracking_number, status, shipped_at, delivered_at, shipment_events (id, status, message, occurred_at)),
  returns (id, status, reason, created_at, return_items (id, quantity, order_item_id)),
  refunds (id, amount_cents, kind, status, reason, created_at, completed_at)
`

export async function listOrders(scope: "mine" | "all" = "mine") {
  const { supabase, profile } = await requireUser()
  let query = supabase.from("orders").select(orderSelect).order("placed_at", { ascending: false })
  if (scope === "mine" || !isStaff(profile.role)) query = query.eq("user_id", profile.id)
  const { data, error } = await query.limit(200)
  if (error) throw new AppError(friendlyDbError(error), 500)
  return data ?? []
}

export async function getOrder(id: string) {
  const { supabase, profile } = await requireUser()
  const { data, error } = await supabase.from("orders").select(orderSelect).eq("id", id).maybeSingle()
  if (error) throw new AppError(friendlyDbError(error), 500)
  if (!data) throw new AppError("Order not found.", 404)
  if (data.user_id !== profile.id && !isStaff(profile.role)) throw new AppError("Order not found.", 404)
  return data
}

export async function callRpc<T>(name: string, args: Record<string, unknown>) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new AppError(friendlyDbError(error))
  return data as T
}
