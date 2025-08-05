import CheckoutPage from "@/components/frontend/checkout/CheckoutPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();
  if (!session) {
    redirect("/login?returnUrl=/checkout");
  }

  return <CheckoutPage session={session} />;
}
