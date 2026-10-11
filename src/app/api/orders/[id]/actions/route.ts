import { fail, ok, readJson } from "@/lib/api"
import { callRpc } from "@/lib/db/orders"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await readJson<{ action: string; reason?: string; carrier?: string; items?: unknown; amountCents?: number; refundId?: string; returnId?: string; decision?: string; shipmentId?: string }>(request)
    if (body.action === "cancel") return ok({ result: await callRpc("cancel_order", { p_order_id: id, p_reason: body.reason ?? "" }) })
    if (body.action === "advance") return ok({ result: await callRpc("advance_shipment", { p_shipment_id: body.shipmentId }) })
    if (body.action === "pick") return ok({ result: await callRpc("mark_picking", { p_order_id: id }) })
    if (body.action === "ship") return ok({ result: await callRpc("create_shipment", { p_order_id: id, p_carrier: body.carrier ?? "Northline Parcel" }) })
    if (body.action === "return") return ok({ result: await callRpc("request_return", { p_order_id: id, p_items: body.items ?? [], p_reason: body.reason ?? "" }) })
    if (body.action === "review-return") return ok({ result: await callRpc("review_return", { p_return_id: body.returnId, p_decision: body.decision }) })
    if (body.action === "refund") {
      return ok({
        result: await callRpc("issue_refund", {
          p_order_id: id,
          p_amount_cents: body.amountCents ?? null,
          p_reason: body.reason ?? "",
          p_return_id: body.returnId ?? null,
          p_refund_id: body.refundId ?? null,
        }),
      })
    }
    return fail(new Error("Unknown order action."))
  } catch (error) {
    return fail(error)
  }
}
