import { Child } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Calendar, GraduationCap, Activity } from 'lucide-react';

interface ChildCardProps {
  child: Child;
  onSelect: () => void;
  onUpdate: () => void;
}

export function ChildCard({ child, onSelect }: ChildCardProps) {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 dark:from-teal-500 dark:to-cyan-600 pooh:from-pooh-yellow pooh:to-pooh-yellow-dark rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white dark:text-gray-100 pooh:text-pooh-brown-dark" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{child.name}</h3>

          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{child.age} {t('children.years')}</span>
              <span className="text-gray-400 dark:text-gray-500 pooh:text-pooh-brown">•</span>
              <span className="text-sm">
                {child.gender === 'male' ? t('children.genderMale') : child.gender === 'female' ? t('children.genderFemale') : t('children.genderOther')}
              </span>
            </div>

            {child.education_level && (
              <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">{child.education_level}</span>
              </div>
            )}

            {child.diagnosis.length > 0 && (
              <div className="flex items-start space-x-2 space-x-reverse text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                <Activity className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {child.diagnosis.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark text-xs rounded-full"
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
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors text-sm"
            >
              {t('children.viewDetails')}
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 pooh:bg-pooh-burlywood text-gray-700 dark:text-gray-300 pooh:text-pooh-brown-dark rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow transition-colors text-sm">
              {t('children.reports')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
