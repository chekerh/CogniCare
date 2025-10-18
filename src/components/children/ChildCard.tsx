import { Child } from '../../lib/supabase';
import { User, Calendar, GraduationCap, Activity } from 'lucide-react';

interface ChildCardProps {
  child: Child;
  onSelect: () => void;
  onUpdate: () => void;
}

export function ChildCard({ child, onSelect }: ChildCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>

          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{child.age} سنوات</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm">
                {child.gender === 'male' ? 'ذكر' : child.gender === 'female' ? 'أنثى' : 'آخر'}
              </span>
            </div>

            {child.education_level && (
              <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">{child.education_level}</span>
              </div>
            )}

            {child.diagnosis.length > 0 && (
              <div className="flex items-start space-x-2 space-x-reverse text-gray-600">
                <Activity className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {child.diagnosis.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-3 space-x-reverse">
            <button
              onClick={onSelect}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm"
            >
              عرض التفاصيل
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
              التقارير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
