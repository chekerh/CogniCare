import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { sanitizeInput } from '../../lib/validation';
import { Send } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
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
    <div className="bg-white rounded-lg shadow-md p-4" role="region" aria-label="إنشاء منشور جديد">
      <form onSubmit={handleSubmit} aria-label="نموذج إنشاء منشور">
        <label htmlFor="post-content" className="sr-only">
          محتوى المنشور
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="شارك تجربتك أو اطرح سؤالاً..."
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          rows={3}
          dir="auto"
          aria-label="محتوى المنشور"
          aria-required="true"
          aria-invalid={content.trim().length > 0 && content.trim().length < 3}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={loading ? 'جاري النشر...' : 'نشر المنشور'}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? 'جاري النشر...' : 'نشر'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
