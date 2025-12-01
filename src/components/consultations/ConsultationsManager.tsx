import { useState, useEffect } from 'react';
import { supabase, Consultation, User, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Video, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { BookConsultationModal } from './BookConsultationModal';

export function ConsultationsManager() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<(Consultation & { specialist: User; child: Child | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [user]);

  const loadConsultations = async () => {
    try {
      const filter = user?.role === 'specialist'
        ? { specialist_id: user.id }
        : { mother_id: user!.id };

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .match(filter)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      const consultationsWithDetails = await Promise.all(
        (data || []).map(async (consultation) => {
          const { data: specialist } = await supabase
            .from('users')
            .select('*')
            .eq('id', consultation.specialist_id)
            .single();

          let child = null;
          if (consultation.child_id) {
            const { data: childData } = await supabase
              .from('children')
              .select('*')
              .eq('id', consultation.child_id)
              .single();
            child = childData;
          }

          return {
            ...consultation,
            specialist: specialist as User,
            child,
          };
        })
      );

      setConsultations(consultationsWithDetails);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    try {
      await supabase
        .from('consultations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      loadConsultations();
    } catch (error) {
      console.error('Error updating consultation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Video className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-800">الاستشارات</h2>
          </div>
          {user?.role === 'mother' && (
            <button
              onClick={() => setShowBookModal(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              حجز استشارة جديدة
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد استشارات محجوزة</p>
          </div>
        ) : (
          consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {user?.role === 'mother'
                        ? consultation.specialist.full_name
                        : `استشارة مع أم`}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        consultation.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : consultation.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : consultation.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {consultation.status === 'pending'
                        ? 'قيد الانتظار'
                        : consultation.status === 'confirmed'
                        ? 'مؤكد'
                        : consultation.status === 'completed'
                        ? 'مكتمل'
                        : 'ملغي'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(consultation.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="w-4 h-4" />
                      <span>{consultation.duration_minutes} دقيقة</span>
                    </div>
                    {consultation.child && (
                      <div>
                        <span className="font-medium">الطفل:</span> {consultation.child.name}
                      </div>
                    )}
                  </div>

                  {consultation.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{consultation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  {consultation.status === 'confirmed' && consultation.meeting_url && (
                    <a
                      href={consultation.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>بدء المكالمة</span>
                    </a>
                  )}
                  {user?.role === 'specialist' && consultation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateConsultationStatus(consultation.id, 'confirmed')}
                        className="flex items-center space-x-2 space-x-reverse bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>قبول</span>
                      </button>
                      <button
                        onClick={() => updateConsultationStatus(consultation.id, 'cancelled')}
                        className="flex items-center space-x-2 space-x-reverse bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showBookModal && (
        <BookConsultationModal
          onClose={() => setShowBookModal(false)}
          onSuccess={() => {
            setShowBookModal(false);
            loadConsultations();
          }}
        />
      )}
    </div>
  );
}

