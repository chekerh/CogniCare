import { useState, useEffect } from 'react';
import { supabase, User, Child, Specialist } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar, Clock } from 'lucide-react';

interface BookConsultationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BookConsultationModal({ onClose, onSuccess }: BookConsultationModalProps) {
  const { user } = useAuth();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">حجز استشارة</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأخصائي *
            </label>
            <select
              value={selectedSpecialist}
              onChange={(e) => setSelectedSpecialist(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">اختر أخصائياً</option>
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.full_name} - {spec.specialist.specialty.join(', ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الطفل (اختياري)
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">لا يوجد</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.age} سنوات)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ والوقت *
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدة (بالدقائق)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value={30}>30 دقيقة</option>
              <option value={45}>45 دقيقة</option>
              <option value={60}>60 دقيقة</option>
            </select>
          </div>

          <div className="flex space-x-3 space-x-reverse justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={booking || !selectedSpecialist || !scheduledAt}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? 'جاري الحجز...' : 'حجز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

