import { useEffect, useState } from 'react';
import { messagesService } from '../services/messages.service';
import Layout from '../components/Layout';
import MessageStatus from '../components/WhatsApp/MessageStatus';

const MAX_MESSAGES = 200;

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadMessages();
    // Poll for updates every 2 minutes (less frequent to reduce server load)
    const interval = setInterval(() => {
      loadMessages();
    }, 120000); // 2 minutes instead of 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const response = await messagesService.getAll({ limit: 50, offset: 0 });
      setMessages(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">الرسائل</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li key={message.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {message.phone_number}
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.direction === 'incoming' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.direction === 'incoming' ? 'وارد' : 'صادر'}
                        </span>
                        {message.direction === 'outgoing' && (
                          <MessageStatus 
                            status={message.status || 'sent'} 
                            direction={message.direction} 
                          />
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {message.content}
                      </div>
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString('ar-SA')}
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

export default Messages;

