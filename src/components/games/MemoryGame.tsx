import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { X, Star } from 'lucide-react';

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

  useEffect(() => {
    initializeGame();
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
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) {
      return;
    }

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
      const allMatched = cards.every(card => card.matched || card.id === flippedCards[0] || card.id === flippedCards[1]);
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

      await supabase.from('game_sessions').insert({
        child_id: child.id,
        game_type: 'memory_match',
        duration_seconds: duration,
        score: finalScore,
        accuracy: Math.min(accuracy, 100),
        metrics: { moves, pairs: cards.length / 2 },
        camera_enabled: false,
      });
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">لعبة الذاكرة</h2>
            <p className="text-sm text-gray-600">المحاولات: {moves}</p>
          </div>
          <button
            onClick={onExit}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {gameComplete ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-yellow-500 fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">أحسنت يا {child.name}!</h3>
            <p className="text-lg text-gray-600 mb-2">أكملت اللعبة في {moves} محاولة</p>
            <p className="text-2xl font-bold text-teal-600 mb-6">النقاط: {score}</p>
            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={() => {
                  setGameComplete(false);
                  setMoves(0);
                  setScore(0);
                  setFlippedCards([]);
                  initializeGame();
                }}
                className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                العب مرة أخرى
              </button>
              <button
                onClick={onExit}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
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
                className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all transform hover:scale-105 ${
                  card.flipped || card.matched
                    ? 'bg-white border-2 border-teal-400'
                    : 'bg-gradient-to-br from-teal-500 to-cyan-600'
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
