import { X, Home, Users, BookOpen, Gamepad2, User, Shield, MessageCircle, Users2, Film, BarChart3, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MobileMenu({ isOpen, onClose, currentView, onViewChange }: MobileMenuProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const navItems = [
    { id: 'feed', icon: Home, labelKey: 'nav.home', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'directory', icon: Users, labelKey: 'nav.directory', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'messages', icon: MessageCircle, labelKey: 'nav.messages', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'groups', icon: Users2, labelKey: 'nav.groups', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'reels', icon: Film, labelKey: 'nav.reels', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'children', icon: BookOpen, labelKey: 'nav.children', roles: ['mother'] },
    { id: 'games', icon: Gamepad2, labelKey: 'nav.games', roles: ['mother'] },
    { id: 'dashboard', icon: BarChart3, labelKey: 'nav.dashboard', roles: ['mother'] },
    { id: 'consultations', icon: Video, labelKey: 'nav.consultations', roles: ['mother', 'specialist'] },
    { id: 'profile', icon: User, labelKey: 'nav.profile', roles: ['mother', 'specialist', 'volunteer', 'admin'] },
    { id: 'admin', icon: Shield, labelKey: 'nav.admin', roles: ['admin'] },
  ];

  const availableNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  const handleNavClick = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 pooh:bg-opacity-40 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 pooh:bg-pooh-surface shadow-2xl z-50 md:hidden overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('nav.home')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-red-600 dark:hover:text-red-400 pooh:hover:text-pooh-red hover:bg-red-50 dark:hover:bg-red-900/20 pooh:hover:bg-pooh-red/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {availableNavItems.map(({ id, icon: Icon, labelKey }) => {
            const label = t(labelKey);
            return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                currentView === id
                  ? 'bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark'
                  : 'text-gray-700 dark:text-gray-300 pooh:text-pooh-brown hover:bg-gray-100 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          )})}
        </nav>
      </div>
    </>
  );
}

