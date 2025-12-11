import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  roles: string[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, currentView, onViewChange, navItems }: MobileMenuProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const availableNavItems = navItems;

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

