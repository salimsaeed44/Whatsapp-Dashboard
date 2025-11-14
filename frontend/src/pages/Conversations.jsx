import { useCallback, useEffect, useState } from 'react';
import { conversationsService } from '../services/conversations.service';
import Layout from '../components/Layout';
import { socketService } from '../services/socket.service';

const sortByActivity = (items = []) => {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.last_message_at || a.updated_at || a.created_at || 0);
    const bDate = new Date(b.last_message_at || b.updated_at || b.created_at || 0);
    return bDate - aDate;
  });
};

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await conversationsService.getAll({ limit: 50, offset: 0 });
      setConversations(sortByActivity(response.data));
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const mergeConversation = useCallback((incoming) => {
    if (!incoming?.id) return;
    setConversations((prev) => {
      const existingIndex = prev.findIndex((conversation) => conversation.id === incoming.id);
      let nextConversations;

      if (existingIndex === -1) {
        nextConversations = [incoming, ...prev];
      } else {
        nextConversations = [...prev];
        nextConversations[existingIndex] = {
          ...nextConversations[existingIndex],
          ...incoming
        };
      }

      return sortByActivity(nextConversations);
    });
  }, []);

  useEffect(() => {
    const unsubscribeConversations = socketService.on('conversations:update', ({ conversation }) => {
      if (conversation) {
        mergeConversation(conversation);
      }
    });

    const unsubscribeMessages = socketService.on('message:new', ({ conversation }) => {
      if (conversation) {
        mergeConversation(conversation);
      }
    });

    return () => {
      unsubscribeConversations();
      unsubscribeMessages();
    };
  }, [mergeConversation]);

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">المحادثات</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {conversation.phone_number.slice(-2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {conversation.phone_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {conversation.status} • {conversation.unread_count} غير مقروء
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(conversation.last_message_at || conversation.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Conversations;

