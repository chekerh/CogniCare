import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Gamepad2, Lock } from 'lucide-react';
import { MemoryGame } from './MemoryGame';

export function GamesZone() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'mother') {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('mother_id', user!.id);

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'mother') {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
        {t('games.mothersOnly')}
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-8 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">{t('common.loading')}</div>;
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md">
        <Lock className="w-16 h-16 text-gray-300 dark:text-gray-600 pooh:text-pooh-burlywood mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-4">{t('games.addChildFirst')}</p>
        <button
          onClick={() => window.location.hash = '#children'}
          className="bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-6 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
        >
          {t('games.addChild')}
        </button>
      </div>
    );
  }

  if (selectedGame && selectedChild) {
    return (
      <div>
        {selectedGame === 'memory' && (
          <MemoryGame
            child={selectedChild}
            onExit={() => {
              setSelectedGame(null);
              setSelectedChild(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!selectedChild ? (
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">{t('games.selectChild')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood rounded-lg hover:border-teal-500 dark:hover:border-teal-400 pooh:hover:border-pooh-yellow hover:bg-teal-50 dark:hover:bg-teal-900/20 pooh:hover:bg-pooh-yellow-light transition-all text-right bg-white dark:bg-gray-700 pooh:bg-pooh-cream"
              >
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{child.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mt-1">{child.age} {t('games.years')}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark">
                  {t('games.playWith')} {selectedChild.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mt-1">{t('games.selectGame')}</p>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-gray-800 dark:hover:text-gray-100 pooh:hover:text-pooh-brown-dark"
              >
                {t('games.changeChild')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedGame('memory')}
              className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-8 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 dark:from-teal-500 dark:to-cyan-600 pooh:from-pooh-yellow pooh:to-pooh-yellow-dark rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8 text-white dark:text-gray-900 pooh:text-pooh-brown-dark" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2">{t('games.memoryGame')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                {t('games.memoryDescription')}
              </p>
            </button>

            <div className="bg-gray-100 dark:bg-gray-700 pooh:bg-pooh-burlywood/30 rounded-lg shadow-md p-8 text-center opacity-60">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 pooh:bg-pooh-burlywood rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400 pooh:text-pooh-brown" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-2">{t('games.moreGames')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">{t('games.comingSoon')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
