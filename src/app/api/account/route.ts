import { z } from "zod"
import { fail, ok, readJson } from "@/lib/api"
import { requireUser } from "@/lib/auth"
import { AppError, friendlyDbError } from "@/lib/errors"

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().optional().default(""),
  marketingOptIn: z.boolean(),
  orderEmails: z.boolean(),
  address: z.object({
    fullName: z.string().trim().min(2),
    line1: z.string().trim().min(3),
    line2: z.string().trim().optional().default(""),
    city: z.string().trim().min(2),
    region: z.string().trim().min(2),
    postalCode: z.string().trim().min(3),
    country: z.string().trim().min(2),
  }).optional(),
})

export async function GET() {
  try {
    const { supabase, profile } = await requireUser()
    const { data: address } = await supabase.from("addresses").select("*").eq("user_id", profile.id).eq("is_default", true).maybeSingle()
    return ok({ profile, address })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, profile } = await requireUser()
    const parsed = schema.safeParse(await readJson(request))
    if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Check your profile.")
    const { error } = await supabase.from("profiles").update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      marketing_opt_in: parsed.data.marketingOptIn,
      order_emails: parsed.data.orderEmails,
    }).eq("id", profile.id)
    if (error) throw new AppError(friendlyDbError(error))
    if (parsed.data.address) {
      const address = parsed.data.address
      const row = {
        user_id: profile.id,
        full_name: address.fullName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        region: address.region,
        postal_code: address.postalCode,
        country: address.country,
        is_default: true,
      }
      const { data: existing } = await supabase.from("addresses").select("id").eq("user_id", profile.id).eq("is_default", true).maybeSingle()
      const saved = existing
        ? await supabase.from("addresses").update(row).eq("id", existing.id)
        : await supabase.from("addresses").insert(row)
      if (saved.error) throw new AppError(friendlyDbError(saved.error))
    }
    return ok({ saved: true })
  } catch (error) {
    return fail(error)
  }
}
