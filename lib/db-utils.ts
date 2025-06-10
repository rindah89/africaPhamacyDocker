import prisma from "./db";

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Executes a database operation with retry logic and proper error handling
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;

      // Log the error for debugging
      console.error(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, {
        error: error.message,
        code: error.code,
        meta: error.meta
      });

      // Don't retry on certain errors
      if (shouldNotRetry(error)) {
        break;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new DatabaseError(
    `Database operation failed after ${maxRetries + 1} attempts: ${lastError.message}`,
    lastError
  );
}

/**
 * Determines if an error should not be retried
 */
function shouldNotRetry(error: any): boolean {
  // Don't retry on validation errors or constraint violations
  const nonRetryableCodes = [
    'P2002', // Unique constraint failed
    'P2003', // Foreign key constraint failed
    'P2004', // A constraint failed on the database
    'P2005', // The value stored in the database is invalid
    'P2006', // The provided value is invalid
    'P2007', // Data validation error
    'P2014', // The change you are trying to make would violate required relation
    'P2016', // Query interpretation error
    'P2017', // The records for relation are not connected
    'P2018', // The required connected records were not found
    'P2019', // Input error
    'P2020', // Value out of range
    'P2021', // The table does not exist
    'P2022', // The column does not exist
    'P2025', // An operation failed because it depends on one or more records that were required but not found
  ];

  return nonRetryableCodes.includes(error.code);
}

/**
 * Safely executes a database query with connection handling
 */
export async function safeDbQuery<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database operation'
): Promise<T> {
  try {
    return await withRetry(operation, {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 2000
    });
  } catch (error: any) {
    console.error(`${operationName} failed:`, error);
    
    // Try to reconnect if it's a connection error
    if (isConnectionError(error)) {
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('Database reconnected successfully');
        
        // Try the operation one more time after reconnection
        return await operation();
      } catch (reconnectError) {
        console.error('Failed to reconnect to database:', reconnectError);
        throw new DatabaseError(`${operationName} failed and reconnection failed`, error);
      }
    }
    
    throw new DatabaseError(`${operationName} failed`, error);
  }
}

/**
 * Checks if an error is related to connection issues
 */
function isConnectionError(error: any): boolean {
  const connectionErrorPatterns = [
    'forcibly closed',
    'connection was forcibly closed',
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'Lost connection',
    'Connection lost',
    'Too many connections',
    'Can\'t reach database server'
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  const errorMeta = error.meta?.message?.toLowerCase() || '';
  
  return connectionErrorPatterns.some(pattern => 
    errorMessage.includes(pattern.toLowerCase()) || 
    errorMeta.includes(pattern.toLowerCase())
  );
}

/**
 * Gracefully handles database disconnection
 */
export async function gracefulDisconnect(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected gracefully');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Database transaction wrapper with retry logic
 */
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return await withRetry(async () => {
    return await prisma.$transaction(operation);
  }, options);
} 