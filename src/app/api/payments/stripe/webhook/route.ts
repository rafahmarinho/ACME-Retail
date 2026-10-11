import { NextResponse } from "next/server"
import { createAdminSupabase } from "@/lib/supabase/admin"
import { stripeTestKey } from "@/lib/env"

export async function POST(request: Request) {
  const key = stripeTestKey()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !secret) return NextResponse.json({ error: "Stripe test webhook is not configured." }, { status: 400 })
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(key)
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 })
  const event = stripe.webhooks.constructEvent(body, signature, secret)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const orderId = session.metadata?.orderId
    if (orderId && session.payment_status === "paid") {
      const admin = createAdminSupabase()
      if (admin) {
        await admin.rpc("settle_payment", {
          p_order_id: orderId,
          p_outcome: "approved",
          p_provider: "stripe",
          p_external_id: session.id,
        })
      }
    }
  }
  return NextResponse.json({ received: true })
}
