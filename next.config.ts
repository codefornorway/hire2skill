import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
/** React dev tooling reconstructs stacks via eval(); production builds never need this. */
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.28.16.1', '192.168.1.9'],
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      { source: '/post-job', destination: '/post', permanent: true },
      { source: '/post-a-job', destination: '/post', permanent: true },
      { source: '/create-job', destination: '/post', permanent: true },
      { source: '/new-job', destination: '/post', permanent: true },
      { source: '/jobs/new', destination: '/post', permanent: true },
      { source: '/create-task', destination: '/post', permanent: true },
      { source: '/new-task', destination: '/post', permanent: true },
      { source: '/find-jobs', destination: '/jobs', permanent: true },
      { source: '/find-job', destination: '/jobs', permanent: true },
      { source: '/find-work', destination: '/jobs', permanent: true },
      { source: '/browse-jobs', destination: '/jobs', permanent: true },
      { source: '/job-listings', destination: '/jobs', permanent: true },
      { source: '/work', destination: '/jobs', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), camera=(), microphone=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              scriptSrc,
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co wss://*.supabase.net https://api.resend.com https://nominatim.openstreetmap.org https://api.mapbox.com https://www.google.com https://maps.apple.com",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'berwgzaynhmlfqaiexma.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'berwgzaynhmlfqaiexma.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
