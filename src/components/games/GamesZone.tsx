import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, Lock } from 'lucide-react';
import { MemoryGame } from './MemoryGame';

export function GamesZone() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'mother') {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('mother_id', user!.id);

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'mother') {
    return (
      <div className="text-center p-8 text-gray-500">
        هذه الصفحة متاحة فقط للأمهات
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white rounded-lg shadow-md">
        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">يجب إضافة طفل أولاً للوصول إلى منطقة الألعاب</p>
        <button
          onClick={() => window.location.hash = '#children'}
          className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          إضافة طفل
        </button>
      </div>
    );
  }

  if (selectedGame && selectedChild) {
    return (
      <div>
        {selectedGame === 'memory' && (
          <MemoryGame
            child={selectedChild}
            onExit={() => {
              setSelectedGame(null);
              setSelectedChild(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!selectedChild ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">اختر الطفل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-right"
              >
                <p className="text-lg font-bold text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-600 mt-1">{child.age} سنوات</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  العب مع {selectedChild.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">اختر لعبة من القائمة أدناه</p>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                تغيير الطفل
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedGame('memory')}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لعبة الذاكرة</h3>
              <p className="text-sm text-gray-600">
                طابق البطاقات المتشابهة لتحسين الذاكرة والتركيز
              </p>
            </button>

            <div className="bg-gray-100 rounded-lg shadow-md p-8 text-center opacity-60">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">ألعاب أخرى</h3>
              <p className="text-sm text-gray-500">قريباً...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
