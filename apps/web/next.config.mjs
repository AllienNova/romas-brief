/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF first, WebP fallback (Next defaults to webp only). SHIP-24a.
    formats: ['image/avif', 'image/webp'],
    // Article thumbnails are served from R2/CDN. The exact public host is
    // provisioned at deploy (P-10 R2 + SHIP-31); extend remotePatterns then.
    // NOTE: on Cloudflare Pages the default Node image optimizer does not run
    // — wire a Cloudflare image loader (or set unoptimized) at SHIP-31.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'cdn.romasbrief.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '1mb' }
  }
};

export default nextConfig;
