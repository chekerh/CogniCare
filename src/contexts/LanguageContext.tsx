import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translate } from '../lib/translations';
import { useAuth } from './AuthContext';
import { updateUserProfile } from '../lib/auth';

export type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: 'rtl' | 'ltr';
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'cognicare-language';

function LanguageProviderInner({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or user profile or default to Arabic
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && ['ar', 'fr', 'en'].includes(saved)) {
      return saved;
    }
    return user?.language_preference || 'ar';
  });

  // Update language when user changes
  useEffect(() => {
    if (user?.language_preference && user.language_preference !== language) {
      setLanguageState(user.language_preference);
    }
  }, [user?.language_preference]);

  useEffect(() => {
    // Update HTML attributes (synchronous, fast)
    document.documentElement.setAttribute('lang', language);
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    
    // Save to localStorage (synchronous, fast)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    
    // Sync with user profile if logged in (defer to avoid blocking)
    // Only update if language actually changed from user's preference
    if (user && user.language_preference !== language) {
      // Use a ref to track if we're already updating to prevent loops
      let isUpdating = false;
      const timeoutId = setTimeout(() => {
        if (!isUpdating) {
          isUpdating = true;
          updateUserProfile(user.id, { language_preference: language })
            .then(() => {
              // Only refresh if still needed (user might have changed)
              if (user && user.language_preference !== language) {
                refreshUser();
              }
            })
            .catch((error) => {
              console.error('Error updating language preference:', error);
            })
            .finally(() => {
              isUpdating = false;
            });
        }
      }, 1000); // Increased delay to reduce frequency
      
      return () => clearTimeout(timeoutId);
    }
  }, [language, user?.id, user?.language_preference, refreshUser]);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Translation function
  const t = (key: string): string => {
    return translate(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // LanguageProvider needs AuthContext, so we wrap it
  return (
    <LanguageProviderInner>{children}</LanguageProviderInner>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

