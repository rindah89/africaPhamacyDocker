#!/bin/sh
# Simple startup script for MongoDB-based app (no migrations needed)

echo "Starting Africa Pharmacy application..."

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017; do
  echo "MongoDB is not ready yet, waiting..."
  sleep 2
done

echo "MongoDB is ready!"

# Ensure .next directory exists
mkdir -p /app/.next

# Create prerender-manifest.json if it doesn't exist
if [ ! -f /app/.next/prerender-manifest.json ]; then
  echo "Creating prerender-manifest.json..."
  echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > /app/.next/prerender-manifest.json
fi

# Create routes-manifest.json if it doesn't exist
if [ ! -f /app/.next/routes-manifest.json ]; then
  echo "Creating routes-manifest.json..."
  echo '{"version":4,"pages404":true,"caseSensitive":false,"basePath":"","redirects":[],"rewrites":{"beforeFiles":[],"afterFiles":[],"fallback":[]},"headers":[]}' > /app/.next/routes-manifest.json
fi

# Start the Next.js application
echo "Starting Next.js application..."
if [ -f "/app/server.js" ]; then
  echo "Starting standalone server..."
  node server.js
else
  echo "Starting with npm..."
  npm start
fi