import { fail, ok } from "@/lib/api"
import { listOrders } from "@/lib/db/orders"

export async function GET(request: Request) {
  try {
    const scope = new URL(request.url).searchParams.get("scope") === "all" ? "all" : "mine"
    return ok({ orders: await listOrders(scope) })
  } catch (error) {
    return fail(error)
  }
}
