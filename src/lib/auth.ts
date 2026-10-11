import "server-only"
import { AppError } from "@/lib/errors"
import { createServerSupabase } from "@/lib/supabase/server"
import { isRole, type Role } from "@/services/access"

export type SessionProfile = {
  id: string
  email: string
  fullName: string
  role: Role
  phone: string | null
  marketingOptIn: boolean
  orderEmails: boolean
  avatarPath: string | null
}

export async function getSession() {
  const supabase = await createServerSupabase()
  if (!supabase) return { supabase: null, user: null, profile: null as SessionProfile | null }
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { supabase, user: null, profile: null as SessionProfile | null }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, phone, marketing_opt_in, order_emails, avatar_path")
    .eq("id", data.user.id)
    .maybeSingle()
  return {
    supabase,
    user: data.user,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: isRole(profile.role) ? profile.role : "customer",
          phone: profile.phone,
          marketingOptIn: profile.marketing_opt_in,
          orderEmails: profile.order_emails,
          avatarPath: profile.avatar_path,
        }
      : null,
  }
}

export async function requireUser() {
  const session = await getSession()
  if (!session.supabase || !session.user || !session.profile) {
    throw new AppError("Sign in to continue.", 401)
  }
  return { supabase: session.supabase, user: session.user, profile: session.profile }
}

export async function requireRole(roles: Role[]) {
  const session = await requireUser()
  if (!roles.includes(session.profile.role)) {
    throw new AppError("Your role does not include this action.", 403)
  }
  return session
}
