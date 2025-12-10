import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { sanitizeInput } from '../../lib/validation';
import { Send } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    // Validation
    if (content.trim().length < 3) {
      showError('المنشور يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (content.trim().length > 5000) {
      showError('المنشور طويل جداً (الحد الأقصى 5000 حرف)');
      return;
    }

    setLoading(true);
    try {
      const sanitizedContent = sanitizeInput(content.trim());
      
      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        content: sanitizedContent,
        media_urls: [],
        tags: [],
      });

      if (error) throw error;

      setContent('');
      showSuccess('تم نشر المنشور بنجاح');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      showError('فشل نشر المنشور. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-4" role="region" aria-label={t('post.create')}>
      <form onSubmit={handleSubmit} aria-label={t('post.createForm')}>
        <label htmlFor="post-content" className="sr-only">
          {t('post.content')}
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('post.placeholder')}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-md resize-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
          rows={3}
          dir="auto"
          aria-label={t('post.content')}
          aria-required="true"
          aria-invalid={content.trim().length > 0 && content.trim().length < 3}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-4 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow"
            aria-label={loading ? t('post.publishing') : t('post.publish')}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? t('post.publishing') : t('post.publish')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
