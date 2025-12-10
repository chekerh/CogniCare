import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';
import { getHealthStatus, HealthStatus } from '../../lib/healthCheck';
import { useLanguage } from '../../contexts/LanguageContext';

export function HealthStatusIndicator() {
  const { t } = useLanguage();
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
      <div className="flex items-center space-x-2 space-x-reverse text-gray-500 dark:text-gray-400 pooh:text-pooh-brown text-xs">
        <Activity className="w-3 h-3 animate-pulse" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  const icons = {
    healthy: CheckCircle,
    degraded: AlertCircle,
    unhealthy: XCircle,
  };

  const colors = {
    healthy: 'text-green-600 dark:text-green-400 pooh:text-green-600',
    degraded: 'text-yellow-600 dark:text-yellow-400 pooh:text-pooh-yellow-dark',
    unhealthy: 'text-red-600 dark:text-red-400 pooh:text-pooh-red',
  };

  const statusLabels = {
    healthy: t('health.healthy'),
    degraded: t('health.degraded'),
    unhealthy: t('health.unhealthy'),
  };

  const Icon = icons[health.status];
  const colorClass = colors[health.status];
  const statusLabel = statusLabels[health.status];

  return (
    <div
      className={`flex items-center space-x-2 space-x-reverse ${colorClass} text-xs`}
      role="status"
      aria-live="polite"
      title={`${t('health.status')}: ${statusLabel}`}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">
        {statusLabel}
      </span>
    </div>
  );
}

