import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';

interface AddChildFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddChildForm({ onClose, onSuccess }: AddChildFormProps) {
  const { user } = useAuth();
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

    setLoading(true);
    try {
      const { error } = await supabase.from('children').insert({
        mother_id: user.id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        diagnosis: formData.diagnosis,
        education_level: formData.education_level,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error adding child:', error);
      alert('فشل إضافة الطفل. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">إضافة طفل جديد</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم الطفل
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            العمر
          </label>
          <input
            type="number"
            min="1"
            max="17"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الجنس
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
            <option value="other">آخر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التشخيص
          </label>
          <div className="space-y-2">
            {diagnosisOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.diagnosis.includes(option)}
                  onChange={() => toggleDiagnosis(option)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المستوى التعليمي
          </label>
          <input
            type="text"
            value={formData.education_level}
            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
            placeholder="روضة، ابتدائي، إعدادي..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3 space-x-reverse pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
