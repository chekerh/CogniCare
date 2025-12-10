import { useState, useEffect, useRef } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { X, Star, Camera, CameraOff } from 'lucide-react';
import { analyzeFrame, finalizeSession, calculateFallbackMetrics, FrameAnalysis } from '../../lib/ai';

interface MemoryGameProps {
  child: Child;
  onExit: () => void;
}

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export function MemoryGame({ child, onExit }: MemoryGameProps) {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const [frames, setFrames] = useState<FrameAnalysis[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const lastMoveTime = useRef<number>(Date.now());

  useEffect(() => {
    initializeGame();
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  const initializeGame = () => {
    const gameEmojis = emojis.slice(0, 6);
    const duplicatedEmojis = [...gameEmojis, ...gameEmojis];
    const shuffled = duplicatedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    lastMoveTime.current = Date.now();
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setVideoStream(stream);
      setCameraEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Capture frames every 2 seconds (0.5 fps)
      frameIntervalRef.current = window.setInterval(() => {
        captureFrame();
      }, 2000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraEnabled(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const analysis = await analyzeFrame(blob);
          setFrames((prev) => [...prev, analysis]);
        } catch (error) {
          console.error('Error analyzing frame:', error);
        }
      }
    }, 'image/jpeg', 0.8);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) {
      return;
    }

    // Track reaction time
    const reactionTime = Date.now() - lastMoveTime.current;
    setReactionTimes((prev) => [...prev, reactionTime]);
    lastMoveTime.current = Date.now();

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, flipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, matched: true }
              : card
          ));
          setFlippedCards([]);
          checkGameComplete();
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, flipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const checkGameComplete = () => {
    setTimeout(() => {
      const allMatched = cards.every(card => card.matched);
      if (allMatched) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const calculatedScore = Math.max(100 - moves * 5, 0);
        setScore(calculatedScore);
        setGameComplete(true);
        saveGameSession(duration, calculatedScore);
      }
    }, 100);
  };

  const saveGameSession = async (duration: number, finalScore: number) => {
    try {
      const accuracy = ((cards.length / 2) / moves) * 100;
      const errors = moves - (cards.length / 2);

      // Always use metrics-based analysis (primary method)
      // Optionally enhance with camera data if available
      let metrics: any = {};
      if (frames.length > 0) {
        try {
          const sessionMetrics = await finalizeSession(
            'temp-session-id',
            frames,
            []
          );
          metrics = {
            ...sessionMetrics,
            reaction_times: reactionTimes,
            errors,
          };
        } catch (error) {
          console.error('Error getting AI metrics from camera:', error);
          // Fall back to metrics-based analysis
          metrics = calculateFallbackMetrics(
            accuracy,
            reactionTimes,
            errors,
            duration
          );
        }
      } else {
        // Always use metrics-based analysis
        metrics = calculateFallbackMetrics(
          accuracy,
          reactionTimes,
          errors,
          duration
        );
      }

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          child_id: child.id,
          game_type: 'memory_match',
          duration_seconds: duration,
          score: finalScore,
          accuracy: Math.min(accuracy, 100),
          metrics: {
            moves,
            pairs: cards.length / 2,
            reaction_times: reactionTimes,
            avg_reaction_time: reactionTimes.length > 0 
              ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
              : 0,
            completion_time: duration,
            ...metrics,
          },
          camera_enabled: cameraEnabled,
          video_frames: frames.length > 0 ? frames : [],
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Always create AI report based on metrics
      if (session) {
        await supabase.from('ai_reports').insert({
          session_id: session.id,
          child_id: child.id,
          engagement_score: metrics.engagement_score || 50,
          attention_score: metrics.attention_score || 50,
          emotion_distribution: metrics.emotion_distribution || {},
          gaze_patterns: metrics.gaze_patterns || {},
          speech_emotions: metrics.speech_emotions || {},
          insights: metrics.recommendations?.join('\n') || generateInsights(metrics, accuracy, reactionTimes, duration),
          recommendations: metrics.recommendations || generateRecommendations(metrics, accuracy, reactionTimes, duration),
        });
      }
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  // Generate insights based on metrics
  const generateInsights = (metrics: any, accuracy: number, reactionTimes: number[], duration: number): string => {
    const insights: string[] = [];
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    if (accuracy >= 90) {
      insights.push('دقة ممتازة في اللعبة!');
    } else if (accuracy >= 70) {
      insights.push('دقة جيدة، يمكن تحسينها أكثر');
    }

    if (avgReactionTime < 1000 && reactionTimes.length > 0) {
      insights.push('سرعة رد فعل ممتازة');
    } else if (avgReactionTime < 2000) {
      insights.push('سرعة رد فعل جيدة');
    }

    if (duration < 60) {
      insights.push('إتمام سريع للعبة');
    }

    if (metrics.engagement_score >= 80) {
      insights.push('مستوى انخراط عالي');
    }

    return insights.length > 0 ? insights.join('\n') : 'أداء جيد في هذه الجلسة';
  };

  // Generate recommendations based on metrics
  const generateRecommendations = (metrics: any, accuracy: number, reactionTimes: number[], duration: number): string[] => {
    const recommendations: string[] = [];
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;

    if (accuracy < 70) {
      recommendations.push('تدريب إضافي على التركيز والدقة');
    }

    if (avgReactionTime > 2000) {
      recommendations.push('تمارين لتحسين سرعة رد الفعل');
    }

    if (metrics.engagement_score < 60) {
      recommendations.push('محاولة ألعاب مختلفة لزيادة الاهتمام');
    }

    if (duration > 300) {
      recommendations.push('أخذ فترات راحة بين الجلسات');
    }

    return recommendations.length > 0 ? recommendations : ['استمر في الممارسة للحفاظ على التقدم'];
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 dark:from-gray-800 dark:to-gray-900 pooh:from-pooh-cream pooh:to-pooh-beige flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
        {/* Camera toggle */}
        <div className="absolute top-4 left-4">
          <button
            onClick={cameraEnabled ? () => {
              if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
              }
              if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
              }
              setCameraEnabled(false);
              setVideoStream(null);
            } : requestCameraPermission}
            className={`p-2 rounded-full ${
              cameraEnabled
                ? 'bg-green-100 dark:bg-green-900/30 pooh:bg-pooh-yellow-light text-green-700 dark:text-green-300 pooh:text-pooh-brown-dark'
                : 'bg-gray-100 dark:bg-gray-700 pooh:bg-pooh-burlywood text-gray-600 dark:text-gray-300 pooh:text-pooh-brown'
            } hover:bg-opacity-80 transition-colors`}
            title={cameraEnabled ? 'إيقاف الكاميرا' : 'تفعيل الكاميرا للتحليل'}
          >
            {cameraEnabled ? (
              <Camera className="w-5 h-5" />
            ) : (
              <CameraOff className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hidden video and canvas for frame capture */}
        {cameraEnabled && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">لعبة الذاكرة</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">المحاولات: {moves}</p>
            {cameraEnabled && (
              <p className="text-xs text-green-600 dark:text-green-400 pooh:text-pooh-yellow-dark mt-1">✓ التحليل بالذكاء الاصطناعي مفعل</p>
            )}
          </div>
          <button
            onClick={onExit}
            className="p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-red-600 dark:hover:text-red-400 pooh:hover:text-pooh-red hover:bg-red-50 dark:hover:bg-red-900/20 pooh:hover:bg-pooh-red/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {gameComplete ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-yellow-500 dark:text-yellow-400 pooh:text-pooh-yellow-dark fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2">أحسنت يا {child.name}!</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-2">أكملت اللعبة في {moves} محاولة</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark mb-6">النقاط: {score}</p>
            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={() => {
                  setGameComplete(false);
                  setMoves(0);
                  setScore(0);
                  setFlippedCards([]);
                  setFrames([]);
                  setReactionTimes([]);
                  initializeGame();
                }}
                className="bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-6 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
              >
                العب مرة أخرى
              </button>
              <button
                onClick={onExit}
                className="bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood text-gray-700 dark:text-gray-300 pooh:text-pooh-brown-dark px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all transform hover:scale-105 ${
                  card.flipped || card.matched
                    ? 'bg-white dark:bg-gray-700 pooh:bg-pooh-cream border-2 border-teal-400 dark:border-teal-500 pooh:border-pooh-yellow shadow-lg'
                    : 'bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 pooh:from-pooh-yellow pooh:to-pooh-yellow-dark hover:from-teal-600 hover:to-cyan-700 dark:hover:from-teal-700 dark:hover:to-cyan-800 pooh:hover:from-pooh-yellow-dark pooh:hover:to-pooh-yellow'
                }`}
                disabled={card.matched}
              >
                {(card.flipped || card.matched) ? card.emoji : ''}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
