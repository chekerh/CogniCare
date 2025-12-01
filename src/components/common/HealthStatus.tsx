import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';
import { getHealthStatus, HealthStatus } from '../../lib/healthCheck';

export function HealthStatusIndicator() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const status = await getHealthStatus();
      setHealth(status);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !health) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse text-gray-500 text-xs">
        <Activity className="w-3 h-3 animate-pulse" />
        <span>جارٍ التحقق...</span>
      </div>
    );
  }

  const icons = {
    healthy: CheckCircle,
    degraded: AlertCircle,
    unhealthy: XCircle,
  };

  const colors = {
    healthy: 'text-green-600',
    degraded: 'text-yellow-600',
    unhealthy: 'text-red-600',
  };

  const Icon = icons[health.status];
  const colorClass = colors[health.status];

  return (
    <div
      className={`flex items-center space-x-2 space-x-reverse ${colorClass} text-xs`}
      role="status"
      aria-live="polite"
      title={`الحالة: ${health.status === 'healthy' ? 'سليم' : health.status === 'degraded' ? 'متراجع' : 'غير سليم'}`}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">
        {health.status === 'healthy' ? 'سليم' : health.status === 'degraded' ? 'متراجع' : 'غير سليم'}
      </span>
    </div>
  );
}

