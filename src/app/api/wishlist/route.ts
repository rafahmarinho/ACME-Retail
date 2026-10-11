import { fail, ok, readJson } from "@/lib/api"
import { requireUser } from "@/lib/auth"
import { AppError, friendlyDbError } from "@/lib/errors"

export async function GET() {
  try {
    const { supabase, profile } = await requireUser()
    const { data, error } = await supabase.from("wishlists").select("product_id, created_at").eq("user_id", profile.id)
    if (error) throw new AppError(friendlyDbError(error), 500)
    return ok({ items: data ?? [] })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, profile } = await requireUser()
    const body = await readJson<{ productId: string; remove?: boolean }>(request)
    const query = supabase.from("wishlists")
    const result = body.remove
      ? await query.delete().eq("user_id", profile.id).eq("product_id", body.productId)
      : await query.insert({ user_id: profile.id, product_id: body.productId })
    if (result.error && !result.error.message.includes("duplicate")) throw new AppError(friendlyDbError(result.error))
    return ok({ saved: true })
  } catch (error) {
    return fail(error)
  }
}
