import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Petals by Dar",
  description: "How Petals by Dar collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-xs uppercase tracking-widest text-blush-700">
        Last updated: June 14, 2026
      </p>

      <p>
        Petals by Dar (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
        respects your privacy. This policy explains what information we collect
        when you use our website and place an order, how we use it, and the
        choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order details:</strong> your name, email address, phone
          number, pickup date/time, bouquet selection, and any inspiration
          photos or notes you provide.
        </li>
        <li>
          <strong>Payment information:</strong> processed securely by Square.
          We never see or store your full card number.
        </li>
        <li>
          <strong>Site usage:</strong> basic analytics (pages visited, device
          type) to help us improve the site.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To prepare and fulfill your bouquet order.</li>
        <li>To contact you about your order (email or SMS).</li>
        <li>To process payments and issue refunds when needed.</li>
        <li>To improve our service and respond to inquiries.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share information only with service providers needed to run the
        site:
      </p>
      <ul>
        <li>
          <strong>Square</strong> — payment processing
        </li>
        <li>
          <strong>Resend</strong> — order confirmation emails
        </li>
        <li>
          <strong>Twilio</strong> — order notification SMS
        </li>
        <li>
          <strong>Vercel</strong> — website hosting and database
        </li>
      </ul>
      <p>
        We do not sell your personal information to anyone.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep order records for up to 7 years to meet tax and accounting
        requirements. You can request that we delete your contact information
        at any time by emailing us.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can opt out of SMS notifications by replying STOP.</li>
        <li>You can ask us to delete or update your information at any time.</li>
        <li>
          You can contact us with any privacy questions at{" "}
          <a href="mailto:petalsbydar@gmail.com">petalsbydar@gmail.com</a>.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies needed for the site to work (for example,
        to keep your order session active). We do not use advertising cookies.
      </p>

      <h2>Children</h2>
      <p>
        Our site is not directed to children under 13, and we do not knowingly
        collect information from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &quot;Last
        updated&quot; date at the top will reflect any changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email us at{" "}
        <a href="mailto:petalsbydar@gmail.com">petalsbydar@gmail.com</a>.
      </p>
    </>
  );
}
