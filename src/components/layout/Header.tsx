import { LogOut, Home, Users, BookOpen, Gamepad2, User, Shield, MessageCircle, Users2, Video, BarChart3, Film } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';
import { NotificationsBell } from '../notifications/NotificationsBell';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onViewChange('login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  const navItems = [
    { id: 'feed', icon: Home, label: 'الصفحة الرئيسية', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'directory', icon: Users, label: 'دليل الأخصائيين', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'messages', icon: MessageCircle, label: 'الرسائل', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'groups', icon: Users2, label: 'المجموعات', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'reels', icon: Film, label: 'المقاطع', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'children', icon: BookOpen, label: 'أطفالي', roles: ['mother'] },
    { id: 'games', icon: Gamepad2, label: 'منطقة الألعاب', roles: ['mother'] },
    { id: 'dashboard', icon: BarChart3, label: 'لوحات التقدم', roles: ['mother'] },
    { id: 'consultations', icon: Video, label: 'الاستشارات', roles: ['mother', 'specialist'] },
    { id: 'profile', icon: User, label: 'الملف الشخصي', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'admin', icon: Shield, label: 'لوحة الإدارة', roles: ['admin'] },
  ];

  const availableNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8 space-x-reverse">
            <h1 className="text-2xl font-bold text-teal-600">Cognicare</h1>
            <nav className="hidden md:flex space-x-4 space-x-reverse">
              {availableNavItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === id
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <NotificationsBell />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.display_name || user.full_name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'mother' ? 'أم' : user.role === 'specialist' ? 'أخصائي' : user.role === 'volunteer' ? 'متطوع' : 'مدير'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
