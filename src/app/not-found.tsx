import Link from "next/link"

export default function NotFound() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 className="serif">Page not found</h1>
      <p>That page is not part of ACME Retail.</p>
      <Link className="btn" href="/catalog">Back to the catalog</Link>
    </div>
  )
}
