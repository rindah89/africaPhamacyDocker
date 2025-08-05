import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized configuration for MongoDB serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Optimize for serverless
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection optimization for MongoDB serverless
export async function connectDB() {
  try {
    await prisma.$connect()
    return prisma
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

// Query with timeout wrapper for serverless
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 12000 // 12 seconds to stay under 15s limit
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

export default prisma
