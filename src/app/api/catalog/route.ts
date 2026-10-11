import { fail, ok } from "@/lib/api"
import { listCatalog, listCategories } from "@/lib/db/catalog"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const min = url.searchParams.get("min")
    const max = url.searchParams.get("max")
    const [catalog, categories] = await Promise.all([
      listCatalog({
        q: url.searchParams.get("q") ?? undefined,
        category: url.searchParams.get("category") ?? undefined,
        brand: url.searchParams.get("brand") ?? undefined,
        min: min ? Number(min) * 100 : undefined,
        max: max ? Number(max) * 100 : undefined,
        inStock: url.searchParams.get("inStock") === "1",
        sort: url.searchParams.get("sort") ?? "featured",
        page: Number(url.searchParams.get("page") ?? 1),
        pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
        featured: url.searchParams.get("featured") === "1",
      }),
      listCategories(),
    ])
    return ok({ ...catalog, categories })
  } catch (error) {
    return fail(error)
  }
}
