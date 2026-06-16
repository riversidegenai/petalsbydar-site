import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Content Security Policy.
//
// The Square Web Payments SDK (card, Apple Pay, Cash App Pay) loads scripts,
// iframes, fonts and images from Square's CDNs and talks to Square + Sentry.
// Cash App Pay in particular pulls the CashSans font from cash-f.squarecdn.com,
// so we allow the *.squarecdn.com / *.squareup.com wildcards rather than the
// handful of literal hosts Square documents — that also future-proofs against
// Square adding sibling subdomains. See:
// https://developer.squareup.com/docs/web-payments/content-security-policy
const csp = [
  "default-src 'self'",
  // Square SDK is loaded from squarecdn; 'unsafe-eval' is required by the SDK.
  // Square SDK + Cloudflare Web Analytics beacon (cloudflareinsights).
  // web.squarecdn.com listed explicitly in addition to the wildcard because some
  // browsers do not treat *.squarecdn.com as matching the bare subdomain.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.squarecdn.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squareup.com https://js.squareup.com https://static.cloudflareinsights.com",
  // Square injects inline styles into its iframes.
  "style-src 'self' 'unsafe-inline' https://*.squarecdn.com https://cash-f.squarecdn.com",
  // CashSans + Square fonts. cash-f.squarecdn.com listed explicitly because
  // some browsers do not apply *.squarecdn.com wildcards to all subdomains.
  "font-src 'self' data: https://*.squarecdn.com https://cash-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
  // Button/wallet artwork + customer inspiration photos stored in Cloudflare R2
  // (public r2.dev bucket URL). If you attach a custom domain to the bucket
  // (e.g. media.petalsbydar.com), add it here too.
  "img-src 'self' data: blob: https://*.squarecdn.com https://cash-f.squarecdn.com https://*.squareup.com https://*.public.blob.vercel-storage.com https://*.r2.dev",
  // Tokenization + telemetry endpoints.
  // Sentry uses both *.ingest.sentry.io and *.ingest.us.sentry.io depending on
  // the org region — wildcard both so it works regardless of which DSN is used.
  "connect-src 'self' https://*.squarecdn.com https://web.squarecdn.com https://*.squareup.com https://connect.squareup.com https://pci-connect.squareup.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  // The hosted card/wallet iframes and the Cash App Pay frame.
  "frame-src 'self' https://*.squarecdn.com https://web.squarecdn.com https://*.squareup.com https://connect.squareup.com",
  "child-src 'self' https://*.squarecdn.com https://*.squareup.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Cloudflare R2 public bucket (inspiration photos). Add your custom
      // domain here too if you attach one to the bucket.
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "riverside-ai",
  project: "petalsbydar-site",
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
});
