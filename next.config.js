/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wlfcjbqqfdrnfhzzpjeg.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    domains: ['www.thesportsdb.com', 'thesportsdb.com'],
  },
}

module.exports = nextConfig 
