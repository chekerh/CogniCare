import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateName, validateAge, sanitizeInput } from '../../lib/validation';
import { X } from 'lucide-react';

interface AddChildFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddChildForm({ onClose, onSuccess }: AddChildFormProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    diagnosis: [] as string[],
    education_level: '',
  });
  const [loading, setLoading] = useState(false);

  const diagnosisOptions = [
    'اضطراب طيف التوحد',
    'اضطراب نقص الانتباه وفرط النشاط (ADHD)',
    'عسر القراءة (Dyslexia)',
    'متلازمة داون',
    'تأخر في النمو',
    'صعوبات التعلم',
  ];

  const toggleDiagnosis = (diagnosis: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.includes(diagnosis)
        ? prev.diagnosis.filter(d => d !== diagnosis)
        : [...prev.diagnosis, diagnosis]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      showError(nameValidation.error || t('children.invalidName'));
      return;
    }

    const age = parseInt(formData.age);
    const ageValidation = validateAge(age);
    if (!ageValidation.valid) {
      showError(ageValidation.error || t('children.invalidAge'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('children').insert({
        mother_id: user.id,
        name: sanitizeInput(formData.name),
        age: age,
        gender: formData.gender,
        diagnosis: formData.diagnosis,
        education_level: formData.education_level ? sanitizeInput(formData.education_level) : null,
      });

      if (error) throw error;
      
      showSuccess(t('children.childAdded'));
      onSuccess();
    } catch (error) {
      console.error('Error adding child:', error);
      showError(t('children.addFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 pooh:bg-pooh-surface">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('children.addChild')}</h3>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 pooh:text-pooh-brown hover:text-gray-600 dark:hover:text-gray-300 pooh:hover:text-pooh-brown-dark">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('children.childName')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('children.age')}
          </label>
          <input
            type="number"
            min="1"
            max="17"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('children.gender')}
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          >
            <option value="male">{t('children.genderMale')}</option>
            <option value="female">{t('children.genderFemale')}</option>
            <option value="other">{t('children.genderOther')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
            {t('children.diagnosis')}
          </label>
          <div className="space-y-2">
            {diagnosisOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.diagnosis.includes(option)}
                  onChange={() => toggleDiagnosis(option)}
                  className="rounded text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
            {t('children.educationLevel')}
          </label>
          <input
            type="text"
            value={formData.education_level}
            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
            placeholder={t('children.educationPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3 space-x-reverse pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark py-2 px-4 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('children.adding') : t('children.add')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood text-gray-700 dark:text-gray-300 pooh:text-pooh-brown-dark py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow-light transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
