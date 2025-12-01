// Analytics utility - supports multiple providers
// Set VITE_ANALYTICS_ENABLED=true in .env to enable

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean;
  private provider: 'none' | 'google' | 'plausible' | 'custom';

  constructor() {
    this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.provider = (import.meta.env.VITE_ANALYTICS_PROVIDER as any) || 'none';

    if (this.enabled && this.provider === 'google') {
      this.initGoogleAnalytics();
    } else if (this.enabled && this.provider === 'plausible') {
      this.initPlausible();
    }
  }

  private initGoogleAnalytics() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) {
      console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not set');
      return;
    }

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    const dataLayer = (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      page_path: window.location.pathname,
    });
  }

  private initPlausible() {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (!domain) {
      console.warn('Plausible: VITE_PLAUSIBLE_DOMAIN not set');
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) return;

    switch (this.provider) {
      case 'google':
        if ((window as any).gtag) {
          (window as any).gtag('event', event.name, event.properties);
        }
        break;
      case 'plausible':
        if ((window as any).plausible) {
          (window as any).plausible(event.name, { props: event.properties });
        }
        break;
      case 'custom':
        // Send to custom endpoint
        this.sendToCustomEndpoint(event);
        break;
    }

    // Always log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event);
    }
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (!endpoint) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  pageView(path: string) {
    if (!this.enabled) return;

    this.track({
      name: 'page_view',
      properties: { path },
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Helper hooks for React components
export function useAnalytics() {
  return {
    track: (name: string, properties?: Record<string, any>) => {
      analytics.track({ name, properties });
    },
    pageView: (path: string) => {
      analytics.pageView(path);
    },
  };
}

