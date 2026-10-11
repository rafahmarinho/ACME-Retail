import { Suspense } from "react"
import { PaymentResultScreen } from "@/screens/store"

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<p>Loading payment result…</p>}>
      <PaymentResultScreen />
    </Suspense>
  )
}
