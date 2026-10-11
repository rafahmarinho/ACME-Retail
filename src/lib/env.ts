export function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

export function stripeTestKey() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (key.startsWith("sk_live_")) {
    throw new Error("Live Stripe keys are refused. This store does not move real money.")
  }
  if (!key.startsWith("sk_test_")) return null
  return key
}

export function stripeEnabled() {
  try {
    return Boolean(stripeTestKey())
  } catch {
    return false
  }
}
