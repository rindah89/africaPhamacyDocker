# Multi-stage build for production-ready Next.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and npm config
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --legacy-peer-deps --omit=dev || npm install --legacy-peer-deps --omit=dev

# Install ALL dependencies for build stage
FROM base AS deps-all
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps-all /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# Set a dummy DATABASE_URL for build time (Prisma needs it for generation)
ENV DATABASE_URL="mongodb://dummy:dummy@dummy:27017/dummy?authSource=admin"

# Skip static generation during build
ENV SKIP_BUILD_STATIC_GENERATION=1

# Generate Prisma Client
RUN npx prisma generate

# Build the application using our custom Docker build script
COPY scripts/docker-build.js scripts/
RUN node scripts/docker-build.js

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=deps-all /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Make start.sh executable
RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server using our start script
CMD ["./start.sh"]