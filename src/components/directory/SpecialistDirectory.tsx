import { useState, useEffect } from 'react';
import { supabase, Specialist, User } from '../../lib/supabase';
import { Search, MapPin, Award, Languages } from 'lucide-react';

export function SpecialistDirectory() {
  const [specialists, setSpecialists] = useState<(Specialist & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      const { data, error } = await supabase
        .from('specialists')
        .select(`
          *,
          user:users!specialists_user_id_fkey(*)
        `)
        .not('verified_at', 'is', null)
        .order('verified_at', { ascending: false });

      if (error) throw error;
      setSpecialists(data || []);
    } catch (error) {
      console.error('Error loading specialists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecialists = specialists.filter((spec) =>
    spec.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    spec.user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">دليل الأخصائيين</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pooh:text-pooh-brown w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن أخصائي حسب الاسم، التخصص، أو المنطقة..."
            className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSpecialists.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
            لا يوجد أخصائيون متاحون حالياً
          </div>
        ) : (
          filteredSpecialists.map((specialist) => (
            <div key={specialist.id} className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center">
                    <span className="text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark font-bold text-xl">
                      {specialist.user.full_name[0]}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{specialist.user.full_name}</h3>
                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark text-xs rounded-full">
                      موثق
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">{specialist.specialty.join('، ')}</span>
                    </div>

                    {specialist.user.location && (
                      <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{specialist.user.location}</span>
                      </div>
                    )}

                    {specialist.languages_spoken.length > 0 && (
                      <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                        <Languages className="w-4 h-4" />
                        <span className="text-sm">{specialist.languages_spoken.join('، ')}</span>
                      </div>
                    )}
                  </div>

                  {specialist.user.bio && (
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown" dir="auto">
                      {specialist.user.bio}
                    </p>
                  )}

                  {specialist.availability && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                        <span className="font-medium">التوفر:</span> {specialist.availability}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <button className="px-4 py-2 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors text-sm">
                      طلب استشارة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
