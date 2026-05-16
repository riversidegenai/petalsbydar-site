"use client";

import { useSearchParams } from "next/navigation";
import PaymentForm from "./PaymentForm";

export default function PaymentGate() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  if (!orderId) {
    return (
      <p className="text-sm text-red-600">
        Missing order ID. Please start your order again.
      </p>
    );
  }

  return <PaymentForm orderId={orderId} />;
}
