import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getBouquet, formatUSD } from "@/lib/bouquets";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="serif text-3xl">Admin not configured</h1>
        <p className="mt-3 text-sm text-ink-soft">Set ADMIN_PASSWORD in your environment.</p>
      </section>
    );
  }

  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="serif text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-ink-soft">{rows.length} most recent</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-blush-200 bg-white/70">
        <table className="w-full text-sm">
          <thead className="bg-blush-50 text-left text-xs uppercase tracking-wider text-blush-700">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Bouquet</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Style / Notes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Deposit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const b = getBouquet(r.bouquetType);
              return (
                <tr key={r.id} className="border-t border-blush-100 align-top">
                  <td className="px-4 py-3 text-xs text-ink-soft">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{b?.name ?? r.bouquetType}</td>
                  <td className="px-4 py-3">
                    <div>{r.customerName}</div>
                    <div className="text-xs text-blush-700">{r.phone} · {r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.galleryStyle && (
                      <div className="text-blush-800">{r.galleryStyle}</div>
                    )}
                    {r.notes && (
                      <div className="mt-1 max-w-xs text-ink-soft">{r.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pill ${r.status === "booked" ? "bg-green-50 border-green-200 text-green-800" : ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatUSD(r.depositAmountCents)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-soft">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
