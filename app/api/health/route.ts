import { NextResponse } from "next/server";
import { checkDatabaseHealth, getDatabaseHealthStatus, quickConnectionTest } from "@/lib/db-health";
import { cacheInvalidation } from "@/lib/smart-cache";

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Quick connection test
    const isConnected = await quickConnectionTest(3000); // 3 second timeout
    
    // Get cached health status
    const cachedHealth = getDatabaseHealthStatus();
    
    // Get cache statistics
    const cacheStats = cacheInvalidation.stats();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      database: {
        connected: isConnected,
        lastCheck: cachedHealth?.timestamp || null,
        lastLatency: cachedHealth?.latency || null,
        lastError: cachedHealth?.error || null
      },
      cache: {
        total: cacheStats.total,
        active: cacheStats.active,
        expired: cacheStats.expired,
        maxSize: cacheStats.maxSize,
        hitRate: cacheStats.active > 0 ? ((cacheStats.active / cacheStats.total) * 100).toFixed(1) + '%' : '0%'
      },
      services: {
        api: 'healthy',
        database: isConnected ? 'healthy' : 'unhealthy',
        cache: 'healthy'
      }
    };
    
    const statusCode = isConnected ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        error: 'Health check failed'
      },
      services: {
        api: 'degraded',
        database: 'unhealthy',
        cache: 'unknown'
      }
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Force a fresh health check
    const healthCheck = await checkDatabaseHealth();
    
    // Clean expired cache entries
    cacheInvalidation.cleanup();
    
    return NextResponse.json({
      status: 'health_check_completed',
      timestamp: new Date().toISOString(),
      database: {
        healthy: healthCheck.isHealthy,
        latency: healthCheck.latency,
        error: healthCheck.error || null
      },
      cache: {
        cleaned: true,
        stats: cacheInvalidation.stats()
      }
    });
    
  } catch (error) {
    console.error('Health check POST error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 