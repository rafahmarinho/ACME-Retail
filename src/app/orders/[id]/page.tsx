import { OrderDetailScreen } from "@/screens/account"

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OrderDetailScreen id={id} />
}
