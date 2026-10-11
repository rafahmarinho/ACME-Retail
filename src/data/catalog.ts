import { categories, type CategorySlug } from "@/data/categories"

export type SeedVariant = {
  sku: string
  name: string
  options: Record<string, string>
  priceCents: number
  stock: number
}

export type SeedProduct = {
  slug: string
  name: string
  brand: string
  category: CategorySlug
  description: string
  priceCents: number
  compareAtCents: number | null
  featured: boolean
  variants: SeedVariant[]
}

type VariantInput = [name: string, stock: number, options?: Record<string, string>, priceCents?: number]

function sku(slug: string, name: string) {
  const code = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 18)
  return `ACME-${slug.slice(0, 8).toUpperCase()}-${code}`
}

function product(
  slug: string,
  name: string,
  category: CategorySlug,
  brand: string,
  dollars: number,
  description: string,
  variants: VariantInput[],
  extra?: { compareAt?: number; featured?: boolean },
): SeedProduct {
  const priceCents = dollars * 100
  return {
    slug,
    name,
    brand,
    category,
    description,
    priceCents,
    compareAtCents: extra?.compareAt ? extra.compareAt * 100 : null,
    featured: extra?.featured ?? false,
    variants: variants.map(([variantName, stock, options, variantPrice]) => ({
      sku: sku(slug, variantName),
      name: variantName,
      options: options ?? { option: variantName },
      priceCents: variantPrice ?? priceCents,
      stock,
    })),
  }
}

export const products: SeedProduct[] = [
  product("meridian-oxford-shirt", "Meridian Oxford Shirt", "apparel", "Hale & Co", 78, "A crisp cotton oxford with a soft collar and a straight hem.", [["Navy / S", 12, { color: "Navy", size: "S" }], ["Navy / M", 18, { color: "Navy", size: "M" }], ["White / M", 14, { color: "White", size: "M" }], ["White / L", 9, { color: "White", size: "L" }]], { featured: true }),
  product("harbor-knit-polo", "Harbor Knit Polo", "apparel", "Hale & Co", 64, "A breathable knit polo that holds its shape after a wash.", [["Sage / M", 11, { color: "Sage", size: "M" }], ["Sage / L", 8, { color: "Sage", size: "L" }], ["Ink / M", 10, { color: "Ink", size: "M" }]]),
  product("field-chore-jacket", "Field Chore Jacket", "apparel", "Northline", 168, "A canvas chore jacket with four pockets and a corduroy collar.", [["Olive / M", 7, { color: "Olive", size: "M" }], ["Olive / L", 6, { color: "Olive", size: "L" }]], { featured: true }),
  product("everyday-crew-tee", "Everyday Crew Tee", "apparel", "Hale & Co", 32, "A midweight crew tee in combed cotton, cut a little longer in the back.", [["White / M", 22, { color: "White", size: "M" }], ["White / L", 16, { color: "White", size: "L" }], ["Black / M", 15, { color: "Black", size: "M" }]], { compareAt: 40, featured: true }),
  product("soft-flannel-overshirt", "Soft Flannel Overshirt", "apparel", "Northline", 88, "Brushed flannel with pearl buttons and a chest pocket.", [["Rust / M", 8, { color: "Rust", size: "M" }], ["Forest / M", 9, { color: "Forest", size: "M" }]]),
  product("tailored-wool-trouser", "Tailored Wool Trouser", "apparel", "Atelier West", 148, "A clean wool trouser with a pressed crease and a comfortable rise.", [["Charcoal / 32", 6, { color: "Charcoal", size: "32" }], ["Charcoal / 34", 7, { color: "Charcoal", size: "34" }]]),
  product("relaxed-denim-jean", "Relaxed Denim Jean", "apparel", "Atelier West", 118, "Rinse denim with a relaxed thigh and a straight leg.", [["Indigo / 30", 8, { color: "Indigo", size: "30" }], ["Indigo / 32", 12, { color: "Indigo", size: "32" }], ["Indigo / 34", 9, { color: "Indigo", size: "34" }]]),
  product("weekend-chino", "Weekend Chino", "apparel", "Hale & Co", 98, "Garment-dyed cotton chino that softens through the season.", [["Stone / 32", 10, { color: "Stone", size: "32" }], ["Stone / 34", 10, { color: "Stone", size: "34" }]]),
  product("ribbed-cotton-socks", "Ribbed Cotton Socks", "apparel", "Hale & Co", 18, "A three-pack of ribbed crew socks in combed cotton.", [["Oat pack", 30, { color: "Oat" }], ["Navy pack", 24, { color: "Navy" }]]),
  product("lightweight-rain-shell", "Lightweight Rain Shell", "apparel", "Northline", 138, "A packable shell with taped seams and a quiet hood.", [["Slate / M", 6, { color: "Slate", size: "M" }], ["Slate / L", 5, { color: "Slate", size: "L" }]]),
  product("court-leather-sneaker", "Court Leather Sneaker", "footwear", "Mile Marker", 128, "Smooth leather court sneaker with a cupsole and a padded tongue.", [["White / 8", 8, { color: "White", size: "8" }], ["White / 9", 10, { color: "White", size: "9" }], ["White / 10", 7, { color: "White", size: "10" }]], { featured: true }),
  product("trail-day-hiker", "Trail Day Hiker", "footwear", "Mile Marker", 158, "A light hiker with a grippy outsole for day trails.", [["Earth / 8", 5, { color: "Earth", size: "8" }], ["Earth / 9", 6, { color: "Earth", size: "9" }], ["Earth / 10", 4, { color: "Earth", size: "10" }]]),
  product("slip-on-canvas", "Slip-on Canvas", "footwear", "Mile Marker", 68, "Washed canvas slip-on with a cork footbed.", [["Black / 8", 9, { color: "Black", size: "8" }], ["Black / 9", 11, { color: "Black", size: "9" }]]),
  product("city-chelsea-boot", "City Chelsea Boot", "footwear", "Mile Marker", 188, "A polished chelsea boot with elastic gussets and a stacked heel.", [["Black / 9", 4, { color: "Black", size: "9" }], ["Black / 10", 0, { color: "Black", size: "10" }]]),
  product("cushioned-house-slide", "Cushioned House Slide", "footwear", "Mile Marker", 36, "A contoured slide for the house and the porch.", [["Sand / 8", 14, { color: "Sand", size: "8" }], ["Sand / 9", 12, { color: "Sand", size: "9" }]]),
  product("stoneware-dinner-plate", "Stoneware Dinner Plate", "home", "Kiln House", 28, "A 10-inch dinner plate with a speckled glaze and a raised rim.", [["Speckle", 16, { color: "Speckle" }], ["White", 18, { color: "White" }]], { featured: true }),
  product("linen-throw-blanket", "Linen Throw Blanket", "home", "Kiln House", 96, "Stonewashed linen throw, loosely woven and ready for the sofa.", [["Oat", 7, { color: "Oat" }], ["Sea", 6, { color: "Sea" }]]),
  product("ceramic-table-lamp", "Ceramic Table Lamp", "home", "Kiln House", 124, "A hand-finished ceramic lamp with a linen shade.", [["Bone", 5, { color: "Bone" }]]),
  product("oak-picture-frame", "Oak Picture Frame", "home", "Kiln House", 42, "Solid oak frame with a clean bevel and a white mat.", [["5 x 7", 12, { size: "5x7" }], ["8 x 10", 9, { size: "8x10" }]]),
  product("cotton-percale-sheet-set", "Cotton Percale Sheet Set", "home", "Loom & Field", 142, "Crisp percale sheets that feel cool on the first night.", [["Queen / White", 6, { size: "Queen", color: "White" }], ["Queen / Sage", 5, { size: "Queen", color: "Sage" }]]),
  product("wool-area-rug", "Wool Area Rug", "home", "Loom & Field", 240, "A low-pile wool rug in a natural undyed blend.", [["5 x 8 Natural", 3, { size: "5x8", color: "Natural" }]]),
  product("glass-carafe", "Glass Carafe", "home", "Kiln House", 36, "A one-liter carafe for water on the table.", [["Clear", 2, { color: "Clear" }]]),
  product("cedar-candle", "Cedar Candle", "home", "Hearth Note", 26, "A soy candle poured in a reusable glass.", [["Cedar", 20, { scent: "Cedar" }], ["Fig", 3, { scent: "Fig" }]]),
  product("cast-iron-skillet", "Cast Iron Skillet", "kitchen", "Hearth Note", 72, "Pre-seasoned cast iron that moves from stove to oven.", [["10 inch", 10, { size: "10 inch" }], ["12 inch", 8, { size: "12 inch" }]], { featured: true }),
  product("chef-knife", "Chef Knife", "kitchen", "Forge & Board", 84, "An 8-inch chef knife with a full tang and a beech handle.", [["8 inch", 9, { size: "8 inch" }]]),
  product("mixing-bowl-set", "Mixing Bowl Set", "kitchen", "Kiln House", 48, "Three nested stoneware bowls with a pouring lip.", [["Speckle", 11, { color: "Speckle" }]]),
  product("beech-cutting-board", "Beech Cutting Board", "kitchen", "Forge & Board", 54, "Edge-grain beech board with a juice groove.", [["Medium", 8, { size: "Medium" }], ["Large", 6, { size: "Large" }]]),
  product("enamel-kettle", "Enamel Kettle", "kitchen", "Hearth Note", 62, "A stovetop kettle with a whistle and a stay-cool handle.", [["Cream", 7, { color: "Cream" }]]),
  product("linen-tea-towels", "Linen Tea Towels", "kitchen", "Loom & Field", 24, "A set of two linen towels that dry quickly.", [["Stripe", 18, { pattern: "Stripe" }]]),
  product("pour-over-coffee-maker", "Pour-over Coffee Maker", "kitchen", "Forge & Board", 46, "A glass carafe with a reusable steel filter.", [["Glass", 13, { material: "Glass" }]]),
  product("packable-daypack", "Packable Daypack", "outdoor", "Northline", 78, "A 16-liter pack that folds into its own pocket.", [["Spruce", 9, { color: "Spruce" }], ["Sand", 8, { color: "Sand" }]], { featured: true }),
  product("insulated-bottle", "Insulated Bottle", "outdoor", "Northline", 34, "A 20-ounce bottle that keeps water cold through the afternoon.", [["Stone", 15, { color: "Stone", size: "20oz" }], ["Green", 12, { color: "Green", size: "20oz" }]], { compareAt: 42 }),
  product("camping-mug", "Camping Mug", "outdoor", "Northline", 18, "An enamel mug with a rolled rim.", [["White", 20, { color: "White" }]]),
  product("compact-picnic-blanket", "Compact Picnic Blanket", "outdoor", "Loom & Field", 44, "A water-resistant blanket that rolls into a strap.", [["Gingham", 8, { pattern: "Gingham" }]]),
  product("weatherproof-tote", "Weatherproof Tote", "outdoor", "Northline", 58, "A coated tote for wet markets and sandy cars.", [["Black", 10, { color: "Black" }]]),
  product("leather-card-wallet", "Leather Card Wallet", "accessories", "Atelier West", 48, "Vegetable-tanned leather wallet for four cards and folded notes.", [["Tan", 9, { color: "Tan" }], ["Black", 8, { color: "Black" }]], { featured: true }),
  product("canvas-market-tote", "Canvas Market Tote", "accessories", "Hale & Co", 28, "Heavy canvas tote with long handles and a flat base.", [["Natural", 16, { color: "Natural" }], ["Navy", 14, { color: "Navy" }]]),
  product("wool-beanie", "Wool Beanie", "accessories", "Northline", 32, "A ribbed merino beanie that packs flat.", [["Charcoal", 12, { color: "Charcoal" }], ["Camel", 10, { color: "Camel" }]]),
  product("classic-sunglasses", "Classic Sunglasses", "accessories", "Mile Marker", 58, "Acetate frames with polarized lenses.", [["Tortoise", 7, { color: "Tortoise" }]]),
  product("brass-key-fob", "Brass Key Fob", "accessories", "Atelier West", 22, "A solid brass fob that takes a patina.", [["Brass", 19, { material: "Brass" }]]),
]

export const coupons = [
  { code: "WELCOME10", kind: "percent" as const, value: 10, minSubtotalCents: 0, label: "10% off your first illustrated order" },
  { code: "SAVE15", kind: "fixed" as const, value: 1500, minSubtotalCents: 8000, label: "$15 off orders over $80" },
  { code: "FREESHIP", kind: "free_shipping" as const, value: 0, minSubtotalCents: 0, label: "Free illustrative standard shipping" },
]

export const scenarios = [
  { key: "happy_path", name: "Steady retail day", description: "Payments approve and shipments move forward when you advance the clock.", defaultOutcome: "approved", delayShipments: false, forceTimeout: false, openReturns: false, suggestRefunds: false },
  { key: "decline_spike", name: "Declines spike", description: "New checkouts default to a declined card. No charge is made.", defaultOutcome: "declined", delayShipments: false, forceTimeout: false, openReturns: false, suggestRefunds: false },
  { key: "authentication", name: "Bank authentication", description: "New checkouts stop for a simulated authentication step.", defaultOutcome: "authentication_required", delayShipments: false, forceTimeout: false, openReturns: false, suggestRefunds: false },
  { key: "gateway_timeout", name: "Gateway timeout", description: "Advancing the clock expires unpaid reservations and records a timeout.", defaultOutcome: "timeout", delayShipments: false, forceTimeout: true, openReturns: false, suggestRefunds: false },
  { key: "warehouse_delay", name: "Warehouse delay", description: "Shipments stay where they are until you change the scenario.", defaultOutcome: "approved", delayShipments: true, forceTimeout: false, openReturns: false, suggestRefunds: false },
  { key: "refund_wave", name: "Partial refund wave", description: "Advancing the clock files pending partial refunds for finance to complete.", defaultOutcome: "approved", delayShipments: false, forceTimeout: false, openReturns: false, suggestRefunds: true },
  { key: "return_surge", name: "Return surge", description: "Advancing the clock opens return requests on delivered orders.", defaultOutcome: "approved", delayShipments: false, forceTimeout: false, openReturns: true, suggestRefunds: false },
]

export function categoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug
}

export function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}
