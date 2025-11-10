import { useState, useEffect } from 'react';
import api from '../../services/api';

const Broadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/broadcasts');
      setBroadcasts(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500 bg-opacity-20 text-green-400',
      sending: 'bg-blue-500 bg-opacity-20 text-blue-400',
      scheduled: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      failed: 'bg-red-500 bg-opacity-20 text-red-400',
    };
    return colors[status] || 'bg-gray-500 bg-opacity-20 text-gray-400';
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'مكتمل',
      sending: 'قيد الإرسال',
      scheduled: 'مجدول',
      failed: 'فشل',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-whatsapp-dark-bg flex flex-col">
      {/* Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-4 flex items-center justify-between border-b border-whatsapp-border">
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">البثوث</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors"
        >
          + إنشاء بث
        </button>
      </div>

      {/* Broadcasts List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-whatsapp-text-primary mb-1">
                    {broadcast.name || 'بث بدون اسم'}
                  </h3>
                  <p className="text-sm text-whatsapp-text-secondary line-clamp-2">
                    {broadcast.message || broadcast.content || 'لا يوجد محتوى'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(broadcast.status)}`}>
                  {getStatusLabel(broadcast.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-whatsapp-text-tertiary">
                <span>المرسل: {broadcast.sent_count || 0} / {broadcast.total_count || 0}</span>
                <span>{new Date(broadcast.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          ))}
          {broadcasts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-whatsapp-text-secondary">لا توجد بثوث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Broadcasts;

