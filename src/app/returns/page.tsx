import { Suspense } from "react"
import { ReturnsScreen } from "@/screens/account"

export default function ReturnsPage() {
  return (
    <Suspense fallback={<p>Loading returns…</p>}>
      <ReturnsScreen />
    </Suspense>
  )
}
