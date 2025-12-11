import { useState, useRef } from 'react';
import { supabase, Reel, User } from '../../lib/supabase';
import { Heart, MessageCircle, Share2, Play, Pause, Film } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../utils/formatDate';

interface ReelCardProps {
  reel: Reel & { author: User; likeCount: number; isLiked: boolean };
  onUpdate?: () => void;
}

export function ReelCard({ reel, onUpdate }: ReelCardProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('reel_reactions')
          .delete()
          .eq('reel_id', reel.id)
          .eq('user_id', user.id)
          .eq('type', 'like');
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase.from('reel_reactions').insert({
          reel_id: reel.id,
          user_id: user.id,
          type: 'like',
        });
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3 space-x-reverse">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center">
          <span className="text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark font-bold">
            {reel.author.full_name[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">
            {reel.author.full_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
            {formatDate(reel.created_at, language)}
          </p>
        </div>
        <div className="flex items-center text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark">
          <Film className="w-5 h-5" />
        </div>
      </div>

      {/* Video */}
      <div className="relative bg-black aspect-[9/16] max-h-[600px] flex items-center justify-center">
        <video
          ref={(el) => {
            if (el) {
              videoRef.current = el;
              el.addEventListener('play', () => setIsPlaying(true));
              el.addEventListener('pause', () => setIsPlaying(false));
            }
          }}
          src={reel.video_url}
          poster={reel.poster_frame_url || undefined}
          className="w-full h-full object-contain"
          loop
          muted
          playsInline
        />
        
        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
        >
          {!isPlaying && (
            <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 pooh:bg-pooh-cream/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark ml-1" />
            </div>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4 space-x-reverse mb-3">
          <button
            onClick={toggleLike}
            className={`flex items-center space-x-2 space-x-reverse ${
              isLiked
                ? 'text-red-600 dark:text-red-400 pooh:text-pooh-red'
                : 'text-gray-600 dark:text-gray-300 pooh:text-pooh-brown'
            } hover:opacity-80 transition-opacity`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likeCount}</span>
          </button>
          
          <button className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:opacity-80 transition-opacity">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium">0</span>
          </button>
          
          <button className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:opacity-80 transition-opacity">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark text-sm" dir="auto">
            <span className="font-semibold">{reel.author.full_name}</span> {reel.caption}
          </p>
        )}
      </div>
    </div>
  );
}

