import { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { checkRateLimit, formatRetryAfter, RateLimitConfig } from '../../lib/rateLimit';

interface RateLimitIndicatorProps {
  action: string;
  config: RateLimitConfig;
  onRateLimitExceeded?: () => void;
}

export function RateLimitIndicator({
  action,
  config,
  onRateLimitExceeded,
}: RateLimitIndicatorProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } | null>(null);

  useEffect(() => {
    const result = checkRateLimit(action, config);
    setRateLimitInfo({
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter,
    });

    if (!result.allowed && onRateLimitExceeded) {
      onRateLimitExceeded();
    }
  }, [action, config, onRateLimitExceeded]);

  if (!rateLimitInfo) return null;

  if (rateLimitInfo.retryAfter) {
    return (
      <div
        className="flex items-center space-x-2 space-x-reverse bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm"
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>
          تم تجاوز الحد المسموح. يرجى المحاولة مرة أخرى بعد{' '}
          {formatRetryAfter(rateLimitInfo.retryAfter)}
        </span>
      </div>
    );
  }

  if (rateLimitInfo.remaining < 3 && rateLimitInfo.remaining > 0) {
    return (
      <div
        className="flex items-center space-x-2 space-x-reverse bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded text-xs"
        role="status"
        aria-live="polite"
      >
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span>متبقي {rateLimitInfo.remaining} محاولة</span>
      </div>
    );
  }

  return null;
}

