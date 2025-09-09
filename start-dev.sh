#!/bin/sh
# Development startup script for MongoDB-based app

echo "Starting Africa Pharmacy application in development mode..."

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017; do
  echo "MongoDB is not ready yet, waiting..."
  sleep 2
done

echo "MongoDB is ready!"

# Generate Prisma Client (MongoDB doesn't use migrations)
echo "Generating Prisma Client..."
npx prisma generate || echo "Prisma Client already generated"

# Start the application in dev mode
echo "Starting Next.js in development mode..."
npm run dev