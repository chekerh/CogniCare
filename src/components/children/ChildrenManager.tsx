import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, User, BookOpen } from 'lucide-react';
import { AddChildForm } from './AddChildForm';
import { ChildCard } from './ChildCard';

export function ChildrenManager() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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
        .eq('mother_id', user!.id)
        .order('created_at', { ascending: false });

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <User className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-800">أطفالي</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة طفل</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddChildForm
              onClose={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false);
                loadChildren();
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لم تقومي بإضافة أي أطفال بعد</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              إضافة طفلك الأول
            </button>
          </div>
        ) : (
          children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onSelect={() => {}}
              onUpdate={loadChildren}
            />
          ))
        )}
      </div>
    </div>
  );
}
