import { useState, useEffect, useRef } from 'react';
import { supabase, Message, User, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, X } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { encryptMessage, decryptMessage, getPrivateKey, deriveSharedSecret } from '../../lib/encryption';

interface ChatWindowProps {
  conversation: Conversation & { otherUser: User };
  onClose: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<(Message & { sender: User })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sharedSecret, setSharedSecret] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    setupEncryption();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupEncryption = async () => {
    try {
      // Get or create encryption keys
      const myPrivateKey = getPrivateKey(user!.id);
      if (!myPrivateKey) {
        console.warn('No private key found, messages will be unencrypted');
        return;
      }

      // Get other user's public key
      const { data: otherUserKey } = await supabase
        .from('user_keys')
        .select('public_key')
        .eq('user_id', conversation.otherUser.id)
        .single();

      if (otherUserKey) {
        const secret = await deriveSharedSecret(myPrivateKey, otherUserKey.public_key);
        setSharedSecret(secret);
      }
    } catch (error) {
      console.error('Error setting up encryption:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender info for each message
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: sender } = await supabase
            .from('users')
            .select('*')
            .eq('id', msg.sender_id)
            .single();

          // Decrypt if encrypted
          let content = msg.content;
          if (msg.encrypted_content && sharedSecret && msg.encryption_key_id) {
            try {
              content = await decryptMessage(
                msg.encrypted_content,
                sharedSecret,
                msg.encryption_key_id
              );
            } catch (e) {
              console.error('Error decrypting message:', e);
            }
          }

          return {
            ...msg,
            sender: sender as User,
            content, // Use decrypted content
          };
        })
      );

      setMessages(messagesWithSenders);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('recipient_id', user!.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages_${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      let encryptedContent: string | null = null;
      let encryptionKeyId: string | null = null;

      // Encrypt message if shared secret is available
      if (sharedSecret) {
        try {
          const encrypted = await encryptMessage(newMessage, sharedSecret);
          encryptedContent = encrypted.encrypted;
          encryptionKeyId = encrypted.nonce;
        } catch (e) {
          console.error('Error encrypting message:', e);
        }
      }

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user!.id,
        recipient_id: conversation.otherUser.id,
        content: sharedSecret ? '' : newMessage, // Store empty if encrypted
        encrypted_content: encryptedContent,
        encryption_key_id: encryptionKeyId,
        message_type: 'text',
      });

      if (error) throw error;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: newMessage.substring(0, 50),
        })
        .eq('id', conversation.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center" aria-hidden="true">
              <span className="text-teal-700 font-bold">
                {conversation.otherUser.full_name[0]}
              </span>
            </div>
            <div>
              <h3 id="chat-title" className="font-semibold text-gray-900">{conversation.otherUser.full_name}</h3>
              <p className="text-xs text-gray-500">متصل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-label="الرسائل"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user!.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user!.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === user!.id ? 'text-teal-100' : 'text-gray-500'
                  }`}
                >
                  {formatDate(message.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200" role="region" aria-label="إدخال الرسالة">
          <div className="flex items-center space-x-2 space-x-reverse">
            <label htmlFor="message-input" className="sr-only">
              اكتب رسالة
            </label>
            <input
              id="message-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="اكتب رسالة..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              dir="rtl"
              aria-label="اكتب رسالة"
              aria-required="true"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

