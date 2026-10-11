import { fail, ok } from "@/lib/api"
import { requireRole } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { createAdminSupabase } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { supabase } = await requireRole(["catalog", "administrator"])
    const form = await request.formData()
    const file = form.get("file")
    const productId = String(form.get("productId") ?? "")
    if (!(file instanceof File) || !productId) throw new AppError("Choose an image and a product.")
    if (file.size > 5_000_000) throw new AppError("Images must be 5 MB or smaller.")
    const admin = createAdminSupabase()
    if (!admin) throw new AppError("SUPABASE_SERVICE_ROLE_KEY is required for file uploads.", 503)
    const path = `products/${productId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`
    const uploaded = await admin.storage.from("product-media").upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" })
    if (uploaded.error) throw new AppError(uploaded.error.message)
    const { error } = await supabase.from("product_images").insert({ product_id: productId, storage_path: path, public_path: `/products/placeholder.svg`, alt: file.name, sort_order: 1 })
    if (error) throw new AppError(error.message)
    return ok({ path })
  } catch (error) {
    return fail(error)
  }
}
