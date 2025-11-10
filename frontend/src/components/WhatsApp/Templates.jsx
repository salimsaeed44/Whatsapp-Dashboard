import { useState, useEffect } from 'react';
import { templatesService } from '../../services/templates.service';
import CreateTemplateModal from './CreateTemplateModal';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, approved, pending, rejected

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesService.getAll();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFromMeta = async () => {
    try {
      setSyncing(true);
      const response = await templatesService.syncFromMeta();
      await loadTemplates(); // Reload templates after sync
      alert('تمت مزامنة القوالب من Meta بنجاح');
    } catch (error) {
      console.error('Error syncing templates:', error);
      alert('فشلت مزامنة القوالب: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id, fromMeta = false) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;

    try {
      if (fromMeta) {
        await templatesService.deleteFromMeta(id);
      } else {
        await templatesService.delete(id);
      }
      await loadTemplates();
      alert('تم حذف القالب بنجاح');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('فشل حذف القالب: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      approved: 'معتمد',
      pending_approval: 'قيد المراجعة',
      rejected: 'مرفوض',
      active: 'نشط',
      inactive: 'غير نشط',
      draft: 'مسودة'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-500 bg-opacity-20 text-green-400',
      pending_approval: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
      rejected: 'bg-red-500 bg-opacity-20 text-red-400',
      active: 'bg-blue-500 bg-opacity-20 text-blue-400',
      inactive: 'bg-gray-500 bg-opacity-20 text-gray-400',
      draft: 'bg-gray-500 bg-opacity-20 text-gray-400'
    };
    return colors[status] || 'bg-gray-500 bg-opacity-20 text-gray-400';
  };

  const filteredTemplates = templates.filter(template => {
    if (filter === 'all') return true;
    if (filter === 'approved') return template.status === 'approved' || template.status === 'active';
    if (filter === 'pending') return template.status === 'pending_approval';
    if (filter === 'rejected') return template.status === 'rejected';
    return true;
  });

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
        <div className="flex gap-2">
          <button
            onClick={syncFromMeta}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? 'جاري المزامنة...' : '🔄 مزامنة من Meta'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors"
          >
            + إنشاء قالب
          </button>
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
          الكل ({templates.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'approved'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          معتمد
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'pending'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          قيد المراجعة
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filter === 'rejected'
              ? 'bg-whatsapp-green text-white'
              : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover'
          }`}
        >
          مرفوض
        </button>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-whatsapp-text-primary">
                  {template.name || 'بدون اسم'}
                </h3>
                {template.whatsapp_template_id && (
                  <span className="text-xs text-whatsapp-text-tertiary" title="Meta Template ID">
                    ✓ Meta
                  </span>
                )}
              </div>
              <p className="text-sm text-whatsapp-text-secondary mb-3 line-clamp-3">
                {template.content || 'لا يوجد محتوى'}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(template.status)}`}>
                  {getStatusLabel(template.status)}
                </span>
                <span className="text-xs text-whatsapp-text-tertiary">
                  {template.category || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button className="text-xs text-whatsapp-green hover:text-whatsapp-green-dark flex-1">
                  استخدام
                </button>
                {template.whatsapp_template_id && (
                  <button
                    onClick={() => handleDelete(template.id, true)}
                    className="text-xs text-red-400 hover:text-red-300"
                    title="حذف من Meta"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-whatsapp-text-secondary">
                {loading ? 'جاري التحميل...' : 'لا توجد قوالب'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadTemplates();
        }}
      />
    </div>
  );
};

export default Templates;

