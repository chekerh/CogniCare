import { useState, useEffect } from 'react';
import { supabase, GroupPost, Group, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { CreateGroupPost } from './CreateGroupPost';
import { GroupPostCard } from './GroupPostCard';

interface GroupFeedProps {
  group: Group;
  onBack: () => void;
  onLeave: () => void;
}

export function GroupFeed({ group, onBack, onLeave }: GroupFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(GroupPost & { author: User; reactionCount: Record<string, number> })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
    subscribeToPosts();
  }, [group.id]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          const { data: author } = await supabase
            .from('users')
            .select('*')
            .eq('id', post.author_id)
            .single();

          const { data: reactions } = await supabase
            .from('group_reactions')
            .select('type')
            .eq('post_id', post.id);

          const reactionCount = (reactions || []).reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return {
            ...post,
            author: author as User,
            reactionCount,
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPosts = () => {
    const channel = supabase
      .channel(`group_posts_${group.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_posts',
        filter: `group_id=eq.${group.id}`,
      }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>منشور جديد</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-gray-500">لا توجد منشورات في هذه المجموعة بعد</p>
          </div>
        ) : (
          posts.map((post) => (
            <GroupPostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))
        )}
      </div>

      {showCreatePost && (
        <CreateGroupPost
          groupId={group.id}
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            loadPosts();
          }}
        />
      )}
    </div>
  );
}

