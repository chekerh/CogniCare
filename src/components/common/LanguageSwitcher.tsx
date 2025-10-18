import { Languages } from 'lucide-react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageSwitcherProps {
  showLabel?: boolean;
}

export function LanguageSwitcher({ showLabel = true }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
        <Languages className="w-5 h-5 text-gray-600" />
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label}
          </span>
        )}
      </button>

      <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 space-x-reverse ${
              language === lang.code ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
            } ${lang.code === languages[0].code ? 'rounded-t-lg' : ''} ${
              lang.code === languages[languages.length - 1].code ? 'rounded-b-lg' : ''
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="font-medium">{lang.label}</span>
            {language === lang.code && (
              <span className="mr-auto text-teal-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
