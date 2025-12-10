import { useState, useEffect } from 'react';
import { supabase, Conversation, User } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { ChatWindow } from './ChatWindow';
import { GenerateKeysModal } from './GenerateKeysModal';
import { getPrivateKey } from '../../lib/encryption';

export function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<(Conversation & { otherUser: User; unreadCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { otherUser: User }) | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);

  useEffect(() => {
    // Check if user has encryption keys
    if (user && !getPrivateKey(user.id)) {
      // Don't auto-show, but provide option
    }
  }, [user]);

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
        <div className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">جاري التحميل...</div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <ChatWindow
        conversation={selectedConversation}
        onClose={() => {
          setSelectedConversation(null);
          loadConversations();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pooh:text-pooh-brown-dark flex items-center space-x-2 space-x-reverse">
            <MessageCircle className="w-6 h-6 text-teal-600 dark:text-teal-400 pooh:text-pooh-yellow-dark" />
            <span>الرسائل</span>
          </h2>
          <div className="flex items-center space-x-2 space-x-reverse">
            {!getPrivateKey(user!.id) && (
              <button
                onClick={() => setShowKeysModal(true)}
                className="px-3 py-2 bg-yellow-500 dark:bg-yellow-600 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 pooh:hover:bg-pooh-yellow transition-colors text-sm"
                title="إعداد التشفير"
              >
                🔒 إعداد التشفير
              </button>
            )}
            <button
              onClick={() => setShowNewMessage(true)}
              className="flex items-center space-x-2 space-x-reverse bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 pooh:hover:bg-pooh-yellow transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>رسالة جديدة</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pooh:text-pooh-brown w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن محادثة..."
            className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 pooh:border-pooh-burlywood bg-white dark:bg-gray-700 pooh:bg-pooh-cream text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 pooh:focus:ring-pooh-yellow focus:border-transparent"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-lg p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 pooh:text-pooh-burlywood mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">لا توجد محادثات بعد</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 pooh:bg-pooh-yellow-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 dark:text-teal-300 pooh:text-pooh-brown-dark font-bold">
                    {conv.otherUser.full_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark truncate">
                      {conv.otherUser.full_name}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-teal-600 dark:bg-teal-500 pooh:bg-pooh-yellow-dark text-white dark:text-gray-900 pooh:text-pooh-brown-dark text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown truncate mt-1">
                    {conv.last_message_preview || 'لا توجد رسائل'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 pooh:text-pooh-brown mt-1">
                    {formatDate(conv.last_message_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showKeysModal && (
        <GenerateKeysModal
          onClose={() => setShowKeysModal(false)}
          onSuccess={() => setShowKeysModal(false)}
        />
      )}
    </div>
  );
}
