import { Suspense } from "react";
import OrderShell from "@/components/order/OrderShell";
import PaymentGate from "@/components/order/PaymentGate";

export default function OrderPaymentPage() {
  return (
    <OrderShell step="payment">
      <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
        <PaymentGate />
      </Suspense>
    </OrderShell>
  );
}
