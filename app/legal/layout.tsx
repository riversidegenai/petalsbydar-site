export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 text-ink">
      <div className="prose-legal space-y-4 text-sm leading-relaxed text-ink-soft [&_h1]:serif [&_h1]:text-3xl [&_h1]:text-ink [&_h1]:mb-2 [&_h2]:serif [&_h2]:text-xl [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-blush-700 [&_a]:underline [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_strong]:text-ink">
        {children}
      </div>
    </article>
  );
}
