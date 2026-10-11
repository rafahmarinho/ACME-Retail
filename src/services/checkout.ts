import "server-only"
import { z } from "zod"
import { AppError } from "@/lib/errors"
import { clearCart } from "@/lib/db/cart"
import { callRpc, getOrder } from "@/lib/db/orders"
import { quoteCart, type PaymentOutcome, type ShippingMethod } from "@/services/pricing"
import { stripeTestKey } from "@/lib/env"
import { siteUrl } from "@/lib/env"
import { createAdminSupabase } from "@/lib/supabase/admin"

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient name."),
  line1: z.string().trim().min(3, "Enter a street address."),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(2, "Enter a city."),
  region: z.string().trim().min(2, "Enter a state or region."),
  postalCode: z.string().trim().min(3, "Enter a postal code."),
  country: z.string().trim().min(2).default("United States"),
  phone: z.string().trim().optional().default(""),
})

export const checkoutSchema = z.object({
  items: z.array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(10) })).min(1),
  email: z.email("Enter a valid email address."),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethod: z.enum(["standard", "express"]),
  couponCode: z.string().trim().optional().default(""),
  paymentMethod: z.enum(["simulated", "stripe"]).default("simulated"),
  outcome: z.enum(["approved", "declined", "authentication_required", "timeout"]).default("approved"),
})

export async function quoteCheckout(input: { subtotalCents: number; couponCode?: string; shippingMethod: ShippingMethod }) {
  try {
    return quoteCart(input)
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : "The quote could not be calculated.")
  }
}

export async function placeCheckout(raw: unknown) {
  const parsed = checkoutSchema.safeParse(raw)
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Check the checkout form.")
  }
  const input = parsed.data
  if (input.paymentMethod === "stripe") {
    stripeTestKey()
  }
  const placed = await callRpc<{ orderId: string; number: string; totalCents: number }>("place_order", {
    p_items: input.items,
    p_email: input.email,
    p_shipping_address: input.shippingAddress,
    p_billing_address: input.billingAddress ?? input.shippingAddress,
    p_shipping_method: input.shippingMethod,
    p_coupon_code: input.couponCode,
  })

  if (input.paymentMethod === "stripe") {
    const url = await startStripeCheckout(placed.orderId, placed.number)
    return { ...placed, paymentMethod: "stripe" as const, checkoutUrl: url }
  }

  const settled = await callRpc<Record<string, unknown>>("settle_payment", {
    p_order_id: placed.orderId,
    p_outcome: input.outcome satisfies PaymentOutcome,
    p_provider: "simulated",
    p_external_id: null,
  })
  if (settled.paymentStatus === "approved" || input.outcome === "approved") {
    await clearCart()
  }
  return { ...placed, ...settled, paymentMethod: "simulated" as const }
}

export async function settleExisting(orderId: string, outcome: PaymentOutcome) {
  const settled = await callRpc<Record<string, unknown>>("settle_payment", {
    p_order_id: orderId,
    p_outcome: outcome,
    p_provider: "simulated",
    p_external_id: null,
  })
  if (outcome === "approved") await clearCart()
  return settled
}

async function startStripeCheckout(orderId: string, number: string) {
  const key = stripeTestKey()
  if (!key) throw new AppError("Stripe Checkout is optional and only available with a test secret key.")
  const order = await getOrder(orderId)
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(key)
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl()}/payment/result?order=${orderId}&provider=stripe`,
    cancel_url: `${siteUrl()}/payment/result?order=${orderId}&provider=stripe&cancelled=1`,
    customer_email: order.email,
    metadata: { orderId, number },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: order.total_cents,
          product_data: { name: `ACME Retail order ${number}` },
        },
      },
    ],
  })
  const admin = createAdminSupabase()
  if (admin) {
    await admin.from("payments").insert({
      order_id: orderId,
      provider: "stripe",
      status: "pending",
      amount_cents: order.total_cents,
      scenario: null,
      external_id: session.id,
      message: "Stripe test Checkout session created. No live charge will be made.",
    })
  }
  if (!session.url) throw new AppError("Stripe did not return a Checkout URL.")
  return session.url
}

export async function confirmStripe(orderId: string) {
  const key = stripeTestKey()
  if (!key) throw new AppError("Stripe test mode is not configured.")
  const admin = createAdminSupabase()
  if (!admin) throw new AppError("The service role key is required to confirm Stripe test payments.", 503)
  const { data: payment } = await admin
    .from("payments")
    .select("external_id")
    .eq("order_id", orderId)
    .eq("provider", "stripe")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!payment?.external_id) throw new AppError("No Stripe test session is attached to this order.")
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(key)
  const session = await stripe.checkout.sessions.retrieve(payment.external_id)
  if (session.payment_status !== "paid") {
    return { waiting: true, message: "Stripe has not confirmed this test payment yet." }
  }
  const { data, error } = await admin.rpc("settle_payment", {
    p_order_id: orderId,
    p_outcome: "approved",
    p_provider: "stripe",
    p_external_id: session.id,
  })
  if (error) throw new AppError(error.message)
  await clearCart()
  return data
}
