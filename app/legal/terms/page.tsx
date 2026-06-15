import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Petals by Dar",
  description: "Terms and conditions for ordering from Petals by Dar.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-xs uppercase tracking-widest text-blush-700">
        Last updated: June 14, 2026
      </p>

      <p>
        Welcome to Petals by Dar. By placing an order or using this website,
        you agree to these Terms.
      </p>

      <h2>About our bouquets</h2>
      <p>
        Every bouquet is hand-made to order. Because flowers and materials vary
        with the season and supply, your finished bouquet may look slightly
        different from the photos shown on the site. We do our best to match
        the style, color palette, and feel you choose.
      </p>

      <h2>Ordering and deposits</h2>
      <ul>
        <li>
          A non-refundable deposit is required to confirm your order. The
          remaining balance is due at pickup.
        </li>
        <li>
          We reserve the right to decline or cancel an order — for example, if
          we cannot source the requested flowers in time. If we cancel, you
          will receive a full refund including the deposit.
        </li>
        <li>
          Custom requests must be submitted at least 48 hours before pickup.
          Same-day orders are not guaranteed.
        </li>
      </ul>

      <h2>Pickup</h2>
      <p>
        Bouquets are available for pickup at a location and time confirmed at
        order time. If you do not pick up your bouquet within 24 hours of the
        confirmed time, the bouquet is forfeit and the deposit is not
        refundable.
      </p>

      <h2>Payment</h2>
      <p>
        Payments are processed by Square. By placing an order, you confirm
        that you are authorized to use the payment method provided. All prices
        are listed in U.S. dollars.
      </p>

      <h2>Photos and content</h2>
      <p>
        You may submit inspiration photos to help us understand your vision.
        By uploading a photo, you confirm you have the right to share it. We
        may use photos of finished bouquets we create on our website and
        social media unless you ask us not to.
      </p>

      <h2>Site content</h2>
      <p>
        All photos, text, and designs on this site are the property of Petals
        by Dar and may not be copied or reused without permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Petals by Dar is not responsible for allergic reactions, perishability
        after pickup, or any damages beyond the price of the bouquet itself.
        Fresh flowers are perishable; please follow any care instructions
        provided.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms occasionally. The &quot;Last updated&quot;
        date will reflect any changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:petalsbydar@gmail.com">petalsbydar@gmail.com</a>.
      </p>
    </>
  );
}
