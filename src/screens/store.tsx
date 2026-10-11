"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useStore } from "@/components/shell"
import { Empty, ErrorNote, Money, SkeletonGrid } from "@/components/ui"
import { previewCatalog, previewProduct, type StoreProduct } from "@/data/preview"
import { api } from "@/lib/client"
import { formatMoney } from "@/lib/money"
import { quoteCart, type PaymentOutcome, type ShippingMethod } from "@/services/pricing"

export function HomeScreen() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api<{ products: StoreProduct[] }>("/api/catalog?featured=1&pageSize=8")
      .then((data) => setProducts(data.products))
      .catch((reason: Error) => {
        setError(`${reason.message} Showing the local preview until the database is connected.`)
        setProducts(previewCatalog().products.filter((product) => product.featured))
      })
      .finally(() => setLoading(false))
  }, [])
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <section className="card" style={{ padding: 36, display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 24 }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>Everyday goods, considered.</p>
          <h1 className="serif" style={{ fontSize: 64, lineHeight: 0.95, margin: "8px 0 12px", letterSpacing: "-0.045em" }}>Goods for the week ahead.</h1>
          <p style={{ maxWidth: 520 }}>Shirts, kitchen tools, and small things that stay. Choose a variant, apply a coupon, and check out with a simulated payment. The price you see is the price that is saved.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="btn" href="/catalog">Shop the catalog</Link>
            <Link className="btn-line" href="/login">Use a demo account</Link>
          </div>
        </div>
        <div style={{ background: "var(--color-accent-soft)", borderRadius: 16, padding: 20 }}>
          <strong>Illustrative checkout</strong>
          <p className="muted">Standard shipping is $8.95, express is $18.95, and standard is free over $75 after discounts. Tax is shown at 8.25% and is not a filed tax calculation.</p>
          <p className="muted" style={{ marginBottom: 0 }}>Coupons: WELCOME10, SAVE15, FREESHIP.</p>
        </div>
      </section>
      <ErrorNote message={error} />
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="serif" style={{ fontSize: 36, margin: 0 }}>Featured</h2>
          <Link href="/catalog">View all</Link>
        </div>
        {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
      </section>
    </div>
  )
}

export function CatalogScreen() {
  const params = useSearchParams()
  const [data, setData] = useState<Awaited<ReturnType<typeof previewCatalog>> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const query = params.toString()
  useEffect(() => {
    setLoading(true)
    api<Awaited<ReturnType<typeof previewCatalog>>>(`/api/catalog?${query}`)
      .then(setData)
      .catch((reason: Error) => {
        setError(reason.message)
        const preview = previewCatalog()
        const q = params.get("q")?.toLowerCase()
        const category = params.get("category")
        setData({
          ...preview,
          products: preview.products.filter((product) => {
            const matchesQuery = !q || `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(q)
            const matchesCategory = !category || product.category === category
            const matchesStock = params.get("inStock") !== "1" || product.inStock
            return matchesQuery && matchesCategory && matchesStock
          }),
        })
      })
      .finally(() => setLoading(false))
  }, [query])
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
      <form className="card" style={{ padding: 16, display: "grid", gap: 12, alignSelf: "start" }} action="/catalog">
        <strong>Filters</strong>
        <label className="field"><span>Search</span><input name="q" defaultValue={params.get("q") ?? ""} /></label>
        <label className="field"><span>Category</span>
          <select name="category" defaultValue={params.get("category") ?? ""}>
            <option value="">All</option>
            {(data?.categories ?? previewCatalog().categories).map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Brand</span>
          <select name="brand" defaultValue={params.get("brand") ?? ""}>
            <option value="">All</option>
            {(data?.brands ?? []).map((brand) => <option key={brand}>{brand}</option>)}
          </select>
        </label>
        <label className="field"><span>Min price</span><input name="min" type="number" min={0} defaultValue={params.get("min") ?? ""} /></label>
        <label className="field"><span>Max price</span><input name="max" type="number" min={0} defaultValue={params.get("max") ?? ""} /></label>
        <label style={{ display: "flex", gap: 8 }}><input type="checkbox" name="inStock" value="1" defaultChecked={params.get("inStock") === "1"} /> In stock</label>
        <label className="field"><span>Sort</span>
          <select name="sort" defaultValue={params.get("sort") ?? "featured"}>
            <option value="featured">Featured</option>
            <option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
        <button className="btn" type="submit">Apply filters</button>
      </form>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 className="serif" style={{ margin: 0, fontSize: 42 }}>Catalog</h1>
          <span className="muted">{data ? `${data.total} products` : "Loading"}</span>
        </div>
        <ErrorNote message={error} />
        {loading ? <SkeletonGrid /> : data && data.products.length === 0 ? <Empty title="No matches" body="Try another search or clear a filter." /> : <ProductGrid products={data?.products ?? []} />}
      </div>
    </div>
  )
}

export function ProductScreen({ slug }: { slug: string }) {
  const { add } = useStore()
  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [variantId, setVariantId] = useState("")
  const [quantity, setQuantity] = useState(1)
  useEffect(() => {
    api<{ product: StoreProduct }>(`/api/catalog/${slug}`)
      .then((data) => { setProduct(data.product); setVariantId(data.product.variants[0]?.id ?? "") })
      .catch((reason: Error) => {
        const preview = previewProduct(slug)
        setError(reason.message)
        if (preview) { setProduct(preview); setVariantId(preview.variants[0]?.id ?? "") }
      })
      .finally(() => setLoading(false))
  }, [slug])
  if (loading) return <SkeletonGrid />
  if (!product) return <Empty title="Product not found" body="That item is not in the catalog." />
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
      <img src={product.imageUrl} alt={product.name} style={{ width: "100%", borderRadius: 18, background: "white", border: "1px solid var(--color-line)" }} />
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        <p className="muted" style={{ margin: 0 }}>{product.brand} · {product.categoryName}</p>
        <h1 className="serif" style={{ margin: 0, fontSize: 48 }}>{product.name}</h1>
        <p style={{ fontSize: 20, margin: 0 }}><Money cents={variant?.priceCents ?? product.priceCents} /> {product.compareAtCents ? <s className="muted">{formatMoney(product.compareAtCents)}</s> : null}</p>
        <p>{product.description}</p>
        <ErrorNote message={error} />
        {message ? <div className="notice">{message}</div> : null}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {product.variants.map((item) => (
            <button key={item.id} className={item.id === variant?.id ? "btn" : "btn-line"} type="button" onClick={() => setVariantId(item.id)}>{item.name}</button>
          ))}
        </div>
        <p className="muted">{variant && variant.available > 0 ? `${variant.available} available` : "Out of stock"} · SKU {variant?.sku}</p>
        <label className="field" style={{ maxWidth: 120 }}><span>Quantity</span><input type="number" min={1} max={10} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="button" disabled={!variant || variant.available < 1} onClick={() => void add({ variantId: variant.id, quantity, name: product.name, slug: product.slug, variantName: variant.name, unitPriceCents: variant.priceCents }).then(() => setMessage("Added to cart. The final price is confirmed at checkout.")).catch((reason: Error) => setError(reason.message))}>Add to cart</button>
          <button className="btn-line" type="button" onClick={() => void api("/api/wishlist", { method: "POST", body: JSON.stringify({ productId: product.id }) }).then(() => setMessage("Saved to your wishlist.")).catch((reason: Error) => setError(reason.message))}>Save</button>
        </div>
        <p className="muted">Illustrative shipping and tax are added at checkout. Stock is reserved only after you place the order.</p>
      </div>
    </div>
  )
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid-products">
      {products.map((product) => (
        <Link key={product.slug} href={`/product/${product.slug}`} className="card" style={{ overflow: "hidden" }}>
          <img src={product.imageUrl} alt="" style={{ aspectRatio: "4 / 5", objectFit: "cover", background: "#f7f4ee" }} />
          <div style={{ padding: 12, display: "grid", gap: 4 }}>
            <span className="muted" style={{ fontSize: 13 }}>{product.brand}</span>
            <strong>{product.name}</strong>
            <span><Money cents={product.priceCents} /> {!product.inStock ? <span className="badge bad">Out of stock</span> : null}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function CartScreen() {
  const { items, update, subtotal } = useStore()
  if (!items.length) return <Empty title="Your cart is empty" body="Browse the catalog and choose a variant." />
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 className="serif" style={{ margin: 0, fontSize: 42 }}>Cart</h1>
      {items.map((item) => (
        <div key={item.variantId} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Link href={`/product/${item.slug}`}><strong>{item.name}</strong></Link>
            <p className="muted" style={{ margin: "4px 0" }}>{item.variantName}</p>
            <input aria-label="Quantity" type="number" min={0} max={10} value={item.quantity} onChange={(event) => void update(item.variantId, Number(event.target.value))} />
          </div>
          <strong>{formatMoney(item.unitPriceCents * item.quantity)}</strong>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
      <Link className="btn" href="/checkout" style={{ width: "fit-content" }}>Continue to checkout</Link>
    </div>
  )
}

const emptyAddress = { fullName: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "United States", phone: "" }

export function CheckoutScreen() {
  const { items, subtotal, session } = useStore()
  const router = useRouter()
  const [coupon, setCoupon] = useState("")
  const [method, setMethod] = useState<ShippingMethod>("standard")
  const [outcome, setOutcome] = useState<PaymentOutcome>("approved")
  const [address, setAddress] = useState(emptyAddress)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [quote, setQuote] = useState<ReturnType<typeof quoteCart> | null>(null)

  useEffect(() => {
    if (session.defaultOutcome) setOutcome(session.defaultOutcome as PaymentOutcome)
  }, [session.defaultOutcome])

  useEffect(() => {
    try {
      setQuote(quoteCart({ subtotalCents: subtotal, couponCode: coupon, shippingMethod: method }))
      setError(null)
    } catch (reason) {
      setQuote(null)
      setError(reason instanceof Error ? reason.message : "Coupon could not be applied.")
    }
  }, [subtotal, coupon, method])

  async function submit(paymentMethod: "simulated" | "stripe") {
    setPending(true)
    setError(null)
    try {
      if (!session.profile) {
        router.push("/login?next=/checkout")
        return
      }
      const response = await api<{ result: { orderId: string; checkoutUrl?: string } }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          email: session.profile.email,
          shippingAddress: address,
          shippingMethod: method,
          couponCode: coupon,
          paymentMethod,
          outcome,
        }),
      })
      if (response.result.checkoutUrl) {
        window.location.href = response.result.checkoutUrl
        return
      }
      router.push(`/payment/result?order=${response.result.orderId}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout failed.")
    } finally {
      setPending(false)
    }
  }

  if (!items.length) return <Empty title="Nothing to check out" body="Add a product before placing an order." />
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 24 }}>
      <form className="card" style={{ padding: 20, display: "grid", gap: 12 }} onSubmit={(event) => { event.preventDefault(); void submit("simulated") }}>
        <h1 className="serif" style={{ margin: 0 }}>Checkout</h1>
        <p className="muted">Current scenario: {session.scenarioName}. You can override the simulated outcome. No real money moves unless you optionally use a Stripe test key.</p>
        <ErrorNote message={error} />
        {(["fullName", "line1", "line2", "city", "region", "postalCode", "country"] as const).map((field) => (
          <label key={field} className="field"><span>{field}</span><input required={field !== "line2"} value={address[field]} onChange={(event) => setAddress({ ...address, [field]: event.target.value })} /></label>
        ))}
        <label className="field"><span>Coupon</span><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="WELCOME10" /></label>
        <label className="field"><span>Illustrative shipping</span>
          <select value={method} onChange={(event) => setMethod(event.target.value as ShippingMethod)}>
            <option value="standard">Standard, 5–7 days</option>
            <option value="express">Express, 2 days</option>
          </select>
        </label>
        <label className="field"><span>Simulated payment outcome</span>
          <select value={outcome} onChange={(event) => setOutcome(event.target.value as PaymentOutcome)}>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="authentication_required">Authentication required</option>
            <option value="timeout">Timeout</option>
          </select>
        </label>
        <button className="btn" disabled={pending} type="submit">{pending ? "Placing order…" : "Place simulated order"}</button>
        {session.stripe ? <button className="btn-line" type="button" disabled={pending} onClick={() => void submit("stripe")}>Pay with Stripe test Checkout</button> : <p className="muted">Stripe test Checkout appears when STRIPE_SECRET_KEY starts with sk_test_.</p>}
      </form>
      <aside className="card" style={{ padding: 20, alignSelf: "start", display: "grid", gap: 8 }}>
        <strong>Order summary</strong>
        {items.map((item) => <div key={item.variantId} style={{ display: "flex", justifyContent: "space-between" }}><span>{item.name} × {item.quantity}</span><span>{formatMoney(item.unitPriceCents * item.quantity)}</span></div>)}
        {quote ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>{formatMoney(quote.discountCents)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Illustrative shipping</span><span>{formatMoney(quote.shippingCents)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Illustrative tax 8.25%</span><span>{formatMoney(quote.taxCents)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>Total</strong><strong>{formatMoney(quote.totalCents)}</strong></div>
          </>
        ) : null}
      </aside>
    </div>
  )
}

export function PaymentResultScreen() {
  const params = useSearchParams()
  const orderId = params.get("order")
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  async function load() {
    if (!orderId) return
    setLoading(true)
    try {
      if (params.get("provider") === "stripe") {
        await api("/api/payments", { method: "POST", body: JSON.stringify({ orderId, provider: "stripe" }) }).catch(() => undefined)
      }
      const data = await api<{ order: Record<string, unknown> }>(`/api/orders/${orderId}`)
      setOrder(data.order)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load the payment result.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [orderId])

  if (!orderId) return <Empty title="No payment to show" body="Place an order to see the result." />
  if (loading) return <div className="skel" style={{ height: 180 }} />
  const payments = (order?.payments as Array<{ message: string; status: string }> | undefined) ?? []
  const latest = payments[payments.length - 1]
  return (
    <div className="card" style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1 className="serif" style={{ margin: 0 }}>Payment result</h1>
      <ErrorNote message={error} />
      <p>Order {String(order?.number ?? "")}</p>
      <p>Payment: <strong>{String(order?.payment_status ?? "").replaceAll("_", " ")}</strong></p>
      <p>Delivery: <strong>{String(order?.fulfillment_status ?? "").replaceAll("_", " ")}</strong></p>
      <p>{latest?.message ?? "The payment record will appear here after checkout."}</p>
      {order?.payment_status === "requires_authentication" ? (
        <button className="btn" disabled={pending} type="button" onClick={() => {
          setPending(true)
          void api("/api/payments", { method: "POST", body: JSON.stringify({ orderId, outcome: "approved" }) }).then(load).catch((reason: Error) => setError(reason.message)).finally(() => setPending(false))
        }}>{pending ? "Completing…" : "Complete simulated authentication"}</button>
      ) : null}
      <div style={{ display: "flex", gap: 8 }}>
        <Link className="btn-line" href={`/orders/${orderId}`}>View order</Link>
        <Link className="btn-line" href={`/tracking/${orderId}`}>Track delivery</Link>
      </div>
    </div>
  )
}

export function WishlistScreen() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([api<{ items: Array<{ product_id: string }> }>("/api/wishlist"), api<{ products: StoreProduct[] }>("/api/catalog?pageSize=40")])
      .then(([wishlist, catalog]) => setProducts(catalog.products.filter((product) => wishlist.items.some((item) => item.product_id === product.id))))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])
  if (loading) return <SkeletonGrid />
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 className="serif" style={{ margin: 0 }}>Wishlist</h1>
      <ErrorNote message={error} />
      {products.length === 0 ? <Empty title="Nothing saved yet" body="Sign in and save a product from its page." /> : <ProductGrid products={products} />}
    </div>
  )
}
