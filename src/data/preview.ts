import { products } from "@/data/catalog"
import { categories } from "@/data/categories"
import { availableUnits } from "@/services/pricing"

export function previewCatalog() {
  return {
    products: products.map(mapPreview),
    total: products.length,
    page: 1,
    pageSize: 12,
    brands: [...new Set(products.map((product) => product.brand))].sort(),
    categories,
  }
}

export function previewProduct(slug: string) {
  const product = products.find((item) => item.slug === slug)
  return product ? mapPreview(product) : null
}

function mapPreview(product: (typeof products)[number]) {
  return {
    id: product.slug,
    slug: product.slug,
    name: product.name,
    description: product.description,
    brand: product.brand,
    status: "active",
    category: product.category,
    categoryName: categories.find((category) => category.slug === product.category)?.name ?? product.category,
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents,
    featured: product.featured,
    imageUrl: `/products/${product.slug}.svg`,
    images: [{ url: `/products/${product.slug}.svg`, alt: product.name }],
    variants: product.variants.map((variant) => ({
      id: variant.sku,
      sku: variant.sku,
      name: variant.name,
      options: variant.options,
      priceCents: variant.priceCents,
      onHand: variant.stock,
      reserved: 0,
      location: "Preview",
      available: availableUnits(variant.stock, 0),
    })),
    inStock: product.variants.some((variant) => variant.stock > 0),
  }
}

export type StoreProduct = ReturnType<typeof mapPreview>
