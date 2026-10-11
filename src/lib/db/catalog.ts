import "server-only"
import { AppError, friendlyDbError } from "@/lib/errors"
import { createServerSupabase } from "@/lib/supabase/server"
import { mapProduct, productSelect } from "@/lib/db/map"

export type CatalogQuery = {
  q?: string
  category?: string
  brand?: string
  min?: number
  max?: number
  inStock?: boolean
  sort?: string
  page?: number
  pageSize?: number
  featured?: boolean
}

async function client() {
  const supabase = await createServerSupabase()
  if (!supabase) throw new AppError("Supabase is not configured. Add the environment variables in .env.local.", 503)
  return supabase
}

export async function listCatalog(query: CatalogQuery) {
  const supabase = await client()
  const { data, error } = await supabase.from("products").select(productSelect).eq("status", "active")
  if (error) throw new AppError(friendlyDbError(error), 500)
  let products = (data ?? []).map((row) => mapProduct(row))
  const q = query.q?.trim().toLowerCase()
  if (q) {
    products = products.filter((product) =>
      [product.name, product.brand, product.description, product.categoryName].join(" ").toLowerCase().includes(q),
    )
  }
  if (query.category) products = products.filter((product) => product.category === query.category)
  if (query.brand) products = products.filter((product) => product.brand === query.brand)
  if (query.min) products = products.filter((product) => product.priceCents >= query.min!)
  if (query.max) products = products.filter((product) => product.priceCents <= query.max!)
  if (query.inStock) products = products.filter((product) => product.inStock)
  if (query.featured) products = products.filter((product) => product.featured)
  const brands = [...new Set(products.map((product) => product.brand))].sort()
  if (query.sort === "price_asc") products.sort((a, b) => a.priceCents - b.priceCents)
  else if (query.sort === "price_desc") products.sort((a, b) => b.priceCents - a.priceCents)
  else if (query.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name))
  else products.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))

  const pageSize = query.pageSize ?? 12
  const page = Math.max(1, query.page ?? 1)
  const start = (page - 1) * pageSize
  return {
    products: products.slice(start, start + pageSize),
    total: products.length,
    page,
    pageSize,
    brands,
  }
}

export async function getProduct(slug: string) {
  const supabase = await client()
  const { data, error } = await supabase.from("products").select(productSelect).eq("slug", slug).maybeSingle()
  if (error) throw new AppError(friendlyDbError(error), 500)
  if (!data || (data.status !== "active" && data.status !== "draft")) throw new AppError("Product not found.", 404)
  return mapProduct(data)
}

export async function listCategories() {
  const supabase = await client()
  const { data, error } = await supabase.from("categories").select("slug, name, blurb, sort_order").order("sort_order")
  if (error) throw new AppError(friendlyDbError(error), 500)
  return data ?? []
}
