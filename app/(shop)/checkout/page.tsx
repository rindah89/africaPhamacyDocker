import CheckoutPage from "@/components/frontend/checkout/CheckoutPage";
import { authOptions } from "@/config/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?returnUrl=/checkout");
  }

  return <CheckoutPage session={session} />;
}
