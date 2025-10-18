import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { CommunityFeed } from './components/feed/CommunityFeed';
import { SpecialistDirectory } from './components/directory/SpecialistDirectory';
import { ChildrenManager } from './components/children/ChildrenManager';
import { GamesZone } from './components/games/GamesZone';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { Heart } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('feed');

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
          <div className="absolute top-4 right-4">
            <LanguageSwitcher showLabel={true} />
          </div>

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
        {currentView === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
        {currentView === 'admin' && user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">لوحة الإدارة</h2>
            <p className="text-gray-600">إدارة المستخدمين والمحتوى</p>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
