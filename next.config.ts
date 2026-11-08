import type { NextConfig } from 'next';

const immutableCache = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const mediaHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  transpilePackages: ['three'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/fonts/:path*', headers: immutableCache },
      { source: '/sfx/:path*', headers: immutableCache },
      { source: '/media/:path*', headers: mediaHeaders },
    ];
  },
};

export default nextConfig;
