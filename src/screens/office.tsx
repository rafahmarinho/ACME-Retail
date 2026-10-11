"use client"

import { useEffect, useState } from "react"
import { OfficeFrame } from "@/components/shell"
import { Empty, ErrorNote, Money, StatusBadge } from "@/components/ui"
import { categories } from "@/data/categories"
import { api, asArray } from "@/lib/client"
import { formatMoney } from "@/lib/money"

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <OfficeFrame>
      <h1 className="serif" style={{ marginTop: 0 }}>{title}</h1>
      {children}
    </OfficeFrame>
  )
}

export function OfficeHomeScreen() {
  return (
    <Frame title="Back office">
      <p>Catalog, warehouse, finance, and administrator tools. Customers do not see these pages. Payment status and delivery status stay independent.</p>
    </Frame>
  )
}

type OfficeProduct = {
  id: string
  slug: string
  name: string
  description: string
  brand: string
  status: string
  category: string
  featured: boolean
  variants: Array<{ id: string; sku: string; name: string; priceCents: number; onHand: number; location: string }>
}

export function ProductsOfficeScreen() {
  const blank = { name: "", slug: "", description: "", brand: "ACME", categorySlug: "apparel", status: "active", featured: false, sku: "", variantName: "Default", priceCents: 4800, stock: 12 }
  const [products, setProducts] = useState<OfficeProduct[]>([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function load() {
    api<{ products: OfficeProduct[] }>("/api/office/products").then((data) => setProducts(data.products)).catch((reason: Error) => setError(reason.message))
  }
  useEffect(load, [])

  return (
    <Frame title="Products">
      <ErrorNote message={error} />
      {message ? <div className="notice">{message}</div> : null}
      <form className="card" style={{ padding: 16, display: "grid", gap: 10, marginBottom: 16 }} onSubmit={(event) => {
        event.preventDefault()
        void api("/api/office/products", {
          method: "POST",
          body: JSON.stringify({
            id: editing,
            name: form.name,
            slug: form.slug,
            description: form.description,
            brand: form.brand,
            categorySlug: form.categorySlug,
            status: form.status,
            featured: form.featured,
            variants: [{ sku: form.sku, name: form.variantName, priceCents: Number(form.priceCents), stock: Number(form.stock), options: {} }],
          }),
        }).then(() => { setMessage("Product saved."); setForm(blank); setEditing(undefined); load() }).catch((reason: Error) => setError(reason.message))
      }}>
        <label className="field"><span>Name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} /></label>
        <label className="field"><span>Slug</span><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
        <label className="field"><span>Description</span><textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="field"><span>Brand</span><input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /></label>
        <label className="field"><span>Category</span>
          <select value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })}>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="field"><span>Variant SKU</span><input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></label>
        <label className="field"><span>Variant name</span><input value={form.variantName} onChange={(event) => setForm({ ...form, variantName: event.target.value })} /></label>
        <label className="field"><span>Price in cents</span><input type="number" value={form.priceCents} onChange={(event) => setForm({ ...form, priceCents: Number(event.target.value) })} /></label>
        <label className="field"><span>On hand</span><input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label>
        <label><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label>
        <button className="btn" type="submit">{editing ? "Update product" : "Create product"}</button>
      </form>
      <div style={{ display: "grid", gap: 8 }}>
        {products.map((product) => (
          <button key={product.id} className="card" style={{ padding: 12, textAlign: "left" }} type="button" onClick={() => {
            const variant = product.variants[0]
            setEditing(product.id)
            setForm({ ...blank, name: product.name, slug: product.slug, description: product.description, brand: product.brand, categorySlug: product.category, status: product.status, featured: product.featured, sku: variant?.sku ?? "", variantName: variant?.name ?? "Default", priceCents: variant?.priceCents ?? 0, stock: variant?.onHand ?? 0 })
          }}>
            <strong>{product.name}</strong> <StatusBadge value={product.status} />
            <p className="muted" style={{ margin: "4px 0 0" }}>{product.variants.map((variant) => variant.sku).join(", ")}</p>
          </button>
        ))}
      </div>
    </Frame>
  )
}

type InventoryRow = { variantId: string; sku: string; productName: string; variantName: string; onHand: number; reserved: number; available: number; location: string }

export function InventoryOfficeScreen() {
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  function load() {
    api<{ inventory: InventoryRow[] }>("/api/office/inventory").then((data) => setRows(data.inventory)).catch((reason: Error) => setError(reason.message))
  }
  useEffect(load, [])
  return (
    <Frame title="Inventory">
      <ErrorNote message={error} />
      <p className="muted">Available units are on hand minus reserved. Checkout reservations do not reduce on-hand until the order ships.</p>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Location</th><th></th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.variantId}>
              <td>{row.productName}<br /><span className="muted">{row.variantName}</span></td>
              <td>{row.sku}</td>
              <td><input aria-label={`On hand for ${row.sku}`} style={{ width: 80 }} value={drafts[row.variantId] ?? String(row.onHand)} onChange={(event) => setDrafts({ ...drafts, [row.variantId]: event.target.value })} /></td>
              <td>{row.reserved}</td>
              <td>{row.available}</td>
              <td>{row.location}</td>
              <td><button className="btn-line" type="button" onClick={() => void api("/api/office/inventory", { method: "POST", body: JSON.stringify({ variantId: row.variantId, onHand: Number(drafts[row.variantId] ?? row.onHand), location: row.location }) }).then(load).catch((reason: Error) => setError(reason.message))}>Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Frame>
  )
}

type OfficeOrder = {
  id: string
  number: string
  email: string
  payment_status: string
  fulfillment_status: string
  total_cents: number
  shipments: Array<{ id: string }> | { id: string } | null
}

export function OrdersOfficeScreen() {
  const [orders, setOrders] = useState<OfficeOrder[]>([])
  const [error, setError] = useState<string | null>(null)
  function load() {
    api<{ orders: OfficeOrder[] }>("/api/orders?scope=all").then((data) => setOrders(data.orders)).catch((reason: Error) => setError(reason.message))
  }
  useEffect(load, [])
  return (
    <Frame title="Orders">
      <ErrorNote message={error} />
      {orders.length === 0 ? <Empty title="No orders" body="Seed the database to load the sixty demo orders." /> : null}
      <table>
        <thead><tr><th>Number</th><th>Customer</th><th>Payment</th><th>Delivery</th><th>Total</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map((order) => {
            const shipment = asArray(order.shipments)[0]
            return (
              <tr key={order.id}>
                <td>{order.number}</td>
                <td>{order.email}</td>
                <td><StatusBadge value={order.payment_status} /></td>
                <td><StatusBadge value={order.fulfillment_status} /></td>
                <td><Money cents={order.total_cents} /></td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="btn-line" type="button" onClick={() => act(order.id, { action: "pick" }, load, setError)}>Pick</button>
                  <button className="btn-line" type="button" onClick={() => act(order.id, { action: "ship", carrier: "Northline Parcel" }, load, setError)}>Ship</button>
                  {shipment ? <button className="btn-line" type="button" onClick={() => act(order.id, { action: "advance", shipmentId: shipment.id }, load, setError)}>Advance</button> : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Frame>
  )
}

type RefundOrder = OfficeOrder & { refunds: Array<{ id: string; amount_cents: number; status: string; reason: string }> | null; returns: Array<{ id: string; status: string }> | null }

export function RefundsOfficeScreen() {
  const [orders, setOrders] = useState<RefundOrder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(1500)
  const [reason, setReason] = useState("Goodwill partial refund")
  function load() {
    api<{ orders: RefundOrder[] }>("/api/orders?scope=all").then((data) => setOrders(data.orders)).catch((reasonError: Error) => setError(reasonError.message))
  }
  useEffect(load, [])
  return (
    <Frame title="Refunds">
      <ErrorNote message={error} />
      <p className="muted">Completing a refund does not change the delivery status. Full and partial amounts are recorded separately from shipment progress.</p>
      {orders.map((order) => (
        <div key={order.id} className="card" style={{ padding: 12, marginBottom: 10 }}>
          <strong>{order.number}</strong> <StatusBadge value={order.payment_status} /> <Money cents={order.total_cents} />
          {asArray(order.refunds).map((refund) => (
            <div key={refund.id} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <span>{formatMoney(refund.amount_cents)} · {refund.reason}</span>
              <StatusBadge value={refund.status} />
              {refund.status === "pending" ? <button className="btn" type="button" onClick={() => act(order.id, { action: "refund", refundId: refund.id }, load, setError)}>Complete</button> : null}
            </div>
          ))}
          {asArray(order.returns).filter((item) => item.status === "requested").map((item) => (
            <div key={item.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn-line" type="button" onClick={() => act(order.id, { action: "review-return", returnId: item.id, decision: "approved" }, load, setError)}>Approve return</button>
              <button className="btn-line" type="button" onClick={() => act(order.id, { action: "review-return", returnId: item.id, decision: "rejected" }, load, setError)}>Reject return</button>
            </div>
          ))}
          <form style={{ display: "flex", gap: 8, marginTop: 8 }} onSubmit={(event) => { event.preventDefault(); act(order.id, { action: "refund", amountCents: amount, reason }, load, setError) }}>
            <input aria-label="Refund amount in cents" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            <input aria-label="Refund reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <button className="btn-line" type="submit">Issue refund</button>
          </form>
        </div>
      ))}
    </Frame>
  )
}

export function ReportsOfficeScreen() {
  const [report, setReport] = useState<{ orderCount: number; capturedCents: number; refundedCents: number; netCents: number; byPayment: Record<string, number>; byFulfillment: Record<string, number>; note: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { api<{ report: NonNullable<typeof report> }>("/api/office/reports").then((data) => setReport(data.report)).catch((reason: Error) => setError(reason.message)) }, [])
  return (
    <Frame title="Reports">
      <ErrorNote message={error} />
      {!report ? <div className="skel" style={{ height: 160 }} /> : (
        <div className="card" style={{ padding: 16, display: "grid", gap: 8 }}>
          <p>{report.note}</p>
          <p>Orders: {report.orderCount}</p>
          <p>Captured: <Money cents={report.capturedCents} /></p>
          <p>Refunded: <Money cents={report.refundedCents} /></p>
          <p>Net illustrative: <Money cents={report.netCents} /></p>
          <p>Payment: {Object.entries(report.byPayment).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>
          <p>Delivery: {Object.entries(report.byFulfillment).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>
        </div>
      )}
    </Frame>
  )
}

type SimulationPayload = {
  state: { scenario_key: string; simulated_now: string; ticks: number } | null
  scenarios: Array<{ key: string; name: string; description: string; default_outcome: string }>
  events: Array<{ id: string; event_type: string; message: string; created_at: string }>
}

export function SimulationScreen() {
  const [data, setData] = useState<SimulationPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState("")
  const [pending, setPending] = useState(false)
  function load() {
    api<SimulationPayload>("/api/simulation").then(setData).catch((reason: Error) => setError(reason.message))
  }
  useEffect(load, [])
  function run(body: Record<string, string>) {
    setPending(true)
    void api("/api/simulation", { method: "POST", body: JSON.stringify(body) }).then(() => { setConfirmation(""); load() }).catch((reason: Error) => setError(reason.message)).finally(() => setPending(false))
  }
  return (
    <Frame title="Simulation lab">
      <ErrorNote message={error} />
      {!data ? <div className="skel" style={{ height: 160 }} /> : (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <p>Scenario: {data.state?.scenario_key}</p>
            <p>Simulated time: {data.state ? new Date(data.state.simulated_now).toLocaleString() : "—"} · ticks {data.state?.ticks ?? 0}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.scenarios.map((scenario) => (
                <button key={scenario.key} className="btn-line" type="button" disabled={pending} onClick={() => run({ action: "scenario", scenario: scenario.key })}>{scenario.name}</button>
              ))}
            </div>
            <p className="muted">{data.scenarios.find((scenario) => scenario.key === data.state?.scenario_key)?.description}</p>
            <button className="btn" type="button" disabled={pending} onClick={() => run({ action: "advance" })}>{pending ? "Working…" : "Advance simulation"}</button>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h2 className="serif" style={{ marginTop: 0 }}>Events</h2>
            {data.events.map((event) => <p key={event.id}>{new Date(event.created_at).toLocaleString()} · {event.event_type} · {event.message}</p>)}
          </div>
          <form className="card" style={{ padding: 16, display: "grid", gap: 8 }} onSubmit={(event) => { event.preventDefault(); run({ action: "reset", confirmation }) }}>
            <strong>Reset demo data</strong>
            <p className="muted">This replaces catalog, inventory, and the sixty orders. Type RESET to confirm. A service role key is required.</p>
            <input aria-label="Reset confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="RESET" />
            <button className="btn-line" type="submit" disabled={pending}>Reset data</button>
          </form>
        </div>
      )}
    </Frame>
  )
}

function act(orderId: string, body: Record<string, unknown>, load: () => void, setError: (message: string) => void) {
  void api(`/api/orders/${orderId}/actions`, { method: "POST", body: JSON.stringify(body) }).then(load).catch((reason: Error) => setError(reason.message))
}
