import { Suspense } from "react"
import { CatalogScreen } from "@/screens/store"

export default function CatalogPage() {
  return (
    <Suspense fallback={<p>Loading catalog…</p>}>
      <CatalogScreen />
    </Suspense>
  )
}
