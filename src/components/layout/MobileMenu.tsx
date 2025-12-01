import { X, Home, Users, BookOpen, Gamepad2, User, Shield, MessageCircle, Users2, Film, BarChart3, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MobileMenu({ isOpen, onClose, currentView, onViewChange }: MobileMenuProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

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

  const availableNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  const handleNavClick = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">القائمة</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {availableNavItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                currentView === id
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

