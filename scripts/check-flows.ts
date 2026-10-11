import { products } from "../src/data/catalog"
import { assertDemoInvariants } from "../src/lib/seed/build-demo"
import { illustrativeTaxCents, quoteCart, remainingRefundableCents } from "../src/services/pricing"

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

const welcome = quoteCart({ subtotalCents: 10000, couponCode: "welcome10", shippingMethod: "standard" })
expect(welcome.discountCents === 1000, "WELCOME10 should discount 10 percent.")
expect(welcome.shippingCents === 0, "Standard shipping should be free over $75 after discount.")

const save = quoteCart({ subtotalCents: 8000, couponCode: "SAVE15", shippingMethod: "express" })
expect(save.discountCents === 1500, "SAVE15 should take $15 off.")
expect(save.shippingCents === 1895, "Express shipping stays paid.")

let blocked = false
try {
  quoteCart({ subtotalCents: 7999, couponCode: "SAVE15", shippingMethod: "standard" })
} catch {
  blocked = true
}
expect(blocked, "SAVE15 should require an $80 subtotal.")

const freeShip = quoteCart({ subtotalCents: 2000, couponCode: "FREESHIP", shippingMethod: "standard" })
expect(freeShip.shippingCents === 0 && freeShip.discountCents === 0, "FREESHIP should waive standard shipping only.")

expect(illustrativeTaxCents(9000) === 743, "8.25 percent of $90 should round to 743 cents.")
expect(remainingRefundableCents(5000, 1500) === 3500, "Remaining refund should subtract completed refunds.")
expect(products.length === 40, "Catalog should contain 40 products.")

const problems = assertDemoInvariants()
expect(problems.length === 0, `Demo invariants failed: ${problems.join(", ")}`)
console.log("Main pricing and demo-data flows passed.")
