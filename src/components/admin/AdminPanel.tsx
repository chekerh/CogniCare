import { useState, useEffect } from 'react';
import { supabase, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, Flag, BarChart3, CheckCircle, XCircle, Ban } from 'lucide-react';

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        setUsers(data || []);
      } else if (activeTab === 'flags') {
        const { data } = await supabase
          .from('content_flags')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        setFlags(data || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspension_reason: reason,
        })
        .eq('id', userId);
      loadData();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const approveSpecialist = async (userId: string) => {
    try {
      await supabase
        .from('specialists')
        .update({ verified_at: new Date().toISOString() })
        .eq('user_id', userId);
      await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', userId);
      loadData();
    } catch (error) {
      console.error('Error approving specialist:', error);
    }
  };

  const resolveFlag = async (flagId: string, action: string) => {
    try {
      await supabase
        .from('content_flags')
        .update({
          status: 'resolved',
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', flagId);
      loadData();
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8 text-gray-500">
        ليس لديك صلاحية للوصول إلى هذه الصفحة
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'flags', label: 'المحتوى المبلغ عنه', icon: Flag },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-2 space-x-reverse mb-6">
          <Shield className="w-8 h-8 text-teal-600" />
          <h2 className="text-3xl font-bold text-gray-800">لوحة الإدارة</h2>
        </div>

        <div className="flex space-x-4 space-x-reverse border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">جاري التحميل...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">إدارة المستخدمين</h3>
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <h4 className="font-semibold text-gray-900">{u.full_name}</h4>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                          {u.role}
                        </span>
                        {u.is_verified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {u.is_suspended && (
                          <Ban className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{u.email}</p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      {u.role === 'specialist' && !u.is_verified && (
                        <button
                          onClick={() => approveSpecialist(u.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          الموافقة
                        </button>
                      )}
                      {!u.is_suspended && (
                        <button
                          onClick={() => suspendUser(u.id, 'Violation of terms')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          تعليق
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">المحتوى المبلغ عنه</h3>
              <div className="space-y-4">
                {flags.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد تقارير معلقة</p>
                ) : (
                  flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{flag.reason}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            النوع: {flag.content_type} | ID: {flag.content_id}
                          </p>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => resolveFlag(flag.id, 'dismiss')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          >
                            رفض
                          </button>
                          <button
                            onClick={() => resolveFlag(flag.id, 'remove')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">التحليلات</h3>
              <p className="text-gray-600">ميزة التحليلات قيد التطوير</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

