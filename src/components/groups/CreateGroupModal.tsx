import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X } from 'lucide-react';

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          is_public: isPublic,
          created_by: user!.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user!.id,
        role: 'admin',
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 pooh:bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">{t('groups.createNew')}</h2>
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
              {t('groups.name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">
              {t('groups.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood rounded focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">
              {t('groups.publicGroup')}
            </label>
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
              disabled={creating || !name.trim()}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? t('groups.creating') : t('groups.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

