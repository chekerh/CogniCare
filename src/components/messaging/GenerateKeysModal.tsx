import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateKeyPair, storePrivateKey } from '../../lib/encryption';
import { X, Key, CheckCircle } from 'lucide-react';

interface GenerateKeysModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function GenerateKeysModal({ onClose, onSuccess }: GenerateKeysModalProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      
      // Store private key locally
      storePrivateKey(user!.id, privateKey);

      // Store public key in database
      await supabase.from('user_keys').upsert({
        user_id: user!.id,
        public_key: publicKey,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error generating keys:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2 space-x-reverse">
            <Key className="w-6 h-6 text-teal-600" />
            <span>إعداد التشفير</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              تم إعداد التشفير بنجاح!
            </p>
            <p className="text-sm text-gray-600">
              رسائلك الآن مشفرة بشكل آمن
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              لاستخدام الرسائل المشفرة، نحتاج إلى إنشاء مفتاح تشفير خاص بك.
              هذا المفتاح سيتم حفظه محلياً على جهازك فقط.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                <strong>ملاحظة:</strong> المفتاح الخاص سيتم حفظه في المتصفح فقط.
                إذا قمت بمسح بيانات المتصفح، ستحتاج إلى إنشاء مفتاح جديد.
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'جاري الإنشاء...' : 'إنشاء المفاتيح'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

