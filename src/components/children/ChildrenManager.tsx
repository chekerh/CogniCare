import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, User, BookOpen } from 'lucide-react';
import { AddChildForm } from './AddChildForm';
import { ChildCard } from './ChildCard';

interface ChildrenManagerProps {
  onSelectChild?: (child: Child) => void;
}

export function ChildrenManager({ onSelectChild }: ChildrenManagerProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
        {t('children.mothersOnly')}
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-8 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <User className="w-8 h-8 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('nav.children')}</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-4 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t('children.addChild')}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 pooh:bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 pooh:text-pooh-burlywood mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown mb-4">{t('children.noChildren')}</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-6 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
            >
              {t('children.addFirstChild')}
            </button>
          </div>
        ) : (
          children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onSelect={() => onSelectChild?.(child)}
              onUpdate={loadChildren}
            />
          ))
        )}
      </div>
    </div>
  );
}
