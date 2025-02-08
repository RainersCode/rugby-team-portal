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
    ],
    domains: ["www.thesportsdb.com", "thesportsdb.com", "placehold.co"],
  },
};

module.exports = nextConfig;
