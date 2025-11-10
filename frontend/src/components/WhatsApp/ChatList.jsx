import { useState, useEffect } from 'react';
import { conversationsService } from '../../services/conversations.service';
import { useAuth } from '../../context/AuthContext';

const ChatList = ({ activeView, selectedConversation, onSelectConversation, user }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, groups
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (activeView === 'chats') {
      loadConversations();
    }
  }, [activeView, user]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, filter]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      let response;
      
      // Load conversations based on user role
      if (user?.role === 'admin' || user?.role === 'supervisor') {
        // Admin and Supervisor see all conversations
        response = await conversationsService.getAll({ limit: 100, offset: 0 });
      } else if (user?.role === 'employee') {
        // Employee sees only assigned conversations
        response = await conversationsService.getMyConversations({ limit: 100, offset: 0 });
      } else {
        response = await conversationsService.getAll({ limit: 100, offset: 0 });
      }

      const convs = response.data || response.conversations || [];
      setConversations(convs);
      
      // Count pending conversations
      const pending = convs.filter(c => 
        c.status === 'pending' || 
        c.unread_count > 0 ||
        (c.last_message_at && new Date(c.last_message_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      ).length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.phone_number?.includes(searchQuery) ||
        conv.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'unread') {
      filtered = filtered.filter(conv => conv.unread_count > 0);
    } else if (filter === 'groups') {
      filtered = filtered.filter(conv => conv.is_group === true);
    }

    // Sort by last message time
    filtered.sort((a, b) => {
      const timeA = new Date(a.last_message_at || a.created_at);
      const timeB = new Date(b.last_message_at || b.created_at);
      return timeB - timeA;
    });

    setFilteredConversations(filtered);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'أمس';
    } else if (days < 7) {
      return date.toLocaleDateString('ar-SA', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
    }
  };

  if (activeView !== 'chats') {
    return (
      <div className="w-96 bg-whatsapp-dark-panel border-r border-whatsapp-border flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">اختر قائمة من الشريط الجانبي</p>
      </div>
    );
  }

  return (
    <div className="w-96 bg-whatsapp-dark-panel border-r border-whatsapp-border flex flex-col">
      {/* Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-4 flex items-center justify-between border-b border-whatsapp-border">
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">المحادثات</h2>
        <div className="flex gap-2">
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">✏️</span>
          </button>
          <button className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded-lg">
            <span className="text-xl">⋮</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-whatsapp-dark-panel border-b border-whatsapp-border">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary placeholder-whatsapp-text-tertiary rounded-lg px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
          />
          <span className="absolute left-3 top-2.5 text-whatsapp-text-tertiary">🔍</span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 bg-whatsapp-dark-panel border-b border-whatsapp-border flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'all'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'unread'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          غير مقروء {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setFilter('groups')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'groups'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          المجموعات
        </button>
      </div>

      {/* Pending Conversations Section (for employees) */}
      {user?.role === 'employee' && pendingCount > 0 && (
        <div className="px-4 py-3 bg-red-900 bg-opacity-30 border-b border-red-500 border-opacity-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-red-300">
              ⚠️ المحادثات التي يجب الرد عليها ({pendingCount})
            </h3>
            <button
              onClick={() => {
                // Filter to show only pending
                setFilter('unread');
              }}
              className="text-xs text-red-300 hover:text-red-200 underline"
            >
              عرض الكل
            </button>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-whatsapp-text-secondary">لا توجد محادثات</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isPending = conversation.status === 'pending' || conversation.unread_count > 0;
            const isOverdue = conversation.last_message_at && 
              new Date(conversation.last_message_at) < new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`
                px-4 py-3 cursor-pointer border-b border-whatsapp-border
                hover:bg-whatsapp-dark-hover transition-colors
                ${selectedConversation?.id === conversation.id ? 'bg-whatsapp-dark-hover' : ''}
                ${isOverdue && isPending ? 'bg-red-900 bg-opacity-20' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
                    {conversation.contact_name?.[0]?.toUpperCase() || conversation.phone_number?.slice(-2)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-whatsapp-text-primary truncate">
                      {conversation.contact_name || conversation.phone_number}
                    </h3>
                    <span className="text-xs text-whatsapp-text-tertiary ml-2">
                      {formatTime(conversation.last_message_at || conversation.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-whatsapp-text-secondary truncate">
                      {conversation.last_message || 'لا توجد رسائل'}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="bg-whatsapp-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isOverdue && isPending && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-red-400">⚠️ متأخرة</span>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;

