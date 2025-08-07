/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://africapharmacy.health' : '',
  
  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'react-icons'
    ],
  },

  // Turbopack configuration (moved from experimental.turbo as it's now stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      );
    }

    // Optimize for client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Tree shaking optimizations - let Next.js handle usedExports internally
    if (config.optimization.sideEffects === undefined) {
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // Output optimization
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Power optimizations
  poweredByHeader: false,
  
  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "aprail.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  headers: async () => {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ];
  },
}

module.exports = nextConfig 