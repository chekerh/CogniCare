import { useEffect, useState } from 'react';
import { supabase, Child, GameSession, AIReport } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ChildWithStats {
  child: Child;
  sessions: number;
  avgAccuracy: number | null;
  avgEngagement: number | null;
}

export function ParentChildStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ChildWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'mother') {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      // 1) Load children for this mother
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });

      if (childrenError) {
        console.error('Error loading children for stats:', childrenError);
        return;
      }

      if (!children || children.length === 0) {
        setStats([]);
        return;
      }

      const childIds = children.map((c) => c.id);

      // 2) Load game sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .in('child_id', childIds);

      if (sessionsError) {
        console.error('Error loading game sessions for stats:', sessionsError);
      }

      // 3) Load AI reports
      const { data: reports, error: reportsError } = await supabase
        .from('ai_reports')
        .select('*')
        .in('child_id', childIds);

      if (reportsError) {
        console.error('Error loading AI reports for stats:', reportsError);
      }

      const sessionsByChild: Record<string, GameSession[]> = {};
      const reportsByChild: Record<string, AIReport[]> = {};

      (sessions || []).forEach((s) => {
        if (!sessionsByChild[s.child_id]) sessionsByChild[s.child_id] = [];
        sessionsByChild[s.child_id].push(s);
      });

      (reports || []).forEach((r) => {
        if (!reportsByChild[r.child_id]) reportsByChild[r.child_id] = [];
        reportsByChild[r.child_id].push(r);
      });

      const aggregated: ChildWithStats[] = children.map((child) => {
        const childSessions = sessionsByChild[child.id] || [];
        const childReports = reportsByChild[child.id] || [];

        const sessionsCount = childSessions.length;

        const avgAccuracy =
          sessionsCount > 0
            ? childSessions.reduce((sum, s) => sum + s.accuracy, 0) / sessionsCount
            : null;

        const avgEngagement =
          childReports.length > 0
            ? childReports.reduce((sum, r) => sum + r.engagement_score, 0) /
              childReports.length
            : null;

        return {
          child,
          sessions: sessionsCount,
          avgAccuracy,
          avgEngagement,
        };
      });

      setStats(aggregated);
    } catch (error) {
      console.error('Error loading parent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'mother') {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
        جاري تحميل إحصائيات تقدم الأطفال...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
        لم تتم إضافة أي أطفال بعد. أضيفي طفلاً من تبويب "أطفالي" لبدء تتبع التقدم.
      </div>
    );
  }

  return (
    <div className="mt-8 text-right">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">
        إحصائيات سريعة عن تقدم أطفالك
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map(({ child, sessions, avgAccuracy, avgEngagement }) => (
          <div
            key={child.id}
            className="border border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50 pooh:bg-pooh-cream"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{child.name}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
                العمر: {child.age}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
              عدد الجلسات: <span className="font-semibold">{sessions}</span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown mb-1">
              متوسط الدقة:{' '}
              <span className="font-semibold">
                {avgAccuracy !== null ? `${avgAccuracy.toFixed(1)}%` : 'لا توجد بيانات بعد'}
              </span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 pooh:text-pooh-brown">
              متوسط الانخراط (AI):{' '}
              <span className="font-semibold">
                {avgEngagement !== null
                  ? `${avgEngagement.toFixed(1)}%`
                  : 'لا توجد تقارير بعد'}
              </span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
        للحصول على تفاصيل أكثر وملفات PDF، استخدمي تبويب &quot;لوحات التقدم&quot; لكل طفل.
      </p>
    </div>
  );
}


