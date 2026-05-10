import Stepper from "./Stepper";

type Step = "service" | "details" | "booking";

export default function OrderShell({
  step,
  children,
}: {
  step: Step;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <span className="pill">Order</span>
      <h1 className="serif mt-4 text-4xl leading-tight md:text-5xl">Order your bouquet</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">
        Pick the kind of bouquet, tell us a little about who it&apos;s for, then book a pickup time and pay your deposit through Square. Pay the rest when you pick it up.
      </p>
      <div className="mt-8">
        <Stepper current={step} />
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
