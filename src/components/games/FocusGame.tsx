import { useState, useEffect, useRef } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { X, Star, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FocusGameProps {
  child: Child;
  gameLanguage: 'ar' | 'fr' | 'en';
  onExit: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  visible: boolean;
  color: string;
}

export function FocusGame({ child, gameLanguage, onExit }: FocusGameProps) {
  const { t } = useLanguage();
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const [startTime] = useState(Date.now());
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const targetAppearTime = useRef<number>(0);

  const translations = {
    title: {
      ar: 'تمرين التركيز',
      fr: 'Exercice de concentration',
      en: 'Focus Exercise',
    },
    score: {
      ar: 'النقاط',
      fr: 'Score',
      en: 'Score',
    },
    level: {
      ar: 'المستوى',
      fr: 'Niveau',
      en: 'Level',
    },
    tapTarget: {
      ar: 'اضغط على الهدف!',
      fr: 'Appuyez sur la cible!',
      en: 'Tap the target!',
    },
    great: {
      ar: 'رائع يا {name}!',
      fr: 'Super {name}!',
      en: 'Great job {name}!',
    },
    avgReactionTime: {
      ar: 'متوسط وقت الاستجابة',
      fr: 'Temps de réaction moyen',
      en: 'Average reaction time',
    },
    playAgain: {
      ar: 'العب مرة أخرى',
      fr: 'Rejouer',
      en: 'Play Again',
    },
    exit: {
      ar: 'خروج',
      fr: 'Quitter',
      en: 'Exit',
    },
  };

  useEffect(() => {
    if (gameActive) {
      spawnTarget();
    }
  }, [gameActive, level]);

  const spawnTarget = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * 70 + 10,
      y: Math.random() * 70 + 10,
      visible: true,
      color: randomColor,
    };

    setTargets([newTarget]);
    targetAppearTime.current = Date.now();

    const disappearTime = Math.max(2000 - level * 100, 800);
    setTimeout(() => {
      setTargets((prev) => prev.map(t => t.id === newTarget.id ? { ...t, visible: false } : t));
      setMisses(prev => prev + 1);

      setTimeout(() => {
        if (gameActive) spawnTarget();
      }, 500);
    }, disappearTime);
  };

  const handleTargetClick = (targetId: number) => {
    const reactionTime = Date.now() - targetAppearTime.current;
    setReactionTimes(prev => [...prev, reactionTime]);

    setTargets((prev) => prev.map(t => t.id === targetId ? { ...t, visible: false } : t));
    setScore(prev => prev + 10);

    if (score > 0 && score % 50 === 0) {
      setLevel(prev => prev + 1);
    }

    setTimeout(() => {
      if (gameActive) spawnTarget();
    }, 500);
  };

  const endGame = () => {
    setGameActive(false);
    saveGameSession();
  };

  const saveGameSession = async () => {
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;
      const accuracy = score / (score + misses * 10) * 100;

      await supabase.from('game_sessions').insert({
        child_id: child.id,
        game_type: 'focus_task',
        duration_seconds: duration,
        score,
        accuracy: Math.min(accuracy, 100),
        metrics: {
          level,
          hits: score / 10,
          misses,
          avgReactionTime: Math.floor(avgReactionTime),
          reactionTimes: reactionTimes.slice(0, 10),
        },
        camera_enabled: false,
      });
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  if (!gameActive) {
    const avgReactionTime = reactionTimes.length > 0
      ? Math.floor(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-yellow-500 fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {translations.great[gameLanguage].replace('{name}', child.name)}
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              {translations.score[gameLanguage]}: {score}
            </p>
            <p className="text-lg text-gray-600 mb-2">
              {translations.level[gameLanguage]}: {level}
            </p>
            <p className="text-md text-gray-500 mb-6">
              {translations.avgReactionTime[gameLanguage]}: {avgReactionTime}ms
            </p>
            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={() => {
                  setScore(0);
                  setMisses(0);
                  setLevel(1);
                  setReactionTimes([]);
                  setGameActive(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {translations.playAgain[gameLanguage]}
              </button>
              <button
                onClick={onExit}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                {translations.exit[gameLanguage]}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600">{translations.score[gameLanguage]}</p>
          <p className="text-2xl font-bold text-gray-900">{score}</p>
        </div>
        <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600">{translations.level[gameLanguage]}</p>
          <p className="text-2xl font-bold text-gray-900">{level}</p>
        </div>
        <button
          onClick={endGame}
          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white text-2xl font-bold animate-pulse">
          {translations.tapTarget[gameLanguage]}
        </p>
      </div>

      {targets.map((target) =>
        target.visible ? (
          <button
            key={target.id}
            onClick={() => handleTargetClick(target.id)}
            className={`absolute w-20 h-20 ${target.color} rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center justify-center animate-pulse`}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
            }}
          >
            <Target className="w-10 h-10 text-white" />
          </button>
        ) : null
      )}
    </div>
  );
}
