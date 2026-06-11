import { NextResponse } from "next/server";

// Apple verifies domain ownership for Apple Pay by fetching a static file at
//   /.well-known/apple-developer-merchantid-domain-association
// Square generates the file contents in the Developer Dashboard under the
// Apple Pay tab. Paste those contents verbatim into the
// APPLE_PAY_DOMAIN_ASSOCIATION env var (newlines preserved).
//
// Without this returning 200 with the exact body, Apple Pay domain
// verification fails and the Apple Pay button NEVER renders — even on Safari
// and your live HTTPS domain. A 404 here is the #1 silent cause of "Apple Pay
// isn't showing up."
export const dynamic = "force-static";

export function GET() {
  const body = process.env.APPLE_PAY_DOMAIN_ASSOCIATION?.trim();

  if (!body) {
    // Logged (not silent) so a missing config is visible in server logs when
    // Apple Pay mysteriously won't appear.
    console.error(
      "[apple-pay] APPLE_PAY_DOMAIN_ASSOCIATION is not set — Apple Pay domain " +
        "verification will fail and the button will not render. Paste the file " +
        "contents from Square Dashboard → Apple Pay into this env var.",
    );
    return new NextResponse("Apple Pay domain association not configured.", {
      status: 404,
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Apple re-fetches periodically; let it cache but stay reasonably fresh.
      "cache-control": "public, max-age=3600",
    },
  });
}
