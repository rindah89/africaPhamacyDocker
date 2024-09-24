import { getOrderById } from "@/actions/orders";
import OrderInvoice from "@/components/frontend/orders/OrderInvoice";
import React from "react";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const order = await getOrderById(id);

  return (
    <div>
      {order ? (
        <OrderInvoice order={order} />
      ) : (
        <div className="py-8">
          <h2>No Order with this Id - {id}</h2>
        </div>
      )}
    </div>
  );
}
