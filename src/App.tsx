import { useState, lazy, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { HealthStatusIndicator } from './components/common/HealthStatus';
import { Child } from './lib/supabase';
import { Heart } from 'lucide-react';
import { analytics } from './lib/analytics';
import { healthChecker } from './lib/healthCheck';

// Lazy load heavy components for code splitting
const CommunityFeed = lazy(() => import('./components/feed/CommunityFeed').then(m => ({ default: m.CommunityFeed })));
const SpecialistDirectory = lazy(() => import('./components/directory/SpecialistDirectory').then(m => ({ default: m.SpecialistDirectory })));
const ChildrenManager = lazy(() => import('./components/children/ChildrenManager').then(m => ({ default: m.ChildrenManager })));
const GamesZone = lazy(() => import('./components/games/GamesZone').then(m => ({ default: m.GamesZone })));
const Inbox = lazy(() => import('./components/messaging/Inbox').then(m => ({ default: m.Inbox })));
const GroupsManager = lazy(() => import('./components/groups/GroupsManager').then(m => ({ default: m.GroupsManager })));
const ReelsFeed = lazy(() => import('./components/reels/ReelsFeed').then(m => ({ default: m.ReelsFeed })));
const ChildDashboard = lazy(() => import('./components/dashboard/ChildDashboard').then(m => ({ default: m.ChildDashboard })));
const ConsultationsManager = lazy(() => import('./components/consultations/ConsultationsManager').then(m => ({ default: m.ConsultationsManager })));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));

function AppContent() {
  const { user, loading } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-teal-600 font-medium">جاري التحميل...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Cognicare</h1>
            <p className="text-lg text-gray-600">
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

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>منصة آمنة ومشفرة لحماية خصوصيتك وخصوصية أطفالك</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <div className="fixed bottom-4 left-4 z-40">
        <HealthStatusIndicator />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">لوحات التقدم</h2>
                <p className="text-gray-600 mb-4">اختر طفلاً لعرض لوحة التقدم</p>
                <Suspense fallback={<LoadingSkeleton />}>
                  <ChildrenManager onSelectChild={setSelectedChild} />
                </Suspense>
              </div>
            )
          )}
          {currentView === 'consultations' && <ConsultationsManager />}
          {currentView === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center" role="region" aria-label="الملف الشخصي">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">الملف الشخصي</h2>
              <div className="space-y-3 text-right max-w-md mx-auto">
                <div>
                  <span className="font-medium text-gray-700">الاسم:</span>
                  <span className="mr-2 text-gray-900">{user.full_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">البريد الإلكتروني:</span>
                  <span className="mr-2 text-gray-900">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">نوع الحساب:</span>
                  <span className="mr-2 text-gray-900">
                    {user.role === 'mother' ? 'أم' : user.role === 'specialist' ? 'أخصائي' : user.role === 'volunteer' ? 'متطوع' : 'مدير'}
                  </span>
                </div>
                {user.location && (
                  <div>
                    <span className="font-medium text-gray-700">المنطقة:</span>
                    <span className="mr-2 text-gray-900">{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {currentView === 'admin' && user.role === 'admin' && <AdminPanel />}
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
