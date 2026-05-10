import { Suspense } from "react";
import OrderShell from "@/components/order/OrderShell";
import DetailsForm from "@/components/order/DetailsForm";

export default function OrderDetailsPage() {
  return (
    <OrderShell step="details">
      <Suspense fallback={null}>
        <DetailsForm />
      </Suspense>
    </OrderShell>
  );
}
