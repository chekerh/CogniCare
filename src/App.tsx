import { useState, lazy, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { HealthStatusIndicator } from './components/common/HealthStatus';
import { ThemeSwitcher } from './components/common/ThemeSwitcher';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { Child } from './lib/supabase';
import { Heart } from 'lucide-react';
import { analytics } from './lib/analytics';
import { healthChecker } from './lib/healthCheck';

// Lazy load heavy components for code splitting
const CommunityFeed = lazy(() =>
  import('./components/feed/CommunityFeed').then((m) => ({ default: m.CommunityFeed })),
);
const SpecialistDirectory = lazy(() =>
  import('./components/directory/SpecialistDirectory').then((m) => ({
    default: m.SpecialistDirectory,
  })),
);
const ChildrenManager = lazy(() =>
  import('./components/children/ChildrenManager').then((m) => ({
    default: m.ChildrenManager,
  })),
);
const GamesZone = lazy(() =>
  import('./components/games/GamesZone').then((m) => ({ default: m.GamesZone })),
);
const Inbox = lazy(() =>
  import('./components/messaging/Inbox').then((m) => ({ default: m.Inbox })),
);
const GroupsManager = lazy(() =>
  import('./components/groups/GroupsManager').then((m) => ({
    default: m.GroupsManager,
  })),
);
const ReelsFeed = lazy(() =>
  import('./components/reels/ReelsFeed').then((m) => ({ default: m.ReelsFeed })),
);
const ChildDashboard = lazy(() =>
  import('./components/dashboard/ChildDashboard').then((m) => ({
    default: m.ChildDashboard,
  })),
);
const ConsultationsManager = lazy(() =>
  import('./components/consultations/ConsultationsManager').then((m) => ({
    default: m.ConsultationsManager,
  })),
);
const AdminPanel = lazy(() =>
  import('./components/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })),
);
const ParentChildStats = lazy(() =>
  import('./components/children/ParentChildStats').then((m) => ({
    default: m.ParentChildStats,
  })),
);

function AppContentInner() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { direction, t } = useLanguage();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('feed');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Initialize analytics and health checks
  useEffect(() => {
    // Track page views
    analytics.pageView(window.location.pathname);

    // Start periodic health checks
    healthChecker.startPeriodicCheck(60000); // Check every minute

    return () => {
      healthChecker.stopPeriodicCheck();
    };
  }, []);

  // Track view changes
  useEffect(() => {
    if (user) {
      analytics.track({ name: 'view_changed', properties: { view: currentView } });
    }
  }, [currentView, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 pooh:from-pooh-cream pooh:to-pooh-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white dark:text-gray-900 pooh:text-pooh-brown-dark" />
          </div>
          <p className="text-teal-600 dark:text-teal-400 pooh:text-pooh-brown-dark font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2">Cognicare</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
              منصة دعم شاملة لأمهات الأطفال ذوي الاحتياجات الخاصة
            </p>
          </div>

          {authView === 'login' ? (
            <LoginForm
              onSuccess={() => setCurrentView('feed')}
              onSwitchToSignup={() => setAuthView('signup')}
            />
          ) : (
            <SignupForm
              onSuccess={() => setAuthView('login')}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}

          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
            <p>منصة آمنة ومشفرة لحماية خصوصيتك وخصوصية أطفالك</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pooh:bg-pooh-cream relative ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="relative z-10">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <div className="fixed bottom-4 left-4 z-40">
        <HealthStatusIndicator />
      </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" role="main">
        <Suspense fallback={<LoadingSkeleton />}>
          {currentView === 'feed' && <CommunityFeed />}
          {currentView === 'directory' && <SpecialistDirectory />}
          {currentView === 'children' && <ChildrenManager />}
          {currentView === 'games' && <GamesZone />}
          {currentView === 'messages' && <Inbox />}
          {currentView === 'groups' && <GroupsManager />}
          {currentView === 'reels' && <ReelsFeed />}
          {currentView === 'dashboard' && user.role === 'mother' && (
            selectedChild ? (
              <ChildDashboard child={selectedChild} onBack={() => setSelectedChild(null)} />
            ) : (
              <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">{t('nav.dashboard')}</h2>
                <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-4">{t('dashboard.selectChild')}</p>
                <Suspense fallback={<LoadingSkeleton />}>
                  <ChildrenManager onSelectChild={setSelectedChild} />
                </Suspense>
              </div>
            )
          )}
          {currentView === 'consultations' && <ConsultationsManager />}
          {currentView === 'profile' && (
            <div
              className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-8 text-center"
              role="region"
              aria-label={t('nav.profile')}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">{t('nav.profile')}</h2>
              <div className="space-y-3 text-right max-w-md mx-auto">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">{t('profile.name')}:</span>
                  <span className="mr-2 text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{user.full_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">{t('profile.email')}:</span>
                  <span className="mr-2 text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">{t('profile.role')}:</span>
                  <span className="mr-2 text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">
                    {user.role === 'mother' ? t('role.mother') : user.role === 'specialist' ? t('role.specialist') : user.role === 'volunteer' ? t('role.volunteer') : t('role.admin')}
                  </span>
                </div>
                {user.location && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">{t('profile.location')}:</span>
                    <span className="mr-2 text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{user.location}</span>
                  </div>
                )}
              </div>

              {user.role === 'mother' && (
                <Suspense fallback={<LoadingSkeleton />}>
                  <ParentChildStats />
                </Suspense>
              )}

              {/* Theme and Language Settings */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4 text-center">
                  الإعدادات
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">المظهر:</span>
                    <ThemeSwitcher />
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">اللغة:</span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentView === 'admin' && user.role === 'admin' && <AdminPanel />}
        </Suspense>
      </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <AppContentInner />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
