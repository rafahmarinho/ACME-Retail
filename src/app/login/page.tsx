import { Suspense } from "react"
import { LoginScreen } from "@/screens/account"

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <LoginScreen />
    </Suspense>
  )
}
