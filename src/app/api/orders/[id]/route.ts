import { fail, ok } from "@/lib/api"
import { getOrder } from "@/lib/db/orders"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    return ok({ order: await getOrder(id) })
  } catch (error) {
    return fail(error)
  }
}
