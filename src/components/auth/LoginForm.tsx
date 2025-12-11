import { useState } from 'react';
import { signIn } from '../../lib/auth';
import { LogIn } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail } from '../../lib/validation';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      const errorMsg = t('auth.invalidEmail');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (password.length < 8) {
      const errorMsg = t('auth.passwordTooShort');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result?.user) {
        showSuccess('تم تسجيل الدخول بنجاح');
        // Don't wait - let AuthContext handle the state update
        // The auth state change event will trigger user fetch
        // Just call onSuccess immediately, AuthContext will update when ready
        onSuccess();
      } else {
        throw new Error(t('auth.loginFailed'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.loginFailed');
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-lg p-8" role="main" aria-labelledby="login-title">
      <div className="flex items-center justify-center mb-6">
        <LogIn className="w-8 h-8 text-teal-600 mr-2" aria-hidden="true" />
        <h2 id="login-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('auth.login')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="نموذج تسجيل الدخول" noValidate>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 pooh:bg-red-50 text-red-600 dark:text-red-400 pooh:text-red-600 p-3 rounded-md text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark py-2 px-4 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
          aria-label={loading ? t('auth.loggingIn') : t('auth.login')}
        >
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown text-sm">
          {t('auth.noAccount')}{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark hover:text-teal-700 dark:hover:text-teal-500 pooh:hover:text-pooh-yellow font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
            aria-label={t('auth.signup')}
          >
            {t('auth.signup')}
          </button>
        </p>
      </div>
    </div>
  );
}
