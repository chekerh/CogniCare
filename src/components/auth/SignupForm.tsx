import { useState } from 'react';
import { signUp } from '../../lib/auth';
import { UserPlus, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../../lib/validation';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'mother' as UserRole,
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.valid) {
      const errorMsg = nameValidation.error || 'الاسم غير صحيح';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (!validateEmail(formData.email)) {
      const errorMsg = 'البريد الإلكتروني غير صحيح';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      const errorMsg = passwordValidation.errors[0] || 'كلمة المرور غير صحيحة';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'كلمتا المرور غير متطابقتين';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: sanitizeInput(formData.full_name),
        role: formData.role,
        location: formData.location ? sanitizeInput(formData.location) : undefined,
        language_preference: 'ar',
      });
      
      // Check if email confirmation is required
      if (result.user && !result.session) {
        // Email confirmation required
        setEmailSent(true);
        showSuccess('تم إرسال رابط التفعيل إلى بريدك الإلكتروني');
        setError('');
        return;
      } else {
        // Email confirmation not required or already confirmed
        showSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل إنشاء الحساب';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show email confirmation message
  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">
            تحقق من بريدك الإلكتروني
          </h2>
          <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-2">
            تم إرسال رابط التفعيل إلى:
          </p>
          <p className="text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark font-semibold mb-6">
            {formData.email}
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 pooh:bg-pooh-cream rounded-lg p-4 mb-6 text-right">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2 flex items-center space-x-2 space-x-reverse">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 pooh:text-pooh-yellow-dark" />
              <span>خطوات التفعيل:</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">
              <li>افتح بريدك الإلكتروني</li>
              <li>ابحث عن رسالة من Cognicare</li>
              <li>انقر على رابط "تأكيد البريد الإلكتروني"</li>
              <li>عد إلى التطبيق وسجل الدخول</li>
            </ol>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 pooh:bg-pooh-yellow-light rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">
              <strong>لم تتلق الرسالة؟</strong>
              <br />
              تحقق من مجلد الرسائل غير المرغوب فيها (Spam) أو انتظر بضع دقائق
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setEmailSent(false);
                setError('');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood text-gray-700 dark:text-gray-300 pooh:text-pooh-brown-dark rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow transition-colors"
            >
              تعديل البريد الإلكتروني
            </button>
            <button
              onClick={onSwitchToLogin}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <span>تسجيل الدخول</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-center mb-6">
        <UserPlus className="w-8 h-8 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark mr-2" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">إنشاء حساب جديد</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 pooh:bg-pooh-red/10 text-red-600 dark:text-red-400 pooh:text-pooh-red p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل
          </label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            نوع الحساب
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          >
            <option value="mother">أم</option>
            <option value="specialist">أخصائي</option>
            <option value="volunteer">متطوع</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            المنطقة
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="تونس، صفاقس، سوسة..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark py-2 px-4 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown text-sm">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark hover:text-teal-700 dark:hover:text-teal-300 pooh:hover:text-pooh-yellow font-medium"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}
