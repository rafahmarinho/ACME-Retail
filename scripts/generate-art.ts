import { mkdirSync, writeFileSync } from "node:fs"
import { products } from "../src/data/catalog"

const palette = ["#1f7a4d", "#24211c", "#8a5a12", "#3d6b8a", "#6b4c7a", "#8d3b32"]

function svg(title: string, index: number) {
  const color = palette[index % palette.length]
  const safe = title.replace(/&/g, "and").replace(/</g, "")
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#f7f4ee"/>
  <rect x="70" y="80" width="660" height="720" rx="28" fill="${color}"/>
  <circle cx="400" cy="390" r="120" fill="#fffcf8" opacity="0.9"/>
  <text x="80" y="880" fill="#24211c" font-family="Georgia, serif" font-size="42">${safe}</text>
  <text x="80" y="930" fill="#5e5a52" font-family="Segoe UI, sans-serif" font-size="22">ACME Retail</text>
</svg>`
}

mkdirSync("public/products", { recursive: true })
products.forEach((product, index) => {
  writeFileSync(`public/products/${product.slug}.svg`, svg(product.name, index))
})
writeFileSync("public/products/placeholder.svg", svg("ACME Retail", 0))
console.log(`Wrote ${products.length + 1} product images.`)
