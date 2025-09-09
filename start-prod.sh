#!/bin/sh
# Production startup script

echo "Starting Africa Pharmacy application..."

# Wait for MongoDB
echo "Waiting for MongoDB..."
while ! nc -z mongodb 27017; do
  echo "MongoDB not ready, waiting..."
  sleep 2
done
echo "MongoDB is ready!"

# Ensure required files exist
if [ ! -f /app/.next/BUILD_ID ]; then
  echo "Creating BUILD_ID..."
  echo "docker-$(date +%s)" > /app/.next/BUILD_ID
fi

if [ ! -f /app/.next/prerender-manifest.json ]; then
  echo "Creating prerender-manifest.json..."
  echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{}}' > /app/.next/prerender-manifest.json
fi

if [ ! -f /app/.next/routes-manifest.json ]; then
  echo "Creating routes-manifest.json..."
  echo '{"version":4,"pages404":true,"basePath":"","redirects":[],"rewrites":{"beforeFiles":[],"afterFiles":[],"fallback":[]},"headers":[]}' > /app/.next/routes-manifest.json
fi

# Start Next.js
echo "Starting Next.js application..."
npm start