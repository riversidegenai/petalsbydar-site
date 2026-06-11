import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// Keep-alive endpoint hit by a Vercel Cron job (see vercel.json) once a day.
// Free-tier Supabase auto-pauses a project after ~7 days with no activity,
// which silently breaks checkout. A trivial daily query is enough to keep the
// project counted as "active" so it never pauses.
//
// Protected by CRON_SECRET: Vercel automatically sends it as a Bearer token on
// cron invocations. If CRON_SECRET is unset we still allow the call (so it
// can't lock itself out), but setting it is recommended.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
  } catch (err) {
    console.error("[keep-alive] database ping failed:", err);
    return NextResponse.json(
      { ok: false, error: "Database ping failed" },
      { status: 503 },
    );
  }
}
