import { useState, useEffect } from 'react';
import { supabase, Post, Reel, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';
import { ReelCard } from '../reels/ReelCard';
import { Loader2, Film } from 'lucide-react';

interface CommunityFeedProps {
  onViewChange?: (view: string) => void;
}

type FeedItem = 
  | { type: 'post'; data: Post & { author: User; reaction_count: Record<string, number>; user_reaction: string | null } }
  | { type: 'reel'; data: Reel & { author: User; likeCount: number; isLiked: boolean } };

export function CommunityFeed({ onViewChange }: CommunityFeedProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<(Post & { author: User; reaction_count: Record<string, number>; user_reaction: string | null })[]>([]);
  const [reels, setReels] = useState<(Reel & { author: User; likeCount: number; isLiked: boolean })[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      // Load posts
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

      // Load reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (reelsError) {
        console.error('Error loading reels:', reelsError);
      } else {
        const reelsWithAuthors = await Promise.all(
          (reelsData || []).map(async (reel) => {
            const { data: author } = await supabase
              .from('users')
              .select('*')
              .eq('id', reel.author_id)
              .single();

            const { count: likeCount } = await supabase
              .from('reel_reactions')
              .select('*', { count: 'exact', head: true })
              .eq('reel_id', reel.id)
              .eq('type', 'like');

            const { data: userReaction } = await supabase
              .from('reel_reactions')
              .select('type')
              .eq('reel_id', reel.id)
              .eq('user_id', user?.id)
              .eq('type', 'like')
              .single();

            // Track view
            if (user) {
              await supabase.from('reel_views').upsert({
                reel_id: reel.id,
                user_id: user.id,
              });
            }

            return {
              ...reel,
              author: author as User,
              likeCount: likeCount || 0,
              isLiked: !!userReaction,
            };
          })
        );

        setReels(reelsWithAuthors);
      }

      setPosts(postsWithReactions);

      // Combine and sort by date
      const combined: FeedItem[] = [
        ...postsWithReactions.map(post => ({ type: 'post' as const, data: post })),
        ...reelsWithAuthors.map((reel) => ({ 
          type: 'reel' as const, 
          data: reel 
        }))
      ].sort((a, b) => {
        const dateA = new Date(a.data.created_at).getTime();
        const dateB = new Date(b.data.created_at).getTime();
        return dateB - dateA; // Newest first
      });

      setFeedItems(combined);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    const postsChannel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadPosts();
      })
      .subscribe();

    const reelsChannel = supabase
      .channel('reels_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reels' }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(reelsChannel);
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
      {/* Quick Access: Reels Button */}
      {onViewChange && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onViewChange('reels')}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 pooh:from-pooh-yellow pooh:to-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-lg hover:from-teal-600 hover:to-cyan-600 dark:hover:from-teal-700 dark:hover:to-cyan-700 pooh:hover:from-pooh-yellow-dark pooh:hover:to-pooh-yellow transition-all shadow-md hover:shadow-lg"
          >
            <Film className="w-5 h-5" />
            <span className="font-medium">{t('nav.reels')}</span>
          </button>
        </div>
      )}
      
      <CreatePost onPostCreated={loadPosts} />

      {feedItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">{t('feed.noPosts')}</p>
        </div>
      ) : (
        feedItems.map((item) => {
          if (item.type === 'post') {
            return <PostCard key={`post-${item.data.id}`} post={item.data} onUpdate={loadPosts} />;
          } else {
            return <ReelCard key={`reel-${item.data.id}`} reel={item.data} onUpdate={loadPosts} />;
          }
        })
      )}
    </div>
  );
}
