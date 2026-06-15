import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Petals by Dar",
  description: "Our refund and cancellation policy for custom bouquet orders.",
};

export default function RefundsPage() {
  return (
    <>
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="text-xs uppercase tracking-widest text-blush-700">
        Last updated: June 14, 2026
      </p>

      <p>
        Because each bouquet is custom-made and uses perishable materials, our
        refund policy is different from a typical retail store. Please read
        this carefully before placing your order.
      </p>

      <h2>Deposits</h2>
      <p>
        The deposit you pay at checkout is{" "}
        <strong>non-refundable</strong> once your order is confirmed. This
        covers the materials we order specifically for your bouquet and the
        time we set aside in our schedule.
      </p>

      <h2>Cancellations by you</h2>
      <ul>
        <li>
          <strong>More than 48 hours before pickup:</strong> deposit is
          non-refundable, but we&apos;re happy to apply it as credit toward a
          future order within 90 days.
        </li>
        <li>
          <strong>Less than 48 hours before pickup:</strong> deposit is
          forfeit, since materials have already been purchased and prepared.
        </li>
        <li>
          <strong>Day-of no-show:</strong> the full order amount, including
          any remaining balance, is forfeit.
        </li>
      </ul>

      <h2>Cancellations by us</h2>
      <p>
        If we have to cancel your order for any reason — for example, if a
        specific flower can&apos;t be sourced in time — you will receive a{" "}
        <strong>full refund</strong>, including the deposit. We&apos;ll always
        try to offer alternatives first.
      </p>

      <h2>If something is wrong with your bouquet</h2>
      <p>
        We pride ourselves on quality. If your bouquet arrives damaged or does
        not match what we agreed on, please contact us within{" "}
        <strong>24 hours of pickup</strong> with photos. We will work with you
        on a fix — typically a remake, partial credit, or refund depending on
        the situation.
      </p>

      <h2>What is not covered</h2>
      <ul>
        <li>
          Natural variation in flowers (color, exact shape, or size) — we
          match the agreed style but each bouquet is unique.
        </li>
        <li>
          Damage that happens after pickup, including wilting from heat or
          rough handling.
        </li>
        <li>
          Change of mind after the 48-hour cancellation window.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email{" "}
        <a href="mailto:petalsbydar@gmail.com">petalsbydar@gmail.com</a> with
        your order confirmation and a brief description of the issue. We
        respond within 1-2 business days. Approved refunds are processed back
        to the original payment method through Square and typically take 5-10
        business days to appear.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:petalsbydar@gmail.com">petalsbydar@gmail.com</a>.
      </p>
    </>
  );
}
