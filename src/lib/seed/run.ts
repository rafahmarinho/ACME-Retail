import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { categories } from "@/data/categories"
import { coupons, products, scenarios } from "@/data/catalog"
import { demoAccounts, demoPassword } from "@/services/access"
import { buildDemoDataset } from "@/lib/seed/build-demo"

type Admin = SupabaseClient

export async function runSeed(admin?: Admin) {
  const client = admin ?? createSeedClient()
  const dataset = buildDemoDataset()
  const users = await ensureUsers(client)
  await client.from("domain_events").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await client.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await client.from("cart_items").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await client.from("wishlists").delete().neq("user_id", "00000000-0000-0000-0000-000000000000")
  await client.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await client.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await client.from("coupons").delete().neq("code", "")

  const categoryIds = new Map<string, string>()
  for (const [index, category] of categories.entries()) {
    const { data, error } = await client.from("categories").insert({ slug: category.slug, name: category.name, blurb: category.blurb, sort_order: index }).select("id, slug").single()
    if (error || !data) throw new Error(error?.message ?? "Could not insert categories.")
    categoryIds.set(category.slug, data.id)
  }

  const { error: couponError } = await client.from("coupons").insert(coupons.map((coupon) => ({
    code: coupon.code,
    kind: coupon.kind,
    value: coupon.value,
    min_subtotal_cents: coupon.minSubtotalCents,
    label: coupon.label,
    active: true,
  })))
  if (couponError) throw new Error(couponError.message)

  const variantIds = new Map<string, string>()
  for (const product of products) {
    const { data, error } = await client.from("products").insert({
      slug: product.slug,
      name: product.name,
      description: product.description,
      brand: product.brand,
      category_id: categoryIds.get(product.category),
      status: "active",
      base_price_cents: product.priceCents,
      compare_at_cents: product.compareAtCents,
      featured: product.featured,
    }).select("id").single()
    if (error || !data) throw new Error(error?.message ?? `Could not insert ${product.name}.`)
    await client.from("product_images").insert({
      product_id: data.id,
      public_path: `/products/${product.slug}.svg`,
      alt: product.name,
      sort_order: 0,
    })
    for (const variant of product.variants) {
      const inserted = await client.from("product_variants").insert({
        product_id: data.id,
        sku: variant.sku,
        name: variant.name,
        options: variant.options,
        price_cents: variant.priceCents,
        active: true,
      }).select("id").single()
      if (inserted.error || !inserted.data) throw new Error(inserted.error?.message ?? variant.sku)
      variantIds.set(variant.sku, inserted.data.id)
      const stock = dataset.stock.find((row) => row.sku === variant.sku)
      const inventory = await client.from("inventory").insert({
        variant_id: inserted.data.id,
        on_hand: stock?.onHand ?? variant.stock,
        reserved: stock?.reserved ?? 0,
        location: stock?.location ?? "A-01",
        reorder_point: 4,
      })
      if (inventory.error) throw new Error(inventory.error.message)
    }
    await uploadArt(client, product.slug)
  }

  for (const order of dataset.orders) {
    const userId = users.get(order.email)
    if (!userId) throw new Error(`Missing demo customer ${order.email}`)
    const { data, error } = await client.from("orders").insert({
      number: order.number,
      user_id: userId,
      email: order.email,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      subtotal_cents: order.subtotalCents,
      discount_cents: order.discountCents,
      shipping_cents: order.shippingCents,
      tax_cents: order.taxCents,
      total_cents: order.totalCents,
      coupon_code: order.couponCode,
      shipping_method: order.shippingMethod,
      shipping_address: order.address,
      billing_address: order.address,
      placed_at: order.placedAt,
    }).select("id").single()
    if (error || !data) throw new Error(error?.message ?? order.number)
    const itemIds = new Map<string, string>()
    for (const item of order.items) {
      const inserted = await client.from("order_items").insert({
        order_id: data.id,
        variant_id: variantIds.get(item.sku),
        sku: item.sku,
        name: item.name,
        variant_name: item.variantName,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        line_total_cents: item.unitPriceCents * item.quantity,
        options: {},
      }).select("id, sku").single()
      if (inserted.error || !inserted.data) throw new Error(inserted.error?.message ?? item.sku)
      itemIds.set(item.sku, inserted.data.id)
    }
    await client.from("payments").insert({
      order_id: data.id,
      provider: "simulated",
      status: order.paymentStatus,
      amount_cents: order.totalCents,
      scenario: paymentScenario(order.paymentStatus),
      message: order.paymentMessage,
      created_at: order.placedAt,
    })
    if (order.fulfillmentStatus === "reserved" || order.fulfillmentStatus === "picking" || order.paymentStatus === "pending" || order.paymentStatus === "requires_authentication") {
      for (const item of order.items) {
        const variantId = variantIds.get(item.sku)
        if (!variantId) continue
        await client.from("stock_reservations").insert({
          order_id: data.id,
          variant_id: variantId,
          quantity: item.quantity,
          purpose: order.paymentStatus === "approved" ? "fulfillment" : "checkout",
          expires_at: order.paymentStatus === "approved" ? null : new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        })
      }
    }
    if (order.shipment) {
      const shipment = await client.from("shipments").insert({
        order_id: data.id,
        carrier: order.shipment.carrier,
        tracking_number: order.shipment.trackingNumber,
        status: order.shipment.status,
        shipped_at: order.placedAt,
        delivered_at: order.shipment.status === "delivered" ? order.placedAt : null,
      }).select("id").single()
      if (shipment.error || !shipment.data) throw new Error(shipment.error?.message ?? "shipment")
      await client.from("shipment_events").insert(order.shipment.events.map((event) => ({
        shipment_id: shipment.data.id,
        status: event.status,
        message: event.message,
        occurred_at: new Date(new Date(order.placedAt).getTime() + event.hoursAfter * 3600 * 1000).toISOString(),
      })))
    }
    for (const entry of order.returns) {
      const created = await client.from("returns").insert({
        order_id: data.id,
        user_id: userId,
        status: entry.status,
        reason: entry.reason,
        created_at: order.placedAt,
      }).select("id").single()
      if (created.error || !created.data) throw new Error(created.error?.message ?? "return")
      await client.from("return_items").insert(entry.skus.map((sku) => ({
        return_id: created.data.id,
        order_item_id: itemIds.get(sku),
        quantity: 1,
      })))
    }
    if (order.refunds.length) {
      await client.from("refunds").insert(order.refunds.map((refund) => ({
        order_id: data.id,
        amount_cents: refund.amountCents,
        kind: refund.kind,
        status: refund.status,
        reason: refund.reason,
        created_by: userId,
        created_at: order.placedAt,
        completed_at: refund.status === "completed" ? order.placedAt : null,
      })))
    }
    await client.from("domain_events").insert({
      order_id: data.id,
      event_type: "order.seeded",
      message: `Demo order ${order.number} loaded.`,
      payload: { paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus },
      created_at: order.placedAt,
    })
  }

  await client.from("addresses").delete().in("user_id", [...users.values()])
  for (const customer of ["customer@acme-retail.example", "jordan@acme-retail.example"]) {
    const sample = dataset.orders.find((order) => order.email === customer)
    if (!sample) continue
    await client.from("addresses").insert({
      user_id: users.get(customer),
      ...snakeAddress(sample.address),
      is_default: true,
    })
  }

  await client.from("domain_events").insert({
    event_type: "simulation.reset",
    message: "Demo catalog and orders were reset.",
    payload: { products: products.length, orders: dataset.orders.length, scenarios: scenarios.length },
  })

  return { products: products.length, orders: dataset.orders.length, users: users.size }
}

function createSeedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.")
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function ensureUsers(client: Admin) {
  const wanted = [
    ...demoAccounts.map((account) => ({ email: account.email, fullName: account.name, role: account.role })),
    { email: "jordan@acme-retail.example", fullName: "Jordan Lee", role: "customer" as const },
  ]
  const existing = new Map<string, string>()
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(error.message)
    for (const user of data.users) {
      if (user.email) existing.set(user.email, user.id)
    }
    if (data.users.length < 200) break
  }
  const ids = new Map<string, string>()
  for (const account of wanted) {
    let id = existing.get(account.email)
    if (!id) {
      const created = await client.auth.admin.createUser({
        email: account.email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { full_name: account.fullName },
      })
      if (created.error || !created.data.user) throw new Error(created.error?.message ?? account.email)
      id = created.data.user.id
    } else {
      await client.auth.admin.updateUserById(id, { password: demoPassword, email_confirm: true, user_metadata: { full_name: account.fullName } })
    }
    const { error } = await client.from("profiles").upsert({
      id,
      email: account.email,
      full_name: account.fullName,
      role: account.role,
    })
    if (error) throw new Error(error.message)
    ids.set(account.email, id)
  }
  return ids
}

function snakeAddress(address: Record<string, string>) {
  return {
    full_name: address.fullName,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postal_code: address.postalCode,
    country: address.country,
    phone: "",
  }
}

function paymentScenario(status: string) {
  if (status === "requires_authentication") return "authentication_required"
  if (status === "timed_out") return "timeout"
  if (status === "declined") return "declined"
  if (status === "approved" || status === "partially_refunded" || status === "refunded") return "approved"
  return null
}

async function uploadArt(client: Admin, slug: string) {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "products", `${slug}.svg`))
    await client.storage.from("product-media").upload(`products/${slug}.svg`, file, {
      contentType: "image/svg+xml",
      upsert: true,
    })
    const { data: product } = await client.from("products").select("id").eq("slug", slug).maybeSingle()
    if (product) {
      await client.from("product_images").update({ storage_path: `products/${slug}.svg` }).eq("product_id", product.id)
    }
  } catch {
    // Local artwork is still served from /products when storage is unavailable.
  }
}
