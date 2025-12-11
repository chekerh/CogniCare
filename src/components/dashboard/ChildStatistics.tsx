import { useState, useEffect } from 'react';
import { supabase, Child, GameSession, AIReport } from '../../lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Target, Award, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChildStatisticsProps {
  child: Child;
  onBack?: () => void;
}

const COLORS = {
  good: '#10b981',      // green
  average: '#f59e0b',  // yellow
  needsImprovement: '#ef4444', // red
  primary: '#14b8a6',   // teal
  secondary: '#06b6d4', // cyan
};

export function ChildStatistics({ child, onBack }: ChildStatisticsProps) {
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'reaction' | 'accuracy' | 'completion' | 'score' | 'engagement'>('accuracy');

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
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (sessions.length === 0) return null;

    const reactionTimes = sessions.flatMap(s => {
      const metrics = s.metrics as any;
      return metrics?.reaction_times || [];
    });

    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
    
    const avgCompletionTime = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / sessions.length;
    
    const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
    
    const avgEngagement = reports.length > 0
      ? reports.reduce((sum, r) => sum + r.engagement_score, 0) / reports.length
      : 0;

    // Calculate trends (comparing last 3 sessions with previous 3)
    const recentSessions = sessions.slice(-3);
    const previousSessions = sessions.slice(-6, -3);

    const recentAvgAccuracy = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
      : 0;
    
    const previousAvgAccuracy = previousSessions.length > 0
      ? previousSessions.reduce((sum, s) => sum + s.accuracy, 0) / previousSessions.length
      : 0;

    const accuracyTrend = recentAvgAccuracy - previousAvgAccuracy;

    return {
      avgReactionTime,
      avgAccuracy,
      avgCompletionTime,
      avgScore,
      avgEngagement,
      accuracyTrend,
      totalSessions: sessions.length,
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    return sessions.map((session, index) => {
      const metrics = session.metrics as any;
      const reactionTimes = metrics?.reaction_times || [];
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a: number, b: number) => a + b, 0) / reactionTimes.length
        : 0;

      const report = reports.find(r => r.session_id === session.id);

      const locale = language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US';
      return {
        name: `${t('dashboard.session')} ${index + 1}`,
        date: new Date(session.created_at).toLocaleDateString(locale),
        reactionTime: avgReactionTime,
        accuracy: session.accuracy,
        completionTime: session.duration_seconds,
        score: session.score,
        engagement: report?.engagement_score || 0,
      };
    });
  };

  // Get metric color based on value
  const getMetricColor = (value: number, type: 'reaction' | 'accuracy' | 'completion' | 'score' | 'engagement'): string => {
    if (type === 'reaction') {
      // Lower is better for reaction time
      if (value < 1000) return COLORS.good;
      if (value < 2000) return COLORS.average;
      return COLORS.needsImprovement;
    }
    if (type === 'accuracy' || type === 'score' || type === 'engagement') {
      // Higher is better
      if (value >= 80) return COLORS.good;
      if (value >= 60) return COLORS.average;
      return COLORS.needsImprovement;
    }
    if (type === 'completion') {
      // Lower is better for completion time
      if (value < 120) return COLORS.good;
      if (value < 240) return COLORS.average;
      return COLORS.needsImprovement;
    }
    return COLORS.primary;
  };

  const metrics = calculateMetrics();
  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">{t('dashboard.loading')}</div>
      </div>
    );
  }

  if (!metrics || sessions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
          {t('dashboard.noData')}
        </p>
      </div>
    );
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
                {t('dashboard.back')}
              </button>
            )}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-2">
              {t('dashboard.statistics')} {child.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 pooh:text-pooh-brown">
              {metrics.totalSessions} {t('dashboard.session')} • {reports.length} {t('dashboard.report')}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title={t('dashboard.avgReactionTime')}
          value={`${(metrics.avgReactionTime / 1000).toFixed(1)}s`}
          icon={Zap}
          color={getMetricColor(metrics.avgReactionTime, 'reaction')}
          trend={null}
        />
        <MetricCard
          title={t('dashboard.avgAccuracy')}
          value={`${metrics.avgAccuracy.toFixed(1)}%`}
          icon={Target}
          color={getMetricColor(metrics.avgAccuracy, 'accuracy')}
          trend={metrics.accuracyTrend}
        />
        <MetricCard
          title={t('dashboard.avgCompletionTime')}
          value={`${Math.floor(metrics.avgCompletionTime / 60)}:${String(Math.floor(metrics.avgCompletionTime % 60)).padStart(2, '0')}`}
          icon={Clock}
          color={getMetricColor(metrics.avgCompletionTime, 'completion')}
          trend={null}
        />
        <MetricCard
          title={t('dashboard.avgScore')}
          value={metrics.avgScore.toFixed(0)}
          icon={Award}
          color={getMetricColor(metrics.avgScore, 'score')}
          trend={null}
        />
        <MetricCard
          title={t('dashboard.avgEngagement')}
          value={`${metrics.avgEngagement.toFixed(1)}%`}
          icon={TrendingUp}
          color={getMetricColor(metrics.avgEngagement, 'engagement')}
          trend={null}
        />
      </div>

      {/* Metric Selector */}
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">
          {t('dashboard.selectMetric')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['reaction', 'accuracy', 'completion', 'score', 'engagement'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedMetric === metric
                  ? 'bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark'
                  : 'bg-gray-100 dark:bg-gray-700 pooh:bg-pooh-cream text-gray-700 dark:text-gray-300 pooh:text-pooh-brown hover:bg-gray-200 dark:hover:bg-gray-600 pooh:hover:bg-pooh-yellow-light'
              }`}
            >
              {metric === 'reaction' && t('dashboard.reactionTime')}
              {metric === 'accuracy' && t('dashboard.accuracy')}
              {metric === 'completion' && t('dashboard.completionTime')}
              {metric === 'score' && t('dashboard.score')}
              {metric === 'engagement' && t('dashboard.engagement')}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">
          {t('dashboard.trendOverTime')}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={
                selectedMetric === 'reaction' ? 'reactionTime' :
                selectedMetric === 'accuracy' ? 'accuracy' :
                selectedMetric === 'completion' ? 'completionTime' :
                selectedMetric === 'score' ? 'score' :
                'engagement'
              }
              stroke={COLORS.primary}
              strokeWidth={2}
              name={
                selectedMetric === 'reaction' ? t('dashboard.reactionTimeMs') :
                selectedMetric === 'accuracy' ? t('dashboard.accuracyPercent') :
                selectedMetric === 'completion' ? t('dashboard.completionTimeSeconds') :
                selectedMetric === 'score' ? t('dashboard.score') :
                t('dashboard.engagementPercent')
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Chart */}
      {sessions.length >= 6 && (
        <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark mb-4">
            {t('dashboard.recentSessionsComparison')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              {
                name: t('dashboard.previousThreeSessions'),
                accuracy: sessions.slice(-6, -3).reduce((sum, s) => sum + s.accuracy, 0) / 3,
                engagement: reports.slice(-6, -3).reduce((sum, r) => sum + r.engagement_score, 0) / 3,
              },
              {
                name: t('dashboard.lastThreeSessions'),
                accuracy: sessions.slice(-3).reduce((sum, s) => sum + s.accuracy, 0) / 3,
                engagement: reports.slice(-3).reduce((sum, r) => sum + r.engagement_score, 0) / 3,
              },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill={COLORS.primary} name={t('dashboard.accuracyPercent')} />
              <Bar dataKey="engagement" fill={COLORS.secondary} name={t('dashboard.engagementPercent')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: number | null;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-xl shadow-md p-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" style={{ color }} />
        {trend !== null && trend !== 0 && (
          <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-xs ml-1">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h4 className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mb-1">{title}</h4>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}


