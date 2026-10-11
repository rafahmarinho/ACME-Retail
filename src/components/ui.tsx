import { formatMoney } from "@/lib/money"

export function Money({ cents }: { cents: number }) {
  return <span>{formatMoney(cents)}</span>
}

export function StatusBadge({ value }: { value: string }) {
  const good = ["approved", "delivered", "received", "completed", "refunded", "active"]
  const bad = ["declined", "timed_out", "cancelled", "rejected", "failed", "archived"]
  const tone = good.includes(value) ? "good" : bad.includes(value) ? "bad" : "wait"
  return <span className={`badge ${tone}`}>{value.replaceAll("_", " ")}</span>
}

export function ErrorNote({ message }: { message?: string | null }) {
  if (!message) return null
  return <div className="error" role="alert">{message}</div>
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="notice">{children}</div>
}

export function SkeletonGrid() {
  return (
    <div className="grid-products" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, index) => <div key={index} className="skel" style={{ height: 320 }} />)}
    </div>
  )
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="card" style={{ padding: 28 }}>
      <h2 className="serif" style={{ margin: "0 0 8px", fontSize: 28 }}>{title}</h2>
      <p className="muted" style={{ margin: 0 }}>{body}</p>
    </div>
  )
}
