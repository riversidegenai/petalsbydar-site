import { Suspense } from "react";
import OrderShell from "@/components/order/OrderShell";
import DepositRedirect from "@/components/order/DepositRedirect";

export default function DepositPage() {
  return (
    <OrderShell step="deposit">
      <Suspense fallback={null}>
        <DepositRedirect />
      </Suspense>
    </OrderShell>
  );
}
