import { useState, useEffect } from 'react';
import { supabase, User, Child, Specialist } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X } from 'lucide-react';

interface BookConsultationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BookConsultationModal({ onClose, onSuccess }: BookConsultationModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [specialists, setSpecialists] = useState<(User & { specialist: Specialist })[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadSpecialists();
    loadChildren();
  }, []);

  const loadSpecialists = async () => {
    try {
      const { data } = await supabase
        .from('specialists')
        .select('*, user:users(*)')
        .not('verified_at', 'is', null);

      const specialistsWithUsers = (data || []).map((s) => ({
        ...(s.user as User),
        specialist: s,
      }));

      setSpecialists(specialistsWithUsers);
    } catch (error) {
      console.error('Error loading specialists:', error);
    }
  };

  const loadChildren = async () => {
    try {
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('mother_id', user!.id);
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialist || !scheduledAt) return;

    setBooking(true);
    try {
      const { error } = await supabase.from('consultations').insert({
        specialist_id: selectedSpecialist,
        mother_id: user!.id,
        child_id: selectedChild || null,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        status: 'pending',
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error booking consultation:', error);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 pooh:bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('consultations.book')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-red-600 dark:hover:text-red-400 pooh:hover:text-pooh-red hover:bg-red-50 dark:hover:bg-red-900/20 pooh:hover:bg-pooh-red/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
              {t('consultations.specialist')} *
            </label>
            <select
              value={selectedSpecialist}
              onChange={(e) => setSelectedSpecialist(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            >
              <option value="">{t('consultations.selectSpecialist')}</option>
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.full_name} - {spec.specialist.specialty.join(', ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
              {t('consultations.child')} ({t('common.optional')})
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            >
              <option value="">{t('common.none')}</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.age} {t('children.years')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
              {t('consultations.dateTime')} *
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
              {t('consultations.duration')}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            >
              <option value={30}>30 {t('consultations.minutes')}</option>
              <option value={45}>45 {t('consultations.minutes')}</option>
              <option value={60}>60 {t('consultations.minutes')}</option>
            </select>
          </div>

          <div className="flex space-x-3 space-x-reverse justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood text-gray-700 dark:text-gray-300 pooh:text-pooh-brown-dark hover:bg-gray-50 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light transition-colors rounded-lg"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={booking || !selectedSpecialist || !scheduledAt}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? t('consultations.booking') : t('consultations.book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

