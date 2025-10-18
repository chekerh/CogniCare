import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'fr' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  'app.name': {
    ar: 'كوجنيكير',
    fr: 'Cognicare',
    en: 'Cognicare',
  },
  'app.tagline': {
    ar: 'منصة دعم شاملة لأمهات الأطفال ذوي الاحتياجات الخاصة',
    fr: 'Plateforme de soutien complète pour les mères d\'enfants ayant des besoins spéciaux',
    en: 'Comprehensive support platform for mothers of children with special needs',
  },
  'auth.login': {
    ar: 'تسجيل الدخول',
    fr: 'Connexion',
    en: 'Login',
  },
  'auth.signup': {
    ar: 'إنشاء حساب جديد',
    fr: 'Créer un compte',
    en: 'Sign Up',
  },
  'auth.email': {
    ar: 'البريد الإلكتروني',
    fr: 'Email',
    en: 'Email',
  },
  'auth.password': {
    ar: 'كلمة المرور',
    fr: 'Mot de passe',
    en: 'Password',
  },
  'auth.fullName': {
    ar: 'الاسم الكامل',
    fr: 'Nom complet',
    en: 'Full Name',
  },
  'auth.confirmPassword': {
    ar: 'تأكيد كلمة المرور',
    fr: 'Confirmer le mot de passe',
    en: 'Confirm Password',
  },
  'auth.location': {
    ar: 'المنطقة',
    fr: 'Région',
    en: 'Location',
  },
  'auth.accountType': {
    ar: 'نوع الحساب',
    fr: 'Type de compte',
    en: 'Account Type',
  },
  'auth.loggingIn': {
    ar: 'جاري تسجيل الدخول...',
    fr: 'Connexion en cours...',
    en: 'Logging in...',
  },
  'auth.creatingAccount': {
    ar: 'جاري إنشاء الحساب...',
    fr: 'Création du compte...',
    en: 'Creating account...',
  },
  'auth.noAccount': {
    ar: 'ليس لديك حساب؟',
    fr: 'Pas de compte?',
    en: 'No account?',
  },
  'auth.haveAccount': {
    ar: 'لديك حساب بالفعل؟',
    fr: 'Vous avez déjà un compte?',
    en: 'Already have an account?',
  },
  'role.mother': {
    ar: 'أم',
    fr: 'Mère',
    en: 'Mother',
  },
  'role.specialist': {
    ar: 'أخصائي',
    fr: 'Spécialiste',
    en: 'Specialist',
  },
  'role.volunteer': {
    ar: 'متطوع',
    fr: 'Bénévole',
    en: 'Volunteer',
  },
  'role.admin': {
    ar: 'مدير',
    fr: 'Administrateur',
    en: 'Administrator',
  },
  'nav.home': {
    ar: 'الصفحة الرئيسية',
    fr: 'Accueil',
    en: 'Home',
  },
  'nav.directory': {
    ar: 'دليل الأخصائيين',
    fr: 'Annuaire des spécialistes',
    en: 'Specialists Directory',
  },
  'nav.children': {
    ar: 'أطفالي',
    fr: 'Mes enfants',
    en: 'My Children',
  },
  'nav.games': {
    ar: 'منطقة الألعاب',
    fr: 'Zone de jeux',
    en: 'Games Zone',
  },
  'nav.messages': {
    ar: 'الرسائل',
    fr: 'Messages',
    en: 'Messages',
  },
  'nav.groups': {
    ar: 'المجموعات',
    fr: 'Groupes',
    en: 'Groups',
  },
  'nav.profile': {
    ar: 'الملف الشخصي',
    fr: 'Profil',
    en: 'Profile',
  },
  'nav.admin': {
    ar: 'لوحة الإدارة',
    fr: 'Panneau d\'administration',
    en: 'Admin Panel',
  },
  'nav.logout': {
    ar: 'تسجيل الخروج',
    fr: 'Déconnexion',
    en: 'Logout',
  },
  'common.loading': {
    ar: 'جاري التحميل...',
    fr: 'Chargement...',
    en: 'Loading...',
  },
  'common.save': {
    ar: 'حفظ',
    fr: 'Enregistrer',
    en: 'Save',
  },
  'common.cancel': {
    ar: 'إلغاء',
    fr: 'Annuler',
    en: 'Cancel',
  },
  'common.submit': {
    ar: 'إرسال',
    fr: 'Soumettre',
    en: 'Submit',
  },
  'common.edit': {
    ar: 'تعديل',
    fr: 'Modifier',
    en: 'Edit',
  },
  'common.delete': {
    ar: 'حذف',
    fr: 'Supprimer',
    en: 'Delete',
  },
  'common.search': {
    ar: 'بحث',
    fr: 'Rechercher',
    en: 'Search',
  },
  'common.close': {
    ar: 'إغلاق',
    fr: 'Fermer',
    en: 'Close',
  },
  'game.selectLanguage': {
    ar: 'اختر لغة اللعبة',
    fr: 'Choisir la langue du jeu',
    en: 'Select Game Language',
  },
  'game.enterPin': {
    ar: 'أدخل رمز PIN للخروج',
    fr: 'Entrez le code PIN pour quitter',
    en: 'Enter PIN to exit',
  },
  'game.setPinFirst': {
    ar: 'يرجى تعيين رمز PIN أولاً',
    fr: 'Veuillez définir un code PIN d\'abord',
    en: 'Please set a PIN first',
  },
  'game.memory': {
    ar: 'لعبة الذاكرة',
    fr: 'Jeu de mémoire',
    en: 'Memory Game',
  },
  'game.focus': {
    ar: 'تمارين التركيز',
    fr: 'Exercices de concentration',
    en: 'Focus Tasks',
  },
  'game.speech': {
    ar: 'التعرف على الكلام',
    fr: 'Reconnaissance vocale',
    en: 'Speech Recognition',
  },
  'language.selectLanguage': {
    ar: 'اختر اللغة',
    fr: 'Choisir la langue',
    en: 'Select Language',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cognicare_language');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('cognicare_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
