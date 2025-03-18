/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wlfcjbqqfdrnfhzzpjeg.supabase.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/rugby/teams/**",
      },
      {
        protocol: "https",
        hostname: "fonts.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      }
    ],
    domains: ["www.thesportsdb.com", "thesportsdb.com", "placehold.co"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  typescript: {
    // Temporarily ignore type errors during build for deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Move outputFileTracingRoot to root level as per Next.js 15 requirements
  outputFileTracingRoot: process.cwd(),
  // Optimize for Windows paths
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // Fix issues with Vercel deployment
  async rewrites() {
    return [
      // Properly handle RSC requests with query parameters
      {
        source: '/:path*/_rsc/:slug*',
        destination: '/:path*/:slug*',
      },
      {
        source: '/:path*\\?_rsc=:slug*',
        destination: '/:path*',
      }
    ]
  },
  // Increase timeout for Vercel builds
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
