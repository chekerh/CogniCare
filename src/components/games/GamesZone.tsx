import { useState, useEffect } from 'react';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, Lock, Target, Mic, Brain } from 'lucide-react';
import { MemoryGame } from './MemoryGame';
import { FocusGame } from './FocusGame';
import { SpeechGame } from './SpeechGame';
import { useLanguage } from '../../contexts/LanguageContext';

export function GamesZone() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameLanguage, setGameLanguage] = useState<'ar' | 'fr' | 'en'>('ar');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [gamePin, setGamePin] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'mother') {
      loadChildren();
      loadGamePin();
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

  const loadGamePin = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('game_pin')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setGamePin(data?.game_pin || null);
    } catch (error) {
      console.error('Error loading PIN:', error);
    }
  };

  const handleGameExit = () => {
    if (gamePin) {
      setShowPinPrompt(true);
    } else {
      exitGame();
    }
  };

  const verifyPin = () => {
    if (pinInput === gamePin) {
      setPinInput('');
      setPinError('');
      setShowPinPrompt(false);
      exitGame();
    } else {
      setPinError('رمز PIN غير صحيح');
    }
  };

  const exitGame = () => {
    setSelectedGame(null);
  };

  const handleSetPin = async () => {
    if (!pinInput || pinInput.length < 4) {
      setPinError('رمز PIN يجب أن يكون 4 أرقام على الأقل');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ game_pin: pinInput })
        .eq('id', user!.id);

      if (error) throw error;

      setGamePin(pinInput);
      setPinInput('');
      setShowPinPrompt(false);
      alert('تم تعيين رمز PIN بنجاح');
    } catch (error) {
      console.error('Error setting PIN:', error);
      setPinError('فشل تعيين رمز PIN');
    }
  };

  if (user?.role !== 'mother') {
    return (
      <div className="text-center p-8 text-gray-500">
        هذه الصفحة متاحة فقط للأمهات
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white rounded-lg shadow-md">
        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">يجب إضافة طفل أولاً للوصول إلى منطقة الألعاب</p>
        <button
          onClick={() => window.location.hash = '#children'}
          className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          إضافة طفل
        </button>
      </div>
    );
  }

  if (showPinPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {gamePin ? 'أدخل رمز PIN' : 'تعيين رمز PIN'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {gamePin
              ? 'يجب إدخال رمز PIN للخروج من اللعبة'
              : 'حدد رمز PIN لحماية منطقة الألعاب (4 أرقام على الأقل)'}
          </p>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="****"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-2xl tracking-widest mb-4"
            maxLength={6}
          />
          {pinError && (
            <p className="text-red-600 text-sm mb-4">{pinError}</p>
          )}
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={gamePin ? verifyPin : handleSetPin}
              className="flex-1 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700"
            >
              {gamePin ? 'إرسال' : 'تعيين'}
            </button>
            {!gamePin && (
              <button
                onClick={() => {
                  setPinInput('');
                  setPinError('');
                  setShowPinPrompt(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showLanguageSelector && selectedGame) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            اختر لغة اللعبة
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            اختر اللغة المفضلة للعبة
          </p>
          <div className="space-y-3">
            {[
              { code: 'ar' as const, label: 'العربية', flag: '🇹🇳' },
              { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
              { code: 'en' as const, label: 'English', flag: '🇬🇧' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setGameLanguage(lang.code);
                  setShowLanguageSelector(false);
                }}
                className="w-full flex items-center space-x-3 space-x-reverse p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all"
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="text-lg font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedGame && selectedChild) {
    if (selectedGame === 'memory') {
      return <MemoryGame child={selectedChild} onExit={handleGameExit} />;
    } else if (selectedGame === 'focus') {
      return <FocusGame child={selectedChild} gameLanguage={gameLanguage} onExit={handleGameExit} />;
    } else if (selectedGame === 'speech') {
      return <SpeechGame child={selectedChild} gameLanguage={gameLanguage} onExit={handleGameExit} />;
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!selectedChild ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">اختر الطفل</h2>
            {!gamePin && (
              <button
                onClick={() => setShowPinPrompt(true)}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center space-x-1 space-x-reverse"
              >
                <Lock className="w-4 h-4" />
                <span>تعيين رمز PIN</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-right"
              >
                <p className="text-lg font-bold text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-600 mt-1">{child.age} سنوات</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  العب مع {selectedChild.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">اختر لعبة من القائمة أدناه</p>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                تغيير الطفل
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setSelectedGame('memory')}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لعبة الذاكرة</h3>
              <p className="text-sm text-gray-600">
                طابق البطاقات لتحسين الذاكرة
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedGame('focus');
                setShowLanguageSelector(true);
              }}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تمارين التركيز</h3>
              <p className="text-sm text-gray-600">
                تمارين لتحسين التركيز
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedGame('speech');
                setShowLanguageSelector(true);
              }}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تمرين النطق</h3>
              <p className="text-sm text-gray-600">
                تمارين النطق والكلام
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
