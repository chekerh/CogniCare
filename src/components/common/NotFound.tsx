import { Home } from 'lucide-react';

export function NotFound() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-teal-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h1>
        <p className="text-gray-600 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex space-x-4 space-x-reverse justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
}

