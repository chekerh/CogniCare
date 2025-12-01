// Health check utility for monitoring application status

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    database: 'up' | 'down' | 'slow';
    storage: 'up' | 'down' | 'slow';
    auth: 'up' | 'down' | 'slow';
  };
  metrics: {
    responseTime: number;
    errorRate: number;
  };
}

class HealthChecker {
  private lastCheck: HealthStatus | null = null;
  private checkInterval: number | null = null;

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const services: HealthStatus['services'] = {
      database: 'up',
      storage: 'up',
      auth: 'up',
    };

    try {
      // Check database connection
      const { supabase } = await import('./supabase');
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('users').select('id').limit(1);
      const dbTime = Date.now() - dbStart;

      if (dbError) {
        services.database = 'down';
      } else if (dbTime > 1000) {
        services.database = 'slow';
      }

      // Check storage
      const storageStart = Date.now();
      const { error: storageError } = await supabase.storage.from('reels').list('', { limit: 1 });
      const storageTime = Date.now() - storageStart;

      if (storageError && storageError.message !== 'The resource was not found') {
        services.storage = 'down';
      } else if (storageTime > 2000) {
        services.storage = 'slow';
      }

      // Check auth
      const authStart = Date.now();
      await supabase.auth.getSession();
      const authTime = Date.now() - authStart;

      if (authTime > 1000) {
        services.auth = 'slow';
      }
    } catch (error) {
      console.error('Health check error:', error);
      services.database = 'down';
    }

    const responseTime = Date.now() - startTime;
    const errorRate = Object.values(services).filter(s => s === 'down').length / Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (errorRate === 0 && Object.values(services).every(s => s === 'up')) {
      status = 'healthy';
    } else if (errorRate < 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: Date.now(),
      services,
      metrics: {
        responseTime,
        errorRate,
      },
    };

    this.lastCheck = healthStatus;
    return healthStatus;
  }

  getLastCheck(): HealthStatus | null {
    return this.lastCheck;
  }

  startPeriodicCheck(intervalMs: number = 60000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.checkHealth();

    // Periodic checks
    this.checkInterval = window.setInterval(() => {
      this.checkHealth();
    }, intervalMs);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const healthChecker = new HealthChecker();

// Expose health check endpoint for monitoring
export async function getHealthStatus(): Promise<HealthStatus> {
  return healthChecker.checkHealth();
}

