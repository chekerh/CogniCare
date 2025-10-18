import { useState, useEffect } from 'react';
import { supabase, Post, User, Comment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, Flag } from 'lucide-react';
import { formatDistanceToNow } from '../utils/formatDate';

interface PostCardProps {
  post: Post & { author: User; reaction_count: Record<string, number>; user_reaction: string | null };
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<(Comment & { author: User })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    if (!showComments) return;

    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users!comments_author_id_fkey(*)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [showComments]);

  const handleReaction = async () => {
    if (!user) return;

    try {
      if (post.user_reaction) {
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase.from('reactions').insert({
          post_id: post.id,
          user_id: user.id,
          type: 'heart',
        });
      }
      onUpdate();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        author_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-700 font-semibold text-sm">
              {post.author.display_name?.[0] || post.author.full_name[0]}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author.display_name || post.author.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(post.created_at)}
              </p>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Flag className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-wrap" dir="auto">
            {post.content}
          </p>

          <div className="mt-4 flex items-center space-x-6 space-x-reverse">
            <button
              onClick={handleReaction}
              className={`flex items-center space-x-1 space-x-reverse transition-colors ${
                post.user_reaction === 'heart'
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={post.user_reaction === 'heart' ? 'currentColor' : 'none'}
              />
              <span className="text-sm">{post.reaction_count.heart || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 space-x-reverse text-gray-500 hover:text-teal-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{comments.length}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-4">
              {loadingComments ? (
                <p className="text-sm text-gray-500">جاري التحميل...</p>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-2 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-xs">
                            {comment.author.display_name?.[0] || comment.author.full_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.author.display_name || comment.author.full_name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1" dir="auto">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(comment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleComment} className="flex space-x-2 space-x-reverse">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="اكتب تعليق..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      dir="auto"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      إرسال
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
