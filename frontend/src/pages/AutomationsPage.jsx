import { useState, useEffect } from 'react';
import { automationsService } from '../services/automations.service';
import Layout from '../components/Layout';

const AutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const response = await automationsService.getAll();
      setAutomations(response.data || []);
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الأتمتة؟')) return;

    try {
      await automationsService.delete(id);
      await loadAutomations();
      alert('تم حذف الأتمتة بنجاح');
    } catch (error) {
      console.error('Error deleting automation:', error);
      alert('فشل حذف الأتمتة: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTriggerLabel = (type) => {
    const labels = {
      message_received: 'عند استقبال رسالة',
      keyword: 'عند كلمة مفتاحية',
      time_based: 'حسب الوقت',
      conversation_assigned: 'عند تعيين محادثة'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center min-h-screen">
          <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 bg-whatsapp-dark-bg flex flex-col min-h-screen">
        {/* Header */}
        <div className="h-16 bg-whatsapp-dark-hover px-6 flex items-center justify-between border-b border-whatsapp-border">
          <div>
            <h1 className="text-xl font-bold text-whatsapp-text-primary">الأتمتة</h1>
            <p className="text-sm text-whatsapp-text-secondary mt-1">
              الأتمتة تقوم بتنفيذ إجراءات محددة عند استقبال رسائل جديدة. على سبيل المثال: توجيه المحادثات تلقائياً لأعضاء الفريق حسب محتوى الرسالة
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors flex items-center gap-2"
          >
            <span>+</span>
            إضافة أتمتة
          </button>
        </div>

        {/* Automations List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-whatsapp-text-primary">
                    {automation.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    automation.is_active 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-gray-500 bg-opacity-20 text-gray-400'
                  }`}>
                    {automation.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                {automation.description && (
                  <p className="text-sm text-whatsapp-text-secondary mb-3">
                    {automation.description}
                  </p>
                )}
                <div className="mb-3">
                  <span className="text-xs text-whatsapp-text-tertiary">
                    المشغل: {getTriggerLabel(automation.trigger_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-whatsapp-text-tertiary">
                    {automation.actions?.length || 0} إجراء
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary"
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(automation.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {automations.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-whatsapp-text-secondary">لا توجد أتمتات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AutomationsPage;

