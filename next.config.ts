import type { NextConfig } from "next";

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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.squarecdn.com https://*.squareup.com https://js.squareup.com",
  // Square injects inline styles into its iframes.
  "style-src 'self' 'unsafe-inline' https://*.squarecdn.com",
  // CashSans + Square fonts, incl. the cloudfront mirror Square documents.
  "font-src 'self' data: https://*.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
  // Button/wallet artwork.
  "img-src 'self' data: blob: https://*.squarecdn.com https://*.squareup.com https://*.public.blob.vercel-storage.com",
  // Tokenization + telemetry endpoints.
  "connect-src 'self' https://*.squarecdn.com https://*.squareup.com https://pci-connect.squareup.com https://o160250.ingest.sentry.io",
  // The hosted card/wallet iframes and the Cash App Pay frame.
  "frame-src 'self' https://*.squarecdn.com https://*.squareup.com",
  "child-src 'self' https://*.squarecdn.com https://*.squareup.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
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

export default nextConfig;
