import { Suspense } from "react";
import OrderShell from "@/components/order/OrderShell";
import BookingHandoff from "@/components/order/BookingHandoff";

export default function OrderBookingPage() {
  return (
    <OrderShell step="booking">
      <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
        <BookingHandoff />
      </Suspense>
    </OrderShell>
  );
}
