import { fail, ok } from "@/lib/api"
import { getProduct } from "@/lib/db/catalog"

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    return ok({ product: await getProduct(slug) })
  } catch (error) {
    return fail(error)
  }
}
