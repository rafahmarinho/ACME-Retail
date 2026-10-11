export const categories = [
  { slug: "apparel", name: "Apparel", blurb: "Shirts, layers, and trousers for the week." },
  { slug: "footwear", name: "Footwear", blurb: "Shoes for the commute, the trail, and the house." },
  { slug: "home", name: "Home", blurb: "Table, textile, and light for quiet rooms." },
  { slug: "kitchen", name: "Kitchen", blurb: "Tools that earn a permanent spot on the counter." },
  { slug: "outdoor", name: "Outdoor", blurb: "Packable pieces for days away from the desk." },
  { slug: "accessories", name: "Accessories", blurb: "Small goods that finish the outfit." },
] as const

export type CategorySlug = (typeof categories)[number]["slug"]
