// Docker build script that skips static generation
process.env.SKIP_BUILD_STATIC_GENERATION = '1';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://dummy:dummy@dummy:27017/dummy?authSource=admin';

// Import and run Next.js build
require('next/dist/build').default(process.cwd(), {
  lint: false,
  buildMode: 'production',
  // Skip static page generation
  skipValidation: true
}).catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});