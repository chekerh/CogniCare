import { useState, useEffect } from 'react';
import { supabase, Post, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';
import { Loader2 } from 'lucide-react';

export function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(Post & { author: User; reaction_count: Record<string, number>; user_reaction: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      const postsWithReactions = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: reactions } = await supabase
            .from('reactions')
            .select('type, user_id')
            .eq('post_id', post.id);

          const reactionCount = (reactions || []).reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const userReaction = reactions?.find(r => r.user_id === user?.id)?.type || null;

          return {
            ...post,
            author: post.author,
            reaction_count: reactionCount,
            user_reaction: userReaction,
          };
        })
      );

      setPosts(postsWithReactions);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostCreated={loadPosts} />

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">لا توجد منشورات بعد. كن أول من يشارك!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdate={loadPosts} />
        ))
      )}
    </div>
  );
}
