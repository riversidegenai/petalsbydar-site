import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

// Constant-time string comparison. Middleware runs on the Edge runtime where
// Node's crypto.timingSafeEqual isn't available, so we compare byte-by-byte
// with no early exit to avoid leaking the password length/prefix via timing.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare against the max length so the loop count doesn't reveal which input
  // is longer; mismatched lengths still fail via the length diff in `mismatch`.
  const len = Math.max(ab.length, bb.length);
  let mismatch = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    mismatch |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Petals admin"' },
  });
}

function forbidden() {
  return new NextResponse("Forbidden", { status: 403 });
}

export function middleware(req: NextRequest) {
  // Block any request that hits /api/* without the Cloudflare origin secret.
  // Cloudflare injects x-origin-secret on every proxied request via a
  // Request Header Transform Rule. Direct-to-origin hits lack this header
  // and are rejected before any serverless function starts.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const cfSecret = process.env.CF_SECRET;
    const incomingSecret = req.headers.get("x-origin-secret");
    if (cfSecret && !timingSafeEqual(incomingSecret ?? "", cfSecret)) {
      return forbidden();
    }
  }

  // Basic auth only applies to /admin routes, not /api routes.
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Fail closed: if no admin password is configured, the admin area is locked,
  // not wide open. (Previously an unset password let everyone through.)
  if (!adminPassword) {
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(auth.slice(6));
    } catch {
      return unauthorized();
    }
    const sep = decoded.indexOf(":");
    const pass = sep === -1 ? "" : decoded.slice(sep + 1);
    if (timingSafeEqual(pass, adminPassword)) {
      return NextResponse.next();
    }
  }

  return unauthorized();
}
