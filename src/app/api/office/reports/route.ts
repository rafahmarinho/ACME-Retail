import { fail, ok } from "@/lib/api"
import { salesReport } from "@/services/office"

export async function GET() {
  try {
    return ok({ report: await salesReport() })
  } catch (error) {
    return fail(error)
  }
}
