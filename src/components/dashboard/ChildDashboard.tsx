import { useState, useEffect } from 'react';
import { supabase, Child, GameSession, AIReport } from '../../lib/supabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Download, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import { ChildStatistics } from './ChildStatistics';

interface ChildDashboardProps {
  child: Child;
  onBack?: () => void;
}

const COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ChildDashboard({ child, onBack }: ChildDashboardProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    loadData();
  }, [child.id]);

  const loadData = async () => {
    try {
      const { data: sessionsData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_id', child.id)
        .order('created_at', { ascending: true });

      const { data: reportsData } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('child_id', child.id)
        .order('created_at', { ascending: true });

      setSessions(sessionsData || []);
      setReports(reportsData || []);

      // Calculate achievements
      const calculatedAchievements = calculateAchievements(sessionsData || [], reportsData || []);
      setAchievements(calculatedAchievements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (sessions: GameSession[], reports: AIReport[]): any[] => {
    const achievements: any[] = [];

    // Daily streak
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const hasSession = sessions.some((s) => {
        const sessionDate = new Date(s.created_at);
        return sessionDate.toDateString() === date.toDateString();
      });
      if (hasSession) streak++;
      else break;
    }
    if (streak > 0) {
      achievements.push({
        id: 'streak',
        title: `سلسلة ${streak} يوم`,
        description: 'لعب متواصل',
        icon: Calendar,
        color: 'bg-yellow-500',
      });
    }

    // High accuracy
    const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
    if (avgAccuracy >= 90) {
      achievements.push({
        id: 'accuracy',
        title: 'دقة عالية',
        description: `متوسط ${avgAccuracy.toFixed(0)}%`,
        icon: TrendingUp,
        color: 'bg-green-500',
      });
    }

    // Engagement milestone
    const avgEngagement = reports.reduce((sum, r) => sum + r.engagement_score, 0) / reports.length;
    if (avgEngagement >= 80) {
      achievements.push({
        id: 'engagement',
        title: 'انخراط ممتاز',
        description: `متوسط ${avgEngagement.toFixed(0)}%`,
        icon: Trophy,
        color: 'bg-purple-500',
      });
    }

    return achievements;
  };

  const prepareChartData = () => {
    return sessions.map((session, index) => ({
      name: `جلسة ${index + 1}`,
      accuracy: session.accuracy,
      score: session.score,
      engagement: reports[index]?.engagement_score || 0,
      date: new Date(session.created_at).toLocaleDateString('ar'),
    }));
  };

  const prepareEmotionData = () => {
    const emotionCounts: Record<string, number> = {};
    reports.forEach((report) => {
      const emotions = report.emotion_distribution || {};
      Object.keys(emotions).forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + emotions[emotion];
      });
    });

    return Object.entries(emotionCounts).map(([name, value]) => ({
      name,
      value: value * 100,
    }));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`تقرير تقدم ${child.name}`, 105, 20, { align: 'center' });

    let y = 40;
    doc.setFontSize(12);
    doc.text(`عدد الجلسات: ${sessions.length}`, 20, y);
    y += 10;
    doc.text(`متوسط الدقة: ${(sessions.reduce((s, a) => s + a.accuracy, 0) / sessions.length).toFixed(1)}%`, 20, y);
    y += 10;
    doc.text(`متوسط الانخراط: ${(reports.reduce((s, a) => s + a.engagement_score, 0) / reports.length).toFixed(1)}%`, 20, y);

    doc.save(`تقرير_${child.name}_${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">جاري التحميل...</div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const emotionData = prepareEmotionData();

  if (showStatistics) {
    return <ChildStatistics child={child} onBack={() => setShowStatistics(false)} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="mb-4 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark hover:text-teal-700 dark:hover:text-teal-300 pooh:hover:text-pooh-yellow text-sm"
              >
                ← العودة
              </button>
            )}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2">لوحة تقدم {child.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
              {sessions.length} جلسة • {reports.length} تقرير AI
            </p>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setShowStatistics(true)}
              className="flex items-center space-x-2 space-x-reverse bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>إحصائيات مفصلة</span>
            </button>
          <button
            onClick={exportPDF}
              className="flex items-center space-x-2 space-x-reverse bg-gray-600 dark:bg-gray-500 pooh:bg-pooh-burlywood text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>تصدير PDF</span>
          </button>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">الإنجازات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`${achievement.color} rounded-xl p-4 text-white`}
              >
                <achievement.icon className="w-8 h-8 mb-2" />
                <h4 className="font-bold">{achievement.title}</h4>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Over Time */}
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">الدقة عبر الوقت</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Over Time */}
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">الانخراط عبر الوقت</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">توزيع النقاط</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Distribution */}
        {emotionData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">توزيع المشاعر</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">الجلسات الأخيرة</h3>
        <div className="space-y-4">
          {sessions.slice(-5).reverse().map((session) => {
            const report = reports.find((r) => r.session_id === session.id);
            return (
              <div key={session.id} className="border border-gray-200 dark:border-gray-700 pooh:border-pooh-burlywood rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 pooh:bg-pooh-cream">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark">{session.game_type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                      {new Date(session.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark">الدقة: {session.accuracy.toFixed(1)}%</p>
                    {report && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
                        الانخراط: {report.engagement_score.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

