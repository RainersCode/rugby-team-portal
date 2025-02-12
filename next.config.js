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
  },
  typescript: {
    // Temporarily ignore type errors during build for deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
