"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { categories } from "@/data/categories"
import { api } from "@/lib/client"
import { formatMoney } from "@/lib/money"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { canAccess, isStaff, linksForRole, officeLinks, shopLinks, type Role } from "@/services/access"

type Profile = { id: string; email: string; fullName: string; role: Role }
type CartItem = { variantId: string; quantity: number; name: string; slug: string; variantName: string; unitPriceCents: number }
type SessionState = { profile: Profile | null; stripe: boolean; scenarioName: string; defaultOutcome: string }

const CartContext = createContext<{
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (item: CartItem) => Promise<void>
  update: (variantId: string, quantity: number) => Promise<void>
  session: SessionState
  refreshSession: () => Promise<void>
} | null>(null)

const guestKey = "acme-retail-cart"

export function useStore() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useStore must be used inside the store shell.")
  return value
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [session, setSession] = useState<SessionState>({ profile: null, stripe: false, scenarioName: "Steady retail day", defaultOutcome: "approved" })
  const [query, setQuery] = useState("")

  async function refreshSession() {
    try {
      const data = await api<{ profile: Profile | null; stripe: boolean; scenario: { scenarios: { name: string; default_outcome: string } | { name: string; default_outcome: string }[] | null } | null }>("/api/session")
      const scenario = Array.isArray(data.scenario?.scenarios) ? data.scenario?.scenarios[0] : data.scenario?.scenarios
      setSession({
        profile: data.profile,
        stripe: data.stripe,
        scenarioName: scenario?.name ?? "Steady retail day",
        defaultOutcome: scenario?.default_outcome ?? "approved",
      })
      if (data.profile) {
        const guest = readGuest()
        if (guest.length) {
          await api("/api/cart/merge", { method: "POST", body: JSON.stringify({ items: guest }) })
          localStorage.removeItem(guestKey)
        }
        const cart = await api<{ cart: { items: CartItem[] } }>("/api/cart")
        setItems(cart.cart.items)
      }
    } catch {
      setSession((current) => ({ ...current, profile: null }))
    }
  }

  useEffect(() => {
    const guest = readGuest()
    if (guest.length) setItems(guest)
    void refreshSession()
  }, [])

  async function add(item: CartItem) {
    if (session.profile) {
      const cart = await api<{ cart: { items: CartItem[] } }>("/api/cart", { method: "POST", body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }) })
      setItems(cart.cart.items)
    } else {
      const next = mergeLocal(items, item)
      setItems(next)
      localStorage.setItem(guestKey, JSON.stringify(next))
    }
    setOpen(true)
  }

  async function update(variantId: string, quantity: number) {
    if (session.profile) {
      const cart = await api<{ cart: { items: CartItem[] } }>("/api/cart", {
        method: "POST",
        headers: { "x-acme-update": "1" },
        body: JSON.stringify({ variantId, quantity }),
      })
      setItems(cart.cart.items)
    } else {
      const next = items.map((item) => item.variantId === variantId ? { ...item, quantity } : item).filter((item) => item.quantity > 0)
      setItems(next)
      localStorage.setItem(guestKey, JSON.stringify(next))
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)
  const links = linksForRole(shopLinks, session.profile?.role, Boolean(session.profile))
  const office = session.profile && isStaff(session.profile.role) ? linksForRole(officeLinks, session.profile.role, true) : []
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal, open, setOpen, add, update, session, refreshSession }), [items, subtotal, open, session])

  return (
    <CartContext value={value}>
      <header className="site-header">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 16, alignItems: "center", minHeight: 72 }}>
          <Link href="/" className="serif" style={{ fontSize: 28, letterSpacing: "-0.04em" }}>ACME <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Retail</span></Link>
          <form className="search" action="/catalog" onSubmit={(event) => { event.preventDefault(); router.push(`/catalog?q=${encodeURIComponent(query)}`) }}>
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search the catalog" placeholder="Search shirts, skillets, boots" value={query} onChange={(event) => setQuery(event.target.value)} name="q" />
          </form>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link className="btn-ghost" href={session.profile ? "/account" : "/login"}>{session.profile ? session.profile.fullName.split(" ")[0] : "Sign in"}</Link>
            <Link className="btn-ghost" href="/wishlist">Saved</Link>
            <button className="btn" type="button" onClick={() => setOpen(true)}>Cart {value.count ? `(${value.count})` : ""}</button>
          </div>
        </div>
        <div className="wrap" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 10 }}>
          {categories.map((category) => (
            <Link key={category.slug} className="nav-link" data-active={pathname.startsWith("/catalog") ? undefined : undefined} href={`/catalog?category=${category.slug}`}>{category.name}</Link>
          ))}
          {links.filter((link) => link.href !== "/" && link.href !== "/catalog").map((link) => (
            <Link key={link.href} className="nav-link" data-active={pathname.startsWith(link.href)} href={link.href}>{link.label}</Link>
          ))}
          {office.length ? <Link className="nav-link" href="/office" data-active={pathname.startsWith("/office")}>Office</Link> : null}
        </div>
      </header>
      <main className="wrap" style={{ padding: "28px 0 64px", flex: 1 }}>{children}</main>
      <footer style={{ borderTop: "1px solid var(--color-line)", padding: "28px 0 40px" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <strong className="serif">ACME Retail</strong>
            <p className="muted" style={{ margin: "6px 0 0" }}>Everyday goods. Illustrative shipping, tax, and payments. No real money moves in the default checkout.</p>
          </div>
          <p className="muted" style={{ margin: 0 }}>Scenario: {session.scenarioName}</p>
        </div>
      </footer>
      {open ? (
        <>
          <button className="drawer-backdrop" aria-label="Close cart" onClick={() => setOpen(false)} />
          <aside className="drawer" role="dialog" aria-label="Cart">
            <div style={{ display: "flex", justifyContent: "space-between", padding: 18, borderBottom: "1px solid var(--color-line)" }}>
              <strong>Your cart</strong>
              <button className="btn-ghost" type="button" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div style={{ padding: 18, overflow: "auto", display: "grid", gap: 14 }}>
              {items.length === 0 ? <p className="muted">Your cart is empty.</p> : items.map((item) => (
                <div key={item.variantId} style={{ display: "grid", gap: 4 }}>
                  <Link href={`/product/${item.slug}`} onClick={() => setOpen(false)}><strong>{item.name}</strong></Link>
                  <span className="muted">{item.variantName}</span>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <input aria-label={`Quantity for ${item.name}`} type="number" min={0} max={10} value={item.quantity} onChange={(event) => void update(item.variantId, Number(event.target.value))} style={{ width: 72 }} />
                    <span>{formatMoney(item.unitPriceCents * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: 18, borderTop: "1px solid var(--color-line)", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              <p className="muted" style={{ margin: 0 }}>Shipping and illustrative tax are calculated at checkout. The price is saved when the order is placed.</p>
              <Link className="btn" href="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
              <Link className="btn-line" href="/cart" onClick={() => setOpen(false)}>Review cart</Link>
            </div>
          </aside>
        </>
      ) : null}
    </CartContext>
  )
}

export function OfficeFrame({ children }: { children: React.ReactNode }) {
  const { session } = useStore()
  const pathname = usePathname()
  const links = linksForRole(officeLinks, session.profile?.role, Boolean(session.profile)).filter((link) => canAccess(session.profile?.role, link.roles))
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
      <aside className="card" style={{ padding: 14, alignSelf: "start", display: "grid", gap: 8 }}>
        <strong>Back office</strong>
        {links.map((link) => <Link key={link.href} className="nav-link" data-active={pathname === link.href} href={link.href}>{link.label}</Link>)}
        <Link className="nav-link" href="/">Back to shop</Link>
      </aside>
      <div>{children}</div>
    </div>
  )
}

function readGuest(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(guestKey) ?? "[]")
  } catch {
    return []
  }
}

function mergeLocal(items: CartItem[], item: CartItem) {
  const existing = items.find((entry) => entry.variantId === item.variantId)
  if (!existing) return [...items, item]
  return items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: Math.min(10, entry.quantity + item.quantity) } : entry)
}

export async function signOut() {
  const supabase = createBrowserSupabase()
  if (supabase) await supabase.auth.signOut()
  window.location.href = "/"
}
