import { products } from "@/data/catalog"
import { quoteCart, type PaymentStatus, type ShippingMethod } from "@/services/pricing"

export type DemoCustomer = {
  email: string
  fullName: string
  role: "customer"
}

export const demoCustomers: DemoCustomer[] = [
  { email: "customer@acme-retail.example", fullName: "Avery Chen", role: "customer" },
  { email: "jordan@acme-retail.example", fullName: "Jordan Lee", role: "customer" },
]

type Plan =
  | "delivered"
  | "shipped"
  | "picking"
  | "reserved"
  | "pending"
  | "auth"
  | "declined"
  | "timeout"
  | "cancelled"
  | "return_requested"
  | "returned"

const plan: Plan[] = [
  ...Array<Plan>(18).fill("delivered"),
  ...Array<Plan>(10).fill("shipped"),
  ...Array<Plan>(6).fill("picking"),
  ...Array<Plan>(4).fill("reserved"),
  ...Array<Plan>(4).fill("pending"),
  ...Array<Plan>(3).fill("auth"),
  ...Array<Plan>(4).fill("declined"),
  ...Array<Plan>(3).fill("timeout"),
  ...Array<Plan>(3).fill("cancelled"),
  ...Array<Plan>(3).fill("return_requested"),
  ...Array<Plan>(2).fill("returned"),
]

export type DemoOrderItem = {
  sku: string
  name: string
  variantName: string
  quantity: number
  unitPriceCents: number
}

export type DemoShipmentEvent = {
  status: string
  message: string
  hoursAfter: number
}

export type DemoOrder = {
  number: string
  email: string
  placedAt: string
  paymentStatus: PaymentStatus
  fulfillmentStatus: string
  shippingMethod: ShippingMethod
  couponCode: string | null
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  address: Record<string, string>
  items: DemoOrderItem[]
  shipment: null | {
    carrier: string
    trackingNumber: string
    status: string
    events: DemoShipmentEvent[]
  }
  returns: Array<{ reason: string; status: string; skus: string[] }>
  refunds: Array<{ amountCents: number; status: string; kind: string; reason: string }>
  paymentMessage: string
}

export type StockRow = { sku: string; onHand: number; reserved: number; location: string }

function rng(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function address(name: string, index: number) {
  const streets = ["18 Cedar Lane", "402 Market Street", "77 Willow Court", "9 Harbor Road"]
  const cities = [
    ["Portland", "OR", "97205"],
    ["Austin", "TX", "78702"],
    ["Madison", "WI", "53703"],
    ["Burlington", "VT", "05401"],
  ] as const
  const city = cities[index % cities.length]
  return {
    fullName: name,
    line1: streets[index % streets.length],
    line2: index % 2 === 0 ? "Apt 2" : "",
    city: city[0],
    region: city[1],
    postalCode: city[2],
    country: "United States",
  }
}

export function buildDemoDataset(now = new Date("2026-10-01T15:00:00.000Z")) {
  if (products.length !== 40) {
    throw new Error(`Expected 40 products, found ${products.length}.`)
  }
  if (plan.length !== 60) {
    throw new Error(`Expected 60 orders, found ${plan.length}.`)
  }

  const stock = new Map<string, StockRow>()
  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      sku: variant.sku,
      name: `${product.name}`,
      variantName: variant.name,
      priceCents: variant.priceCents,
      stock: variant.stock,
      location: product.category === "apparel" || product.category === "footwear" ? "A-12" : "B-04",
    })),
  )
  for (const variant of variants) {
    stock.set(variant.sku, { sku: variant.sku, onHand: variant.stock, reserved: 0, location: variant.location })
  }

  const random = rng(20261011)
  const orders: DemoOrder[] = []

  plan.forEach((kind, index) => {
    const customer = demoCustomers[index < 48 ? 0 : 1]
    const itemCount = 1 + Math.floor(random() * 3)
    const items: DemoOrderItem[] = []
    const mode = stockMode(kind)
    const seen = new Set<string>()

    for (let attempt = 0; attempt < 24 && items.length < itemCount; attempt += 1) {
      const variant = variants[Math.floor(random() * variants.length)]
      if (seen.has(variant.sku)) continue
      seen.add(variant.sku)
      const row = stock.get(variant.sku)!
      const quantity = 1
      if (mode !== "none") {
        if (row.onHand - row.reserved < quantity) continue
        if (mode === "sell") row.onHand -= quantity
        if (mode === "reserve") row.reserved += quantity
      }
      items.push({ sku: variant.sku, name: variant.name, variantName: variant.variantName, quantity, unitPriceCents: variant.priceCents })
    }
    if (!items.length) {
      const fallback = variants[index % variants.length]
      items.push({
        sku: fallback.sku,
        name: fallback.name,
        variantName: fallback.variantName,
        quantity: 1,
        unitPriceCents: fallback.priceCents,
      })
    }

    const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)
    const couponCode = index % 5 === 0 ? "WELCOME10" : index % 7 === 0 ? "FREESHIP" : null
    const shippingMethod: ShippingMethod = index % 4 === 0 ? "express" : "standard"
    const quote = quoteCart({ subtotalCents, couponCode, shippingMethod })
    const placed = new Date(now.getTime() - (58 - index) * 24 * 60 * 60 * 1000 - index * 60 * 60 * 1000)
    const mapped = mapPlan(kind, index)
    const tracking = `ACME${String(100000 + index)}`
    const shipment = mapped.shipmentStatus
      ? {
          carrier: index % 2 === 0 ? "Northline Parcel" : "Harbor Post",
          trackingNumber: tracking,
          status: mapped.shipmentStatus,
          events: shipmentEvents(mapped.shipmentStatus),
        }
      : null

    orders.push({
      number: `AC${String(10001 + index)}`,
      email: customer.email,
      placedAt: placed.toISOString(),
      paymentStatus: mapped.paymentStatus,
      fulfillmentStatus: mapped.fulfillmentStatus,
      shippingMethod,
      couponCode: quote.couponCode,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      shippingCents: quote.shippingCents,
      taxCents: quote.taxCents,
      totalCents: quote.totalCents,
      address: address(customer.fullName, index),
      items,
      shipment,
      returns: mapped.returnStatus
        ? [{ reason: "Changed my mind after delivery.", status: mapped.returnStatus, skus: [items[0].sku] }]
        : [],
      refunds: mapped.refund
        ? [mapped.refund.amountCents === -1 ? { ...mapped.refund, amountCents: quote.totalCents } : mapped.refund]
        : index < 3 && kind === "delivered" && quote.totalCents > 2000
          ? [{ amountCents: Math.min(1500, quote.totalCents - 500), status: "completed", kind: "partial", reason: "Goodwill price adjustment." }]
          : [],
      paymentMessage: mapped.message,
    })
  })

  for (const order of orders) {
    if (order.paymentStatus === "partially_refunded") continue
    const completed = order.refunds.filter((refund) => refund.status === "completed").reduce((sum, refund) => sum + refund.amountCents, 0)
    if (completed > 0 && completed < order.totalCents && order.paymentStatus === "approved") {
      order.paymentStatus = "partially_refunded"
    }
  }

  return {
    orders,
    stock: [...stock.values()],
    generatedAt: now.toISOString(),
  }
}

function stockMode(kind: Plan): "sell" | "reserve" | "none" {
  if (kind === "delivered" || kind === "shipped" || kind === "return_requested") return "sell"
  if (kind === "picking" || kind === "reserved" || kind === "pending" || kind === "auth") return "reserve"
  return "none"
}

function mapPlan(kind: Plan, index: number) {
  switch (kind) {
    case "delivered":
      return { paymentStatus: "approved" as const, fulfillmentStatus: "delivered", shipmentStatus: "delivered", returnStatus: null, refund: null, message: "Simulated payment approved. The price was saved with the order." }
    case "shipped":
      return { paymentStatus: "approved" as const, fulfillmentStatus: "shipped", shipmentStatus: "in_transit", returnStatus: null, refund: null, message: "Simulated payment approved." }
    case "picking":
      return { paymentStatus: "approved" as const, fulfillmentStatus: "picking", shipmentStatus: null, returnStatus: null, refund: null, message: "Simulated payment approved. Waiting in the warehouse." }
    case "reserved":
      return { paymentStatus: "approved" as const, fulfillmentStatus: "reserved", shipmentStatus: null, returnStatus: null, refund: null, message: "Simulated payment approved. Stock is reserved." }
    case "pending":
      return { paymentStatus: "pending" as const, fulfillmentStatus: "reserved", shipmentStatus: null, returnStatus: null, refund: null, message: "Payment is still pending. Stock is held for a short time." }
    case "auth":
      return { paymentStatus: "requires_authentication" as const, fulfillmentStatus: "reserved", shipmentStatus: null, returnStatus: null, refund: null, message: "The simulated bank asked for an extra authentication step." }
    case "declined":
      return { paymentStatus: "declined" as const, fulfillmentStatus: "unfulfilled", shipmentStatus: null, returnStatus: null, refund: null, message: "The simulated card was declined. No charge was made." }
    case "timeout":
      return { paymentStatus: "timed_out" as const, fulfillmentStatus: "unfulfilled", shipmentStatus: null, returnStatus: null, refund: null, message: "The simulated gateway timed out. No charge was made." }
    case "cancelled":
      return index % 2 === 0
        ? { paymentStatus: "refunded" as const, fulfillmentStatus: "cancelled", shipmentStatus: null, returnStatus: null, refund: { amountCents: -1, status: "completed", kind: "full", reason: "Cancelled before it shipped." }, message: "Order cancelled and fully refunded in the simulation." }
        : { paymentStatus: "declined" as const, fulfillmentStatus: "cancelled", shipmentStatus: null, returnStatus: null, refund: null, message: "Order cancelled before payment completed." }
    case "return_requested":
      return { paymentStatus: "approved" as const, fulfillmentStatus: "return_requested", shipmentStatus: "delivered", returnStatus: "requested", refund: null, message: "Simulated payment approved." }
    case "returned":
      return { paymentStatus: "refunded" as const, fulfillmentStatus: "returned", shipmentStatus: "delivered", returnStatus: "received", refund: { amountCents: -1, status: "completed", kind: "full", reason: "Return received." }, message: "Return received and fully refunded in the simulation." }
  }
}

function shipmentEvents(status: string): DemoShipmentEvent[] {
  const steps = [
    { status: "label_created", message: "Shipping label created.", hoursAfter: 6 },
    { status: "in_transit", message: "Parcel accepted by the carrier.", hoursAfter: 20 },
    { status: "out_for_delivery", message: "Out for delivery.", hoursAfter: 46 },
    { status: "delivered", message: "Delivered. Signed for at the door.", hoursAfter: 52 },
  ]
  const end = steps.findIndex((step) => step.status === status)
  return steps.slice(0, end + 1)
}

export function assertDemoInvariants(dataset = buildDemoDataset()) {
  const problems: string[] = []
  if (dataset.orders.length !== 60) problems.push("order count")
  if (products.length !== 40) problems.push("product count")
  for (const row of dataset.stock) {
    if (row.onHand < 0 || row.reserved < 0 || row.reserved > row.onHand) {
      problems.push(`stock ${row.sku}`)
    }
  }
  for (const order of dataset.orders) {
    const expected = order.subtotalCents - order.discountCents + order.shippingCents + order.taxCents
    if (expected !== order.totalCents) problems.push(`total ${order.number}`)
    if (!order.items.length) problems.push(`items ${order.number}`)
  }
  return problems
}
