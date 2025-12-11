import { Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 pooh:from-pooh-cream pooh:to-pooh-beige flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">{t('common.pageNotFound')}</h1>
        <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-8">
          {t('common.pageNotFoundDesc')}
        </p>
        <div className="flex space-x-4 space-x-reverse justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>{t('common.backToHome')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

