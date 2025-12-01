// Rate limiting utility for API calls
interface RateLimitState {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = config.key || identifier;
  const state = rateLimitStore.get(key);

  // Clean up expired entries
  if (state && state.resetTime < now) {
    rateLimitStore.delete(key);
  }

  const currentState = rateLimitStore.get(key);

  if (!currentState) {
    // First request in window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (currentState.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((currentState.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentState.resetTime,
      retryAfter,
    };
  }

  // Increment count
  currentState.count++;
  rateLimitStore.set(key, currentState);

  return {
    allowed: true,
    remaining: config.maxRequests - currentState.count,
    resetTime: currentState.resetTime,
  };
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes} دقيقة`;
}

