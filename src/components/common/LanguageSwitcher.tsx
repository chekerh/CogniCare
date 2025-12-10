import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { id: 'ar' as const, label: 'العربية', code: 'AR' },
    { id: 'fr' as const, label: 'Français', code: 'FR' },
    { id: 'en' as const, label: 'English', code: 'EN' },
  ];

  const currentLang = languages.find(l => l.id === language);

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const currentIndex = languages.findIndex(l => l.id === language);
          const nextIndex = (currentIndex + 1) % languages.length;
          setLanguage(languages[nextIndex].id);
        }}
        className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
        title={`Current: ${currentLang?.label} - Click to switch`}
        aria-label="Switch language"
      >
        <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pooh:text-pooh-brown-dark">
          {currentLang?.code}
        </span>
      </button>
      
      {/* Language indicator tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 dark:bg-gray-700 pooh:bg-pooh-brown text-white dark:text-gray-200 pooh:text-pooh-yellow text-xs rounded px-2 py-1 whitespace-nowrap">
          {currentLang?.label}
        </div>
      </div>
    </div>
  );
}

