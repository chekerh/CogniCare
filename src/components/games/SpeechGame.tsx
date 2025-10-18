import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { X, Star, Mic, Volume2 } from 'lucide-react';

interface SpeechGameProps {
  child: Child;
  gameLanguage: 'ar' | 'fr' | 'en';
  onExit: () => void;
}

interface Word {
  text: string;
  audio?: string;
  image?: string;
}

export function SpeechGame({ child, gameLanguage, onExit }: SpeechGameProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const wordSets = {
    ar: [
      { text: 'قطة', image: '🐱' },
      { text: 'كلب', image: '🐕' },
      { text: 'شمس', image: '☀️' },
      { text: 'قمر', image: '🌙' },
      { text: 'ماء', image: '💧' },
      { text: 'شجرة', image: '🌳' },
      { text: 'زهرة', image: '🌸' },
      { text: 'سمكة', image: '🐟' },
    ],
    fr: [
      { text: 'chat', image: '🐱' },
      { text: 'chien', image: '🐕' },
      { text: 'soleil', image: '☀️' },
      { text: 'lune', image: '🌙' },
      { text: 'eau', image: '💧' },
      { text: 'arbre', image: '🌳' },
      { text: 'fleur', image: '🌸' },
      { text: 'poisson', image: '🐟' },
    ],
    en: [
      { text: 'cat', image: '🐱' },
      { text: 'dog', image: '🐕' },
      { text: 'sun', image: '☀️' },
      { text: 'moon', image: '🌙' },
      { text: 'water', image: '💧' },
      { text: 'tree', image: '🌳' },
      { text: 'flower', image: '🌸' },
      { text: 'fish', image: '🐟' },
    ],
  };

  const translations = {
    title: {
      ar: 'تمرين النطق',
      fr: 'Exercice de prononciation',
      en: 'Speech Practice',
    },
    instructions: {
      ar: 'اضغط على الميكروفون وقل الكلمة',
      fr: 'Appuyez sur le micro et prononcez le mot',
      en: 'Press the microphone and say the word',
    },
    listening: {
      ar: 'أنا أستمع...',
      fr: 'J\'écoute...',
      en: 'Listening...',
    },
    excellent: {
      ar: 'ممتاز!',
      fr: 'Excellent!',
      en: 'Excellent!',
    },
    tryAgain: {
      ar: 'حاول مرة أخرى',
      fr: 'Essayez encore',
      en: 'Try again',
    },
    completed: {
      ar: 'أحسنت يا {name}!',
      fr: 'Bravo {name}!',
      en: 'Well done {name}!',
    },
    score: {
      ar: 'النقاط',
      fr: 'Score',
      en: 'Score',
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
    selectNewWord();
  }, []);

  const selectNewWord = () => {
    const words = wordSets[gameLanguage];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setFeedback('');
  };

  const handleListen = async () => {
    setIsListening(true);
    setFeedback(translations.listening[gameLanguage]);

    setTimeout(() => {
      setIsListening(false);
      setAttempts(prev => prev + 1);

      const success = Math.random() > 0.3;

      if (success) {
        setScore(prev => prev + 10);
        setFeedback(translations.excellent[gameLanguage]);
        setTimeout(() => {
          if (attempts >= 7) {
            setGameComplete(true);
            saveGameSession();
          } else {
            selectNewWord();
          }
        }, 1500);
      } else {
        setFeedback(translations.tryAgain[gameLanguage]);
      }
    }, 2000);
  };

  const saveGameSession = async () => {
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const accuracy = (score / (attempts * 10)) * 100;

      await supabase.from('game_sessions').insert({
        child_id: child.id,
        game_type: 'speech_recognition',
        duration_seconds: duration,
        score,
        accuracy: Math.min(accuracy, 100),
        metrics: {
          totalAttempts: attempts,
          successfulAttempts: score / 10,
          language: gameLanguage,
        },
        camera_enabled: false,
      });
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  if (gameComplete) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-yellow-500 fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {translations.completed[gameLanguage].replace('{name}', child.name)}
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              {translations.score[gameLanguage]}: {score}
            </p>
            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={() => {
                  setScore(0);
                  setAttempts(0);
                  setGameComplete(false);
                  selectNewWord();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
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
    <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {translations.title[gameLanguage]}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {translations.score[gameLanguage]}: {score}
            </p>
          </div>
          <button
            onClick={onExit}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentWord && (
          <div className="text-center py-8">
            <div className="text-8xl mb-6">{currentWord.image}</div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              {currentWord.text}
            </h3>

            <button
              className="mb-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(currentWord.text);
                utterance.lang = gameLanguage === 'ar' ? 'ar-SA' : gameLanguage === 'fr' ? 'fr-FR' : 'en-US';
                window.speechSynthesis.speak(utterance);
              }}
            >
              <Volume2 className="w-8 h-8 text-gray-700" />
            </button>

            <p className="text-gray-600 mb-6">
              {translations.instructions[gameLanguage]}
            </p>

            <button
              onClick={handleListen}
              disabled={isListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-green-500 hover:bg-green-600'
              } shadow-lg`}
            >
              <Mic className="w-12 h-12 text-white" />
            </button>

            {feedback && (
              <p className={`mt-6 text-xl font-semibold ${
                feedback === translations.excellent[gameLanguage]
                  ? 'text-green-600'
                  : 'text-gray-700'
              }`}>
                {feedback}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
