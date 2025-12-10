import { useState } from 'react';
import { LogOut, Home, Users, BookOpen, Gamepad2, User, Shield, MessageCircle, Users2, Video, BarChart3, Film, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { signOut } from '../../lib/auth';
import { NotificationsBell } from '../notifications/NotificationsBell';
import { MobileMenu } from './MobileMenu';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const availableNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      <header className="bg-white dark:bg-gray-800 pooh:bg-pooh-cream shadow-md border-b border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-gray-900 dark:hover:text-gray-100 pooh:hover:text-pooh-brown-dark hover:bg-gray-100 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light rounded-lg transition-colors"
                aria-label="فتح القائمة"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark flex items-center gap-2">
                <a href="#feed" onClick={(e) => { e.preventDefault(); onViewChange('feed'); }} className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">
                  Cognicare
                </a>
              </h1>
              <nav className="hidden md:flex space-x-4 space-x-reverse" role="navigation" aria-label={t('nav.home')}>
              {availableNavItems.map(({ id, icon: Icon, labelKey }) => {
                const label = t(labelKey);
                return (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow ${
                    currentView === id
                      ? 'bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark'
                      : 'text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:bg-gray-100 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light hover:text-gray-900 dark:hover:text-gray-100 pooh:hover:text-pooh-brown-dark'
                  }`}
                  aria-current={currentView === id ? 'page' : undefined}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              )})}
            </nav>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <NotificationsBell />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{user.display_name || user.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
                {user.role === 'mother' ? t('role.mother') : user.role === 'specialist' ? t('role.specialist') : user.role === 'volunteer' ? t('role.volunteer') : t('role.admin')}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-red-600 dark:hover:text-red-400 pooh:hover:text-pooh-red hover:bg-red-50 dark:hover:bg-red-900/20 pooh:hover:bg-pooh-red/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              title={t('auth.logout')}
              aria-label={t('auth.logout')}
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
    <MobileMenu
      isOpen={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      currentView={currentView}
      onViewChange={onViewChange}
    />
    </>
  );
}
