import "server-only"
import { z } from "zod"
import { AppError, friendlyDbError } from "@/lib/errors"
import { requireRole } from "@/lib/auth"
import { callRpc } from "@/lib/db/orders"
import { productSelect, mapProduct } from "@/lib/db/map"

const variantSchema = z.object({
  id: z.uuid().optional(),
  sku: z.string().trim().min(3, "Enter a SKU."),
  name: z.string().trim().min(1, "Name the variant."),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  location: z.string().trim().optional().default("A-01"),
  options: z.record(z.string(), z.string()).optional().default({}),
  active: z.boolean().default(true),
})

const productSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Enter a product name."),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/, "Use a lowercase slug."),
  description: z.string().trim().min(8, "Enter a short description."),
  brand: z.string().trim().min(2),
  categorySlug: z.string().trim().min(2),
  status: z.enum(["draft", "active", "archived"]),
  compareAtCents: z.number().int().min(0).nullable().optional(),
  featured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "Add at least one variant."),
})

export async function saveProduct(raw: unknown) {
  const { supabase } = await requireRole(["catalog", "administrator"])
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Check the product form.")
  const input = parsed.data
  const { data: category, error: categoryError } = await supabase.from("categories").select("id").eq("slug", input.categorySlug).maybeSingle()
  if (categoryError || !category) throw new AppError("Choose a category.")
  const basePrice = Math.min(...input.variants.map((variant) => variant.priceCents))
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    brand: input.brand,
    category_id: category.id,
    status: input.status,
    base_price_cents: basePrice,
    compare_at_cents: input.compareAtCents ?? null,
    featured: input.featured,
  }
  const saved = input.id
    ? await supabase.from("products").update(payload).eq("id", input.id).select("id").single()
    : await supabase.from("products").insert(payload).select("id").single()
  if (saved.error || !saved.data) throw new AppError(friendlyDbError(saved.error))
  const productId = saved.data.id
  if (!input.id) {
    await supabase.from("product_images").insert({ product_id: productId, public_path: `/products/${input.slug}.svg`, alt: input.name, sort_order: 0 })
  }
  for (const variant of input.variants) {
    const variantPayload = {
      product_id: productId,
      sku: variant.sku,
      name: variant.name,
      options: variant.options,
      price_cents: variant.priceCents,
      active: variant.active,
    }
    const row = variant.id
      ? await supabase.from("product_variants").update(variantPayload).eq("id", variant.id).select("id").single()
      : await supabase.from("product_variants").insert(variantPayload).select("id").single()
    if (row.error || !row.data) throw new AppError(friendlyDbError(row.error))
    const { data: inventory } = await supabase.from("inventory").select("variant_id").eq("variant_id", row.data.id).maybeSingle()
    if (!inventory) {
      const inserted = await supabase.from("inventory").insert({
        variant_id: row.data.id,
        on_hand: variant.stock ?? 0,
        reserved: 0,
        location: variant.location,
      })
      if (inserted.error) throw new AppError(friendlyDbError(inserted.error))
    } else if (variant.stock !== undefined) {
      await callRpc("adjust_inventory", { p_variant_id: row.data.id, p_on_hand: variant.stock, p_location: variant.location })
    }
  }
  return { id: productId }
}

export async function listOfficeProducts() {
  const { supabase } = await requireRole(["catalog", "administrator", "warehouse"])
  const { data, error } = await supabase.from("products").select(productSelect).order("name")
  if (error) throw new AppError(friendlyDbError(error), 500)
  return (data ?? []).map((row) => mapProduct(row))
}

export async function listInventory() {
  const { supabase } = await requireRole(["catalog", "warehouse", "administrator"])
  const { data, error } = await supabase
    .from("inventory")
    .select("on_hand, reserved, location, reorder_point, product_variants (id, sku, name, product_id, products (name, slug))")
    .order("location")
  if (error) throw new AppError(friendlyDbError(error), 500)
  return (data ?? []).map((row) => {
    const variant = Array.isArray(row.product_variants) ? row.product_variants[0] : row.product_variants
    const product = variant ? (Array.isArray(variant.products) ? variant.products[0] : variant.products) : null
    return {
      variantId: variant?.id,
      sku: variant?.sku,
      variantName: variant?.name,
      productName: product?.name ?? "Product",
      slug: product?.slug ?? "",
      onHand: row.on_hand,
      reserved: row.reserved,
      available: row.on_hand - row.reserved,
      location: row.location,
      reorderPoint: row.reorder_point,
    }
  })
}

export async function salesReport() {
  const { supabase } = await requireRole(["finance", "administrator"])
  const { data, error } = await supabase.from("orders").select("payment_status, fulfillment_status, total_cents, placed_at, refunds (amount_cents, status)")
  if (error) throw new AppError(friendlyDbError(error), 500)
  const orders = data ?? []
  const approved = orders.filter((order) => ["approved", "partially_refunded", "refunded"].includes(order.payment_status))
  const captured = approved.reduce((sum, order) => sum + order.total_cents, 0)
  const refunded = orders.reduce((sum, order) => {
    const refunds = order.refunds ?? []
    return sum + refunds.filter((refund) => refund.status === "completed").reduce((inner, refund) => inner + refund.amount_cents, 0)
  }, 0)
  const byPayment = countBy(orders, "payment_status")
  const byFulfillment = countBy(orders, "fulfillment_status")
  return {
    orderCount: orders.length,
    capturedCents: captured,
    refundedCents: refunded,
    netCents: captured - refunded,
    byPayment,
    byFulfillment,
    note: "Figures are illustrative demo totals. They are not a financial statement.",
  }
}

function countBy(rows: Array<Record<string, unknown>>, key: string) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key])
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

export async function simulationView() {
  const { supabase } = await requireRole(["administrator"])
  const [{ data: state }, { data: scenarios }, { data: events }] = await Promise.all([
    supabase.from("simulation_state").select("scenario_key, simulated_now, ticks").eq("id", 1).single(),
    supabase.from("scenarios").select("key, name, description, default_outcome, delay_shipments, force_timeout, open_returns, suggest_refunds").order("name"),
    supabase.from("domain_events").select("id, event_type, message, payload, created_at, order_id").order("created_at", { ascending: false }).limit(40),
  ])
  return { state, scenarios: scenarios ?? [], events: events ?? [] }
}
