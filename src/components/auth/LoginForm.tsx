import { useState } from 'react';
import { signIn } from '../../lib/auth';
import { LogIn } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError('البريد الإلكتروني غير صحيح');
      showError('البريد الإلكتروني غير صحيح');
      return;
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      showError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      showSuccess('تم تسجيل الدخول بنجاح');
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8" role="main" aria-labelledby="login-title">
      <div className="flex items-center justify-center mb-6">
        <LogIn className="w-8 h-8 text-teal-600 mr-2" aria-hidden="true" />
        <h2 id="login-title" className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="نموذج تسجيل الدخول" noValidate>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label={loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        >
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          ليس لديك حساب؟{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-teal-600 hover:text-teal-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
            aria-label="الانتقال إلى صفحة إنشاء حساب جديد"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
}
