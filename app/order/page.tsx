import { Suspense } from "react";
import OrderShell from "@/components/order/OrderShell";
import BouquetSelector from "@/components/order/BouquetSelector";

export default function OrderPage() {
  return (
    <OrderShell step="service">
      <Suspense fallback={null}>
        <BouquetSelector />
      </Suspense>
    </OrderShell>
  );
}
