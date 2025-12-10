import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light' as const, icon: Sun, label: 'Light', labelAr: 'فاتح' },
    { id: 'dark' as const, icon: Moon, label: 'Dark', labelAr: 'داكن' },
    { id: 'pooh' as const, icon: Sparkles, label: 'Pooh', labelAr: 'ويني' },
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.id === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].id);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
        title={`Current: ${currentTheme?.label} - Click to switch`}
        aria-label="Switch theme"
      >
        <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown" />
      </button>
      
      {/* Theme indicator tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 dark:bg-gray-700 pooh:bg-pooh-brown text-white dark:text-gray-200 pooh:text-pooh-yellow text-xs rounded px-2 py-1 whitespace-nowrap">
          {currentTheme?.labelAr || currentTheme?.label}
        </div>
      </div>
    </div>
  );
}

