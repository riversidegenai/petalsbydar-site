import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const filename = url.searchParams.get("filename");
  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ error: "Missing body" }, { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured (set BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }

  const blob = await put(`inspiration/${Date.now()}-${filename}`, req.body, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
