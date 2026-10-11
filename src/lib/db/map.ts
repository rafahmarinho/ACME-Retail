import { publicEnv } from "@/lib/env"
import { availableUnits } from "@/services/pricing"

export type ImageRow = { storage_path: string | null; public_path: string; alt: string | null; sort_order: number }

export function mediaUrl(image?: ImageRow | null) {
  if (!image) return "/products/placeholder.svg"
  const env = publicEnv()
  if (image.storage_path && env) {
    return `${env.url}/storage/v1/object/public/product-media/${image.storage_path}`
  }
  return image.public_path || "/products/placeholder.svg"
}

type VariantRow = {
  id: string
  sku: string
  name: string
  options: Record<string, string>
  price_cents: number
  active: boolean
  inventory: { on_hand: number; reserved: number; location: string; reorder_point?: number } | { on_hand: number; reserved: number; location: string }[] | null
}

function inventoryOf(variant: VariantRow) {
  const inventory = Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory
  return {
    onHand: inventory?.on_hand ?? 0,
    reserved: inventory?.reserved ?? 0,
    location: inventory?.location ?? "",
    available: availableUnits(inventory?.on_hand ?? 0, inventory?.reserved ?? 0),
  }
}

export function mapProduct(row: {
  id: string
  slug: string
  name: string
  description: string
  brand: string
  status: string
  base_price_cents: number
  compare_at_cents: number | null
  featured: boolean
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null
  product_images: ImageRow[] | null
  product_variants: VariantRow[] | null
}) {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const variants = (row.product_variants ?? [])
    .filter((variant) => variant.active)
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      options: variant.options ?? {},
      priceCents: variant.price_cents,
      ...inventoryOf(variant),
    }))
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    brand: row.brand,
    status: row.status,
    category: category?.slug ?? "",
    categoryName: category?.name ?? "",
    priceCents: row.base_price_cents,
    compareAtCents: row.compare_at_cents,
    featured: row.featured,
    imageUrl: mediaUrl(images[0]),
    images: images.map((image) => ({ url: mediaUrl(image), alt: image.alt ?? row.name })),
    variants,
    inStock: variants.some((variant) => variant.available > 0),
  }
}

export const productSelect = `
  id, slug, name, description, brand, status, base_price_cents, compare_at_cents, featured,
  categories (slug, name),
  product_images (storage_path, public_path, alt, sort_order),
  product_variants (id, sku, name, options, price_cents, active, inventory (on_hand, reserved, location))
`
