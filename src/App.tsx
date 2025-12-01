import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { CommunityFeed } from './components/feed/CommunityFeed';
import { SpecialistDirectory } from './components/directory/SpecialistDirectory';
import { ChildrenManager } from './components/children/ChildrenManager';
import { GamesZone } from './components/games/GamesZone';
import { Inbox } from './components/messaging/Inbox';
import { GroupsManager } from './components/groups/GroupsManager';
import { ReelsFeed } from './components/reels/ReelsFeed';
import { ChildDashboard } from './components/dashboard/ChildDashboard';
import { Child } from './lib/supabase';
import { ConsultationsManager } from './components/consultations/ConsultationsManager';
import { AdminPanel } from './components/admin/AdminPanel';
import { Heart } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('feed');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <ChildrenManager onSelectChild={setSelectedChild} />
            </div>
          )
        )}
        {currentView === 'consultations' && <ConsultationsManager />}
        {currentView === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
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
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
