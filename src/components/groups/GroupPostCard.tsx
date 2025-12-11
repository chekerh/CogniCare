import { useState, useEffect } from 'react';
import { supabase, GroupPost, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

interface GroupPostCardProps {
  post: GroupPost & { author: User; reactionCount: Record<string, number> };
  onUpdate: () => void;
}

export function GroupPostCard({ post, onUpdate }: GroupPostCardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    loadUserReaction();
  }, [post.id]);

  const loadUserReaction = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('group_reactions')
      .select('type')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserReaction(data.type);
    }
  };

  const toggleReaction = async (type: string) => {
    if (!user) return;

    if (userReaction === type) {
      // Remove reaction
      await supabase
        .from('group_reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .eq('type', type);
      setUserReaction(null);
    } else {
      // Remove old reaction if exists
      if (userReaction) {
        await supabase
          .from('group_reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      }

      // Add new reaction
      await supabase.from('group_reactions').insert({
        post_id: post.id,
        user_id: user.id,
        type,
      });
      setUserReaction(type);
    }

    onUpdate();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-start space-x-4 space-x-reverse mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-teal-700 font-bold">{post.author.full_name[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 space-x-reverse">
            <h3 className="font-semibold text-gray-900">{post.author.full_name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">{formatDate(post.created_at, language)}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap" dir="auto">
        {post.content}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-6 space-x-reverse pt-4 border-t border-gray-200">
        <button
          onClick={() => toggleReaction('like')}
          className={`flex items-center space-x-2 space-x-reverse ${
            userReaction === 'like' ? 'text-teal-600' : 'text-gray-600'
          } hover:text-teal-600 transition-colors`}
        >
          <Heart className={`w-5 h-5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
          <span>{post.reactionCount.like || 0}</span>
        </button>

        <button className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-teal-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>تعليق</span>
        </button>

        <button className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-teal-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>مشاركة</span>
        </button>
      </div>
    </div>
  );
}

