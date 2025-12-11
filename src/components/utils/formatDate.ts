import { Language } from '../../contexts/LanguageContext';

export function formatDistanceToNow(date: string, language: Language = 'ar'): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return language === 'ar' ? 'الآن' : language === 'fr' ? 'Maintenant' : 'Now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (language === 'ar') return `منذ ${diffInMinutes} دقيقة`;
    if (language === 'fr') return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (language === 'ar') return `منذ ${diffInHours} ساعة`;
    if (language === 'fr') return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    if (language === 'ar') return `منذ ${diffInDays} يوم`;
    if (language === 'fr') return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    if (language === 'ar') return `منذ ${diffInMonths} شهر`;
    if (language === 'fr') return `Il y a ${diffInMonths} mois`;
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  if (language === 'ar') return `منذ ${diffInYears} سنة`;
  if (language === 'fr') return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function formatDate(date: string, language: Language = 'ar'): string {
  const d = new Date(date);
  const locale = language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
