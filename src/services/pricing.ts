export const TAX_RATE = 0.0825
export const STANDARD_SHIPPING_CENTS = 895
export const EXPRESS_SHIPPING_CENTS = 1895
export const FREE_STANDARD_THRESHOLD_CENTS = 7500
export const RESERVATION_MINUTES = 20

export type CouponKind = "percent" | "fixed" | "free_shipping"

export type CouponRule = {
  code: string
  kind: CouponKind
  value: number
  minSubtotalCents: number
  label: string
}

export const couponRules: CouponRule[] = [
  { code: "WELCOME10", kind: "percent", value: 10, minSubtotalCents: 0, label: "10% off" },
  { code: "SAVE15", kind: "fixed", value: 1500, minSubtotalCents: 8000, label: "$15 off orders over $80" },
  { code: "FREESHIP", kind: "free_shipping", value: 0, minSubtotalCents: 0, label: "Free standard shipping" },
]

export type ShippingMethod = "standard" | "express"

export type QuoteInput = {
  subtotalCents: number
  couponCode?: string | null
  shippingMethod: ShippingMethod
}

export type Quote = {
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  couponCode: string | null
  shippingMethod: ShippingMethod
  freeShippingApplied: boolean
  label: string
}

export function illustrativeTaxCents(taxableCents: number) {
  return Math.round(Math.max(0, taxableCents) * TAX_RATE)
}

export function normalizeCoupon(code?: string | null) {
  const trimmed = code?.trim().toUpperCase() ?? ""
  return trimmed.length ? trimmed : null
}

export function quoteCart(input: QuoteInput): Quote {
  const couponCode = normalizeCoupon(input.couponCode)
  const rule = couponCode ? couponRules.find((item) => item.code === couponCode) : undefined
  if (couponCode && !rule) {
    throw new Error("That coupon code is not active.")
  }
  if (rule && input.subtotalCents < rule.minSubtotalCents) {
    throw new Error("This coupon needs a higher subtotal.")
  }

  let discountCents = 0
  let freeShipping = false
  if (rule?.kind === "percent") {
    discountCents = Math.floor((input.subtotalCents * rule.value) / 100)
  } else if (rule?.kind === "fixed") {
    discountCents = Math.min(rule.value, input.subtotalCents)
  } else if (rule?.kind === "free_shipping") {
    freeShipping = true
  }

  const taxable = input.subtotalCents - discountCents
  const thresholdFree = input.shippingMethod === "standard" && taxable >= FREE_STANDARD_THRESHOLD_CENTS
  const shippingCents =
    input.shippingMethod === "express"
      ? EXPRESS_SHIPPING_CENTS
      : freeShipping || thresholdFree
        ? 0
        : STANDARD_SHIPPING_CENTS

  const taxCents = illustrativeTaxCents(taxable)
  return {
    subtotalCents: input.subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: taxable + shippingCents + taxCents,
    couponCode,
    shippingMethod: input.shippingMethod,
    freeShippingApplied: shippingCents === 0,
    label: rule?.label ?? "",
  }
}

export type PaymentOutcome = "approved" | "declined" | "authentication_required" | "timeout"

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "requires_authentication"
  | "approved"
  | "declined"
  | "timed_out"
  | "partially_refunded"
  | "refunded"

export function paymentStatusForOutcome(outcome: PaymentOutcome): PaymentStatus {
  if (outcome === "authentication_required") return "requires_authentication"
  if (outcome === "timeout") return "timed_out"
  return outcome
}

export function canCompleteAuthentication(status: PaymentStatus) {
  return status === "requires_authentication"
}

export function canRetryCheckout(status: PaymentStatus) {
  return status === "declined" || status === "timed_out" || status === "unpaid"
}

export function remainingRefundableCents(capturedCents: number, refundedCents: number) {
  return Math.max(0, capturedCents - refundedCents)
}

export function nextPaymentStatusAfterRefund(capturedCents: number, refundedCents: number): PaymentStatus {
  if (refundedCents <= 0) return "approved"
  if (refundedCents >= capturedCents) return "refunded"
  return "partially_refunded"
}

export function availableUnits(onHand: number, reserved: number) {
  return Math.max(0, onHand - reserved)
}
