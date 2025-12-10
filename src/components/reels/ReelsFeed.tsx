import { useState, useEffect, useRef } from 'react';
import { supabase, Reel, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export function ReelsFeed() {
  const { user } = useAuth();
  const [reels, setReels] = useState<(Reel & { author: User; likeCount: number; isLiked: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  useEffect(() => {
    loadReels();
  }, []);

  useEffect(() => {
    // Auto-play first video
    if (reels.length > 0 && reels[currentIndex]) {
      const video = videoRefs.current[reels[currentIndex].id];
      if (video) {
        video.play().catch(console.error);
        setPlaying((prev) => ({ ...prev, [reels[currentIndex].id]: true }));
      }
    }
  }, [reels, currentIndex]);

  const loadReels = async () => {
    try {
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const reelsWithAuthors = await Promise.all(
        (data || []).map(async (reel) => {
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
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (reelId: string) => {
    if (!user) return;

    const reel = reels.find((r) => r.id === reelId);
    if (!reel) return;

    if (reel.isLiked) {
      await supabase
        .from('reel_reactions')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', user.id)
        .eq('type', 'like');
    } else {
      await supabase.from('reel_reactions').insert({
        reel_id: reelId,
        user_id: user.id,
        type: 'like',
      });
    }

    loadReels();
  };

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlay = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (playing[reelId]) {
      video.pause();
      setPlaying((prev) => ({ ...prev, [reelId]: false }));
    } else {
      video.play();
      setPlaying((prev) => ({ ...prev, [reelId]: true }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black dark:bg-gray-900 pooh:bg-pooh-cream">
        <div className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">جاري التحميل...</div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black dark:bg-gray-900 pooh:bg-pooh-cream">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown mb-4">لا توجد مقاطع فيديو بعد</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div
      className="h-screen overflow-hidden bg-black"
      onWheel={handleScroll}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      <div
        className="h-full flex transition-transform duration-500"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="h-screen w-screen flex-shrink-0 relative"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Video */}
            <video
              ref={(el) => {
                if (el) videoRefs.current[reel.id] = el;
              }}
              src={reel.video_url}
              poster={reel.poster_frame_url || undefined}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onEnded={() => {
                if (currentIndex < reels.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                }
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end space-x-4 space-x-reverse">
                  {/* Author info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center">
                        <span className="text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark font-bold">
                          {reel.author.full_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white dark:text-gray-100 pooh:text-pooh-brown-dark">{reel.author.full_name}</h3>
                        <p className="text-xs text-gray-300 dark:text-gray-400 pooh:text-pooh-brown">{formatDate(reel.created_at)}</p>
                      </div>
                    </div>
                    {reel.caption && (
                      <p className="text-white text-sm mt-2" dir="auto">
                        {reel.caption}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center space-y-4">
                    <button
                      onClick={() => toggleLike(reel.id)}
                      className={`p-3 rounded-full ${
                        reel.isLiked 
                          ? 'bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark' 
                          : 'bg-black/50 dark:bg-gray-800/50 pooh:bg-pooh-burlywood/50'
                      } text-white dark:text-gray-100 pooh:text-pooh-brown-dark hover:bg-teal-600 dark:hover:bg-teal-500 pooh:hover:bg-pooh-yellow transition-colors`}
                    >
                      <Heart
                        className={`w-6 h-6 ${reel.isLiked ? 'fill-current' : ''}`}
                      />
                    </button>
                    <span className="text-white dark:text-gray-100 pooh:text-pooh-brown-dark text-sm">{reel.likeCount}</span>

                    <button className="p-3 rounded-full bg-black/50 dark:bg-gray-800/50 pooh:bg-pooh-burlywood/50 text-white dark:text-gray-100 pooh:text-pooh-brown-dark hover:bg-teal-600 dark:hover:bg-teal-500 pooh:hover:bg-pooh-yellow transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </button>

                    <button className="p-3 rounded-full bg-black/50 dark:bg-gray-800/50 pooh:bg-pooh-burlywood/50 text-white dark:text-gray-100 pooh:text-pooh-brown-dark hover:bg-teal-600 dark:hover:bg-teal-500 pooh:hover:bg-pooh-yellow transition-colors">
                      <Share2 className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => togglePlay(reel.id)}
                      className="p-3 rounded-full bg-black/50 dark:bg-gray-800/50 pooh:bg-pooh-burlywood/50 text-white dark:text-gray-100 pooh:text-pooh-brown-dark hover:bg-teal-600 dark:hover:bg-teal-500 pooh:hover:bg-pooh-yellow transition-colors"
                    >
                      {playing[reel.id] ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

