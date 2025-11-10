import { useState, useEffect, useRef } from 'react';
import { messagesService } from '../../services/messages.service';
import { useAuth } from '../../context/AuthContext';
import TransferModal from './TransferModal';
import MessageStatus from './MessageStatus';

const ChatWindow = ({ conversation, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    // Scroll to bottom when messages change, but wait a bit for DOM update
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const response = await messagesService.getByConversation(conversation.id, {
        limit: 100,
        offset: 0,
      });
      let messagesList = response.data || response.messages || [];
      
      // Sort messages by created_at ascending (oldest first, newest last)
      messagesList.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.timestamp || 0);
        return dateA - dateB; // Ascending order (oldest to newest)
      });
      
      setMessages(messagesList);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    try {
      setSending(true);
      const response = await messagesService.send({
        conversation_id: conversation.id,
        phone_number: conversation.phone_number,
        content: newMessage.trim(),
        type: 'text',
      });

      // Add message to local state (append to end)
      const newMsg = response.data || response.message;
      setMessages(prev => {
        // Ensure the new message is added at the end (newest)
        const updated = [...prev, newMsg];
        // Sort to ensure correct order (oldest to newest)
        return updated.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || 0);
          const dateB = new Date(b.created_at || b.timestamp || 0);
          return dateA - dateB;
        });
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-whatsapp-dark-bg whatsapp-bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-whatsapp-text-secondary text-lg">
            اختر محادثة لبدء المحادثة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-dark-bg">
      {/* Chat Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-4 flex items-center justify-between border-b border-whatsapp-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
            {conversation.contact_name?.[0]?.toUpperCase() || conversation.phone_number?.slice(-2)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-whatsapp-text-primary">
              {conversation.contact_name || conversation.phone_number}
            </h3>
            {conversation.assigned_to && (
              <p className="text-xs text-whatsapp-text-secondary">
                مسؤول: {conversation.assigned_to_name || conversation.assigned_to}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg"
              title="تحويل المحادثة"
            >
              <span className="text-xl">🔄</span>
            </button>
          )}
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">📞</span>
          </button>
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">🔍</span>
          </button>
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">⋮</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto whatsapp-bg-pattern px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-whatsapp-text-secondary mb-2">
                لا توجد رسائل بعد
              </p>
              <p className="text-whatsapp-text-tertiary text-sm">
                ابدأ المحادثة بإرسال رسالة
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* System Message */}
            <div className="text-center mb-4">
              <div className="inline-block bg-whatsapp-dark-panel px-4 py-2 rounded-lg">
                <p className="text-xs text-whatsapp-text-secondary">
                  الرسائل والمكالمات محمية بتشفير من طرف إلى طرف
                </p>
              </div>
            </div>

            {/* Messages - Oldest to Newest (displayed from top to bottom) */}
            {messages.map((message) => {
              const isSent = message.direction === 'outgoing' || message.direction === 'outbound' || message.user_id === user?.id;
              const isSystem = message.type === 'system';

              if (isSystem) {
                return (
                  <div key={message.id} className="text-center my-2">
                    <p className="text-xs text-whatsapp-text-tertiary">
                      {message.content}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[65%] rounded-lg px-3 py-2 ${
                      isSent
                        ? 'bg-whatsapp-message-sent text-whatsapp-text-primary'
                        : 'bg-whatsapp-message-received text-whatsapp-text-primary'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isSent ? 'text-whatsapp-text-secondary' : 'text-whatsapp-text-tertiary'}`}>
                      <span className="text-xs">{formatTime(message.created_at)}</span>
                      {isSent && (
                        <MessageStatus 
                          status={message.status || 'sent'} 
                          direction={message.direction || 'outgoing'} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Scroll anchor - always at bottom for new messages */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-whatsapp-dark-hover px-4 py-3 border-t border-whatsapp-border">
        <div className="flex items-end gap-2">
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">😊</span>
          </button>
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">📎</span>
          </button>
          <div className="flex-1 bg-whatsapp-input-bg rounded-lg px-4 py-2">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالة..."
              rows={1}
              className="w-full bg-transparent text-whatsapp-text-primary placeholder-whatsapp-text-tertiary resize-none focus:outline-none text-sm"
              style={{ maxHeight: '100px' }}
            />
          </div>
          {newMessage.trim() ? (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="p-2 text-whatsapp-green hover:bg-whatsapp-dark-panel rounded-lg disabled:opacity-50"
            >
              <span className="text-xl">➤</span>
            </button>
          ) : (
            <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
              <span className="text-xl">🎤</span>
            </button>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        conversation={conversation}
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={(conversationId, userId) => {
          // Reload conversation or update state
          if (conversation) {
            // Optionally reload conversation data
          }
        }}
      />
    </div>
  );
};

export default ChatWindow;

