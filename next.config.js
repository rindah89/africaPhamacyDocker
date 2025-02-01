/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://karenpharmacy.health' : '',
  images: {
    domains: ['res.cloudinary.com', 'uploadthing.com', 'kpbojongo.com'], // Add your image domains here
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
   
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 