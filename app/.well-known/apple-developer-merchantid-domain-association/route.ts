import { NextResponse } from "next/server";

// Apple verifies domain ownership for Apple Pay by checking a static file
// at /.well-known/apple-developer-merchantid-domain-association.
// Square generates the file contents in the Developer Dashboard under
// the Apple Pay tab. Paste those contents (as a single string with newlines
// preserved) into the APPLE_PAY_DOMAIN_ASSOCIATION env var.
export async function GET() {
  const body = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;
  if (!body) {
    return new NextResponse("Not configured", { status: 404 });
  }
  return new NextResponse(body, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}
