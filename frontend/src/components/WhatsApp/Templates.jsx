import { useState, useEffect } from 'react';
import api from '../../services/api';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates');
      setTemplates(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">القوالب</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors"
        >
          + إنشاء قالب
        </button>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
            >
              <h3 className="text-sm font-semibold text-whatsapp-text-primary mb-2">
                {template.name || 'بدون اسم'}
              </h3>
              <p className="text-sm text-whatsapp-text-secondary mb-3 line-clamp-3">
                {template.content || template.body || 'لا يوجد محتوى'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  template.status === 'approved' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                  template.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                  'bg-gray-500 bg-opacity-20 text-gray-400'
                }`}>
                  {template.status === 'approved' ? 'معتمد' :
                   template.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                </span>
                <button className="text-xs text-whatsapp-green hover:text-whatsapp-green-dark">
                  استخدام
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-whatsapp-text-secondary">لا توجد قوالب</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;

