import { useState, useEffect } from 'react';
import { supabase, Conversation, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<(Conversation & { otherUser: User; unreadCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
      subscribeToConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${user!.id},participant2_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get other user info and unread counts
      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant1_id === user!.id
            ? conv.participant2_id
            : conv.participant1_id;

          const { data: otherUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', otherUserId)
            .single();

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('recipient_id', user!.id)
            .eq('is_read', false);

          return {
            ...conv,
            otherUser: otherUser as User,
            unreadCount: count || 0,
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user!.id}`,
      }, () => {
        loadConversations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant2_id=eq.${user!.id}`,
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2 space-x-reverse">
            <MessageCircle className="w-6 h-6 text-teal-600" />
            <span>الرسائل</span>
          </h2>
          <button className="flex items-center space-x-2 space-x-reverse bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>رسالة جديدة</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن محادثة..."
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد محادثات بعد</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold">
                    {conv.otherUser.full_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.otherUser.full_name}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conv.last_message_preview || 'لا توجد رسائل'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(conv.last_message_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

