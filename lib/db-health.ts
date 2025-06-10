import prisma from "@/lib/db";

interface ConnectionHealth {
  isHealthy: boolean;
  latency: number;
  error?: string;
  timestamp: Date;
}

class DatabaseHealthMonitor {
  private lastHealthCheck: ConnectionHealth | null = null;
  private healthCheckInterval: number = 30000; // 30 seconds
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  async checkConnection(): Promise<ConnectionHealth> {
    const startTime = Date.now();
    
    try {
      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1 as test`;
      
      const latency = Date.now() - startTime;
      const health: ConnectionHealth = {
        isHealthy: true,
        latency,
        timestamp: new Date()
      };
      
      this.lastHealthCheck = health;
      return health;
      
    } catch (error) {
      const latency = Date.now() - startTime;
      const health: ConnectionHealth = {
        isHealthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      
      this.lastHealthCheck = health;
      return health;
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'Database operation'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`${operationName}: Attempt ${attempt}/${this.maxRetries}`);
        
        // Check connection health before important operations
        if (attempt > 1) {
          const health = await this.checkConnection();
          if (!health.isHealthy) {
            console.warn(`Connection unhealthy (latency: ${health.latency}ms): ${health.error}`);
          }
        }
        
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`${operationName}: Succeeded on attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`${operationName}: Attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on certain types of errors
        if (this.shouldNotRetry(lastError)) {
          console.log(`${operationName}: Not retrying due to error type`);
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`${operationName}: Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`${operationName}: All ${this.maxRetries} attempts failed`);
    throw lastError || new Error(`${operationName} failed after ${this.maxRetries} attempts`);
  }

  private shouldNotRetry(error: Error): boolean {
    const noRetryPatterns = [
      'Argument validation failed',
      'Invalid input',
      'Record not found',
      'Unique constraint',
    ];
    
    return noRetryPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  getLastHealthCheck(): ConnectionHealth | null {
    return this.lastHealthCheck;
  }

  isConnectionHealthy(): boolean {
    if (!this.lastHealthCheck) return true; // Assume healthy if never checked
    
    const timeSinceCheck = Date.now() - this.lastHealthCheck.timestamp.getTime();
    const isRecent = timeSinceCheck < this.healthCheckInterval * 2; // Within 2 intervals
    
    return this.lastHealthCheck.isHealthy && isRecent;
  }
}

// Global instance
const dbHealth = new DatabaseHealthMonitor();

// Utility functions
export async function executeWithConnectionRetry<T>(
  operation: () => Promise<T>,
  operationName?: string
): Promise<T> {
  return dbHealth.executeWithRetry(operation, operationName);
}

export async function checkDatabaseHealth(): Promise<ConnectionHealth> {
  return dbHealth.checkConnection();
}

export function getDatabaseHealthStatus(): ConnectionHealth | null {
  return dbHealth.getLastHealthCheck();
}

export function isDatabaseHealthy(): boolean {
  return dbHealth.isConnectionHealthy();
}

// Quick connection test with timeout
export async function quickConnectionTest(timeoutMs: number = 5000): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout')), timeoutMs);
    });
    
    const testPromise = prisma.$queryRaw`SELECT 1 as test`;
    
    await Promise.race([testPromise, timeoutPromise]);
    return true;
    
  } catch (error) {
    console.warn('Quick connection test failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

export default dbHealth; 