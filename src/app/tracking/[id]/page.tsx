import { TrackingScreen } from "@/screens/account"

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TrackingScreen id={id} />
}
