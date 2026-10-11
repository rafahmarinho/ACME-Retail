"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut, useStore } from "@/components/shell"
import { Empty, ErrorNote, Money, StatusBadge } from "@/components/ui"
import { api, asArray } from "@/lib/client"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { demoAccounts, demoPassword } from "@/services/access"

export function LoginScreen() {
  const params = useSearchParams()
  const router = useRouter()
  const { refreshSession } = useStore()
  const [email, setEmail] = useState("customer@acme-retail.example")
  const [password, setPassword] = useState(demoPassword)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const supabase = createBrowserSupabase()
    if (!supabase) {
      setError("Supabase is not configured. Add the public URL and anon key, then restart the app.")
      setPending(false)
      return
    }
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name || email.split("@")[0] } } })
    setPending(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Confirm the email if confirmation is enabled, then sign in.")
      return
    }
    await refreshSession()
    router.push(params.get("next") || "/account")
    router.refresh()
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <form className="card" style={{ padding: 24, display: "grid", gap: 12 }} onSubmit={(event) => void submit(event)}>
        <h1 className="serif" style={{ margin: 0 }}>{mode === "login" ? "Sign in" : "Create an account"}</h1>
        <ErrorNote message={error} />
        {message ? <div className="notice">{message}</div> : null}
        {mode === "signup" ? <label className="field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label> : null}
        <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
        <button className="btn" disabled={pending} type="submit">{pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button>
        <button className="btn-ghost" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Need an account?" : "Already have an account?"}</button>
        <Link href="/recover">Forgot password</Link>
      </form>
      <aside className="card" style={{ padding: 24 }}>
        <h2 className="serif" style={{ marginTop: 0 }}>Demo profiles</h2>
        <p className="muted">Password for every seeded account: {demoPassword}</p>
        <div style={{ display: "grid", gap: 8 }}>
          {demoAccounts.map((account) => (
            <button key={account.email} className="btn-line" type="button" onClick={() => { setEmail(account.email); setPassword(demoPassword); setMode("login") }}>
              {account.name} · {account.role}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

export function RecoverScreen() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  return (
    <form className="card" style={{ padding: 24, display: "grid", gap: 12, maxWidth: 520 }} onSubmit={(event) => {
      event.preventDefault()
      const supabase = createBrowserSupabase()
      if (!supabase) { setError("Supabase is not configured."); return }
      void supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` })
        .then(({ error: authError }) => {
          if (authError) setError(authError.message)
          else setMessage("If that account exists, a recovery email is on its way. Open the link to choose a new password.")
        })
    }}>
      <h1 className="serif" style={{ margin: 0 }}>Recover password</h1>
      <ErrorNote message={error} />
      {message ? <div className="notice">{message}</div> : null}
      <label className="field"><span>Email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <button className="btn" type="submit">Send recovery email</button>
    </form>
  )
}

export function ResetPasswordScreen() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  return (
    <form className="card" style={{ padding: 24, display: "grid", gap: 12, maxWidth: 520 }} onSubmit={(event) => {
      event.preventDefault()
      const supabase = createBrowserSupabase()
      if (!supabase) { setError("Supabase is not configured."); return }
      void supabase.auth.updateUser({ password }).then(({ error: authError }) => {
        if (authError) setError(authError.message)
        else setMessage("Password updated. You can continue to your account.")
      })
    }}>
      <h1 className="serif" style={{ margin: 0 }}>Choose a new password</h1>
      <ErrorNote message={error} />
      {message ? <div className="notice">{message}</div> : null}
      <label className="field"><span>New password</span><input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="btn" type="submit">Update password</button>
    </form>
  )
}

type AccountPayload = {
  profile: { fullName: string; email: string; phone: string | null; marketingOptIn: boolean; orderEmails: boolean; role: string }
  address: { full_name: string; line1: string; line2: string; city: string; region: string; postal_code: string; country: string } | null
}

export function AccountScreen() {
  const { session } = useStore()
  const [data, setData] = useState<AccountPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    api<AccountPayload>("/api/account").then(setData).catch((reason: Error) => setError(reason.message))
  }, [])
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 className="serif" style={{ margin: 0 }}>Account</h1>
      <ErrorNote message={error} />
      <div className="card" style={{ padding: 20 }}>
        <p style={{ marginTop: 0 }}>{data?.profile.fullName ?? session.profile?.fullName ?? "Guest"}</p>
        <p className="muted">{data?.profile.email ?? "Sign in to see saved orders and settings."}</p>
        <p>Role: {data?.profile.role ?? session.profile?.role ?? "guest"}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn-line" href="/account/settings">Settings</Link>
          <Link className="btn-line" href="/orders">Orders</Link>
          {session.profile ? <button className="btn-ghost" type="button" onClick={() => void signOut()}>Sign out</button> : <Link className="btn" href="/login">Sign in</Link>}
        </div>
      </div>
    </div>
  )
}

export function SettingsScreen() {
  const [form, setForm] = useState({ fullName: "", phone: "", marketingOptIn: false, orderEmails: true, line1: "", line2: "", city: "", region: "", postalCode: "", country: "United States" })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api<AccountPayload>("/api/account").then((data) => {
      setForm({
        fullName: data.profile.fullName,
        phone: data.profile.phone ?? "",
        marketingOptIn: data.profile.marketingOptIn,
        orderEmails: data.profile.orderEmails,
        line1: data.address?.line1 ?? "",
        line2: data.address?.line2 ?? "",
        city: data.address?.city ?? "",
        region: data.address?.region ?? "",
        postalCode: data.address?.postal_code ?? "",
        country: data.address?.country ?? "United States",
      })
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div className="skel" style={{ height: 220 }} />
  return (
    <form className="card" style={{ padding: 20, display: "grid", gap: 12, maxWidth: 640 }} onSubmit={(event) => {
      event.preventDefault()
      setMessage(null)
      void api("/api/account", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          marketingOptIn: form.marketingOptIn,
          orderEmails: form.orderEmails,
          address: form.line1 ? { fullName: form.fullName, line1: form.line1, line2: form.line2, city: form.city, region: form.region, postalCode: form.postalCode, country: form.country } : undefined,
        }),
      }).then(() => setMessage("Settings saved.")).catch((reason: Error) => setError(reason.message))
    }}>
      <h1 className="serif" style={{ margin: 0 }}>Settings</h1>
      <ErrorNote message={error} />
      {message ? <div className="notice">{message}</div> : null}
      <label className="field"><span>Name</span><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
      <label className="field"><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label><input type="checkbox" checked={form.orderEmails} onChange={(event) => setForm({ ...form, orderEmails: event.target.checked })} /> Order emails</label>
      <label><input type="checkbox" checked={form.marketingOptIn} onChange={(event) => setForm({ ...form, marketingOptIn: event.target.checked })} /> Product notes</label>
      <h2 className="serif" style={{ marginBottom: 0 }}>Default address</h2>
      {(["line1", "line2", "city", "region", "postalCode", "country"] as const).map((field) => (
        <label key={field} className="field"><span>{field}</span><input value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>
      ))}
      <button className="btn" type="submit">Save settings</button>
    </form>
  )
}

type OrderRow = {
  id: string
  number: string
  payment_status: string
  fulfillment_status: string
  total_cents: number
  placed_at: string
  order_items: Array<{ id: string; name: string; variant_name: string; quantity: number; unit_price_cents: number }>
  payments: Array<{ message: string; status: string; amount_cents: number }>
  shipments: Array<{ id: string; carrier: string; tracking_number: string; status: string; shipment_events: Array<{ id: string; status: string; message: string; occurred_at: string }> }>
  returns: Array<{ id: string; status: string; reason: string }>
  refunds: Array<{ id: string; amount_cents: number; status: string; kind: string; reason: string }>
  email?: string
}

export function OrdersScreen() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api<{ orders: OrderRow[] }>("/api/orders").then((data) => setOrders(data.orders)).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false))
  }, [])
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="serif" style={{ margin: 0 }}>Orders</h1>
      <ErrorNote message={error} />
      {loading ? <div className="skel" style={{ height: 160 }} /> : orders.length === 0 ? <Empty title="No orders yet" body="Placed orders stay here after a reload." /> : orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <strong>{order.number}</strong>
            <p className="muted" style={{ margin: "4px 0" }}>{new Date(order.placed_at).toLocaleString()}</p>
            <StatusBadge value={order.payment_status} /> <StatusBadge value={order.fulfillment_status} />
          </div>
          <Money cents={order.total_cents} />
        </Link>
      ))}
    </div>
  )
}

export function OrderDetailScreen({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("Changed my mind")
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api<{ order: OrderRow }>(`/api/orders/${id}`).then((data) => setOrder(data.order)).catch((reasonError: Error) => setError(reasonError.message)).finally(() => setLoading(false))
  }
  useEffect(load, [id])
  useEffect(() => {
    const supabase = createBrowserSupabase()
    if (!supabase) return
    const channel = supabase.channel(`order-${id}`).on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => load()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [id])

  if (loading) return <div className="skel" style={{ height: 200 }} />
  if (!order) return <Empty title="Order not found" body={error ?? "This order is not available for your account."} />
  const items = asArray(order.order_items)
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 className="serif" style={{ margin: 0 }}>{order.number}</h1>
      <ErrorNote message={error} />
      <div style={{ display: "flex", gap: 8 }}><StatusBadge value={order.payment_status} /><StatusBadge value={order.fulfillment_status} /></div>
      <p className="muted">Payment and delivery are tracked separately. The unit price below is the price saved at purchase.</p>
      {items.map((item) => <div key={item.id} className="card" style={{ padding: 12 }}>{item.name} · {item.variant_name} × {item.quantity} · <Money cents={item.unit_price_cents} /></div>)}
      <p>Total <Money cents={order.total_cents} /></p>
      {["pending", "requires_authentication", "approved", "reserved"].includes(order.payment_status) || ["unfulfilled", "reserved"].includes(order.fulfillment_status) ? (
        <form style={{ display: "flex", gap: 8 }} onSubmit={(event) => {
          event.preventDefault()
          void api(`/api/orders/${id}/actions`, { method: "POST", body: JSON.stringify({ action: "cancel", reason }) }).then(load).catch((actionError: Error) => setError(actionError.message))
        }}>
          <input aria-label="Cancellation reason" value={reason} onChange={(event) => setReason(event.target.value)} />
          <button className="btn-line" type="submit">Cancel order</button>
        </form>
      ) : null}
      <Link className="btn" href={`/tracking/${id}`} style={{ width: "fit-content" }}>Track delivery</Link>
      <Link className="btn-line" href={`/returns?order=${id}`} style={{ width: "fit-content" }}>Request a return</Link>
    </div>
  )
}

export function TrackingScreen({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    api<{ order: OrderRow }>(`/api/orders/${id}`).then((data) => setOrder(data.order)).catch((reason: Error) => setError(reason.message))
  }, [id])
  const shipments = asArray(order?.shipments)
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 className="serif" style={{ margin: 0 }}>Tracking</h1>
      <ErrorNote message={error} />
      {!order ? <div className="skel" style={{ height: 120 }} /> : shipments.length === 0 ? <Empty title="Not shipped yet" body="Warehouse staff can mark the order picked and shipped. Payment status stays separate." /> : shipments.map((shipment) => (
        <div key={shipment.id} className="card" style={{ padding: 16 }}>
          <p>{shipment.carrier} · {shipment.tracking_number}</p>
          <StatusBadge value={shipment.status} />
          <ol>
            {asArray(shipment.shipment_events).map((event) => <li key={event.id}>{new Date(event.occurred_at).toLocaleString()} — {event.message}</li>)}
          </ol>
        </div>
      ))}
    </div>
  )
}

export function ReturnsScreen() {
  const params = useSearchParams()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState(params.get("order") ?? "")
  const [reason, setReason] = useState("Item did not fit")
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    api<{ orders: OrderRow[] }>("/api/orders").then((data) => {
      setOrders(data.orders)
      if (!orderId && data.orders[0]) setOrderId(data.orders[0].id)
    }).catch((reasonError: Error) => setError(reasonError.message))
  }, [])
  const selected = orders.find((order) => order.id === orderId)
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 className="serif" style={{ margin: 0 }}>Returns</h1>
      <ErrorNote message={error} />
      {message ? <div className="notice">{message}</div> : null}
      <form className="card" style={{ padding: 16, display: "grid", gap: 10 }} onSubmit={(event) => {
        event.preventDefault()
        const items = asArray(selected?.order_items).map((item) => ({ orderItemId: item.id, quantity: 1 }))
        void api(`/api/orders/${orderId}/actions`, { method: "POST", body: JSON.stringify({ action: "return", reason, items }) })
          .then(() => setMessage("Return requested. A warehouse review can approve or reject it."))
          .catch((actionError: Error) => setError(actionError.message))
      }}>
        <label className="field"><span>Order</span>
          <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
            {orders.map((order) => <option key={order.id} value={order.id}>{order.number}</option>)}
          </select>
        </label>
        <label className="field"><span>Reason</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
        <button className="btn" type="submit">Request return</button>
      </form>
      {orders.flatMap((order) => asArray(order.returns).map((item) => (
        <div key={item.id} className="card" style={{ padding: 12 }}>{order.number}: {item.reason} <StatusBadge value={item.status} /></div>
      )))}
    </div>
  )
}
