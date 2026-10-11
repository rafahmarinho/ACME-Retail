import { fail, ok, readJson } from "@/lib/api"
import { listOfficeProducts, saveProduct } from "@/services/office"

export async function GET() {
  try {
    return ok({ products: await listOfficeProducts() })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    return ok({ product: await saveProduct(await readJson(request)) })
  } catch (error) {
    return fail(error)
  }
}
