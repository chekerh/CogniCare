// Simple translation system for Cognicare
// Can be expanded with i18n library later

type TranslationKey = string;
type Translations = Record<Language, Record<TranslationKey, string>>;

import { Language } from '../contexts/LanguageContext';

const translations: Translations = {
  ar: {
    // Navigation
    'nav.home': 'الصفحة الرئيسية',
    'nav.directory': 'دليل الأخصائيين',
    'nav.messages': 'الرسائل',
    'nav.groups': 'المجموعات',
    'nav.reels': 'المقاطع',
    'nav.children': 'أطفالي',
    'nav.games': 'منطقة الألعاب',
    'nav.dashboard': 'لوحات التقدم',
    'nav.consultations': 'الاستشارات',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'لوحة الإدارة',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب جديد',
    'auth.logout': 'تسجيل الخروج',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.name': 'الاسم الكامل',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.loading': 'جاري التحميل...',
    
    // Roles
    'role.mother': 'أم',
    'role.specialist': 'أخصائي',
    'role.volunteer': 'متطوع',
    'role.admin': 'مدير',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.directory': 'Annuaire des Spécialistes',
    'nav.messages': 'Messages',
    'nav.groups': 'Groupes',
    'nav.reels': 'Reels',
    'nav.children': 'Mes Enfants',
    'nav.games': 'Zone de Jeux',
    'nav.dashboard': 'Tableaux de Bord',
    'nav.consultations': 'Consultations',
    'nav.profile': 'Profil',
    'nav.admin': 'Panneau d\'Administration',
    
    // Dashboard
    'dashboard.selectChild': 'Sélectionnez un enfant pour afficher le tableau de bord',
    
    // Auth
    'auth.login': 'Se connecter',
    'auth.signup': 'Créer un compte',
    'auth.logout': 'Se déconnecter',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.name': 'Nom complet',
    'auth.noAccount': 'Vous n\'avez pas de compte ?',
    
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    
    // Roles
    'role.mother': 'Mère',
    'role.specialist': 'Spécialiste',
    'role.volunteer': 'Bénévole',
    'role.admin': 'Administrateur',
    
    // Profile
    'profile.name': 'Nom',
    'profile.email': 'E-mail',
    'profile.role': 'Type de compte',
    'profile.location': 'Localisation',
    
    // Health
    'health.status': 'Statut',
    'health.healthy': 'Sain',
    'health.degraded': 'Dégradé',
    'health.unhealthy': 'Malsain',
    
    // Games
    'games.mothersOnly': 'Cette page est réservée aux mères',
    'games.addChildFirst': 'Vous devez d\'abord ajouter un enfant pour accéder à la zone de jeux',
    'games.addChild': 'Ajouter un enfant',
    'games.selectChild': 'Sélectionner un enfant',
    'games.years': 'ans',
    'games.playWith': 'Jouer avec',
    'games.selectGame': 'Choisissez un jeu dans la liste ci-dessous',
    'games.changeChild': 'Changer d\'enfant',
    'games.memoryGame': 'Jeu de mémoire',
    'games.memoryDescription': 'Associez les cartes similaires pour améliorer la mémoire et la concentration',
    'games.moreGames': 'Autres jeux',
    'games.comingSoon': 'Bientôt...',
    
    // Posts
    'post.create': 'Créer une publication',
    'post.createForm': 'Formulaire de publication',
    'post.content': 'Contenu de la publication',
    'post.placeholder': 'Partagez votre expérience ou posez une question...',
    'post.publish': 'Publier',
    'post.publishing': 'Publication en cours...',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.directory': 'Specialist Directory',
    'nav.messages': 'Messages',
    'nav.groups': 'Groups',
    'nav.reels': 'Reels',
    'nav.children': 'My Children',
    'nav.games': 'Games Zone',
    'nav.dashboard': 'Dashboards',
    'nav.consultations': 'Consultations',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin Panel',
    
    // Dashboard
    'dashboard.selectChild': 'Select a child to view dashboard',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.noAccount': 'Don\'t have an account?',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    
    // Roles
    'role.mother': 'Mother',
    'role.specialist': 'Specialist',
    'role.volunteer': 'Volunteer',
    'role.admin': 'Admin',
    
    // Profile
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.role': 'Account Type',
    'profile.location': 'Location',
    
    // Health
    'health.status': 'Status',
    'health.healthy': 'Healthy',
    'health.degraded': 'Degraded',
    'health.unhealthy': 'Unhealthy',
    
    // Games
    'games.mothersOnly': 'This page is only available for mothers',
    'games.addChildFirst': 'You must add a child first to access the games zone',
    'games.addChild': 'Add Child',
    'games.selectChild': 'Select Child',
    'games.years': 'years',
    'games.playWith': 'Play with',
    'games.selectGame': 'Choose a game from the list below',
    'games.changeChild': 'Change Child',
    'games.memoryGame': 'Memory Game',
    'games.memoryDescription': 'Match similar cards to improve memory and concentration',
    'games.moreGames': 'More Games',
    'games.comingSoon': 'Coming soon...',
    
    // Posts
    'post.create': 'Create New Post',
    'post.createForm': 'Create Post Form',
    'post.content': 'Post Content',
    'post.placeholder': 'Share your experience or ask a question...',
    'post.publish': 'Publish',
    'post.publishing': 'Publishing...',
  },
};

export function translate(key: string, language: Language): string {
  return translations[language]?.[key] || key;
}

export { translations };

