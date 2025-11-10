import { useState, useEffect } from 'react';
import { templatesService } from '../services/templates.service';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

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
      await templatesService.syncFromMeta();
      await loadTemplates();
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

  const getCategoryColor = (category) => {
    const colors = {
      MARKETING: 'bg-blue-500 bg-opacity-20 text-blue-400',
      UTILITY: 'bg-purple-500 bg-opacity-20 text-purple-400',
      AUTHENTICATION: 'bg-orange-500 bg-opacity-20 text-orange-400'
    };
    return colors[category] || 'bg-gray-500 bg-opacity-20 text-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex-1 bg-whatsapp-dark-bg flex flex-col">
      {/* Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-6 flex items-center justify-between border-b border-whatsapp-border">
        <div>
          <h1 className="text-xl font-bold text-whatsapp-text-primary">القوالب</h1>
          <p className="text-sm text-whatsapp-text-secondary mt-1">
            إنشاء قوالب Meta متعددة الوسائط لإرسالها في حملات البث/الرسائل الجماعية
          </p>
        </div>
        <div className="flex gap-2">
          <div className="text-sm text-whatsapp-text-secondary self-end mb-1">
            {templates.length} قوالب
          </div>
          <button
            onClick={syncFromMeta}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            {syncing ? 'جاري المزامنة...' : 'تحديث القوالب'}
          </button>
          <button
            onClick={() => navigate('/templates/new')}
            className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors flex items-center gap-2"
          >
            <span>+</span>
            قالب جديد
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-whatsapp-dark-panel rounded-lg border border-whatsapp-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-whatsapp-dark-hover border-b border-whatsapp-border">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  <div className="flex items-center gap-2">
                    اسم القالب
                    <span className="text-whatsapp-text-tertiary cursor-pointer">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  <div className="flex items-center gap-2">
                    الفئة
                    <span className="text-whatsapp-text-tertiary cursor-pointer">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  <div className="flex items-center gap-2">
                    الحالة
                    <span className="text-whatsapp-text-tertiary cursor-pointer">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  اللغة
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  <div className="flex items-center gap-2">
                    آخر تحديث
                    <span className="text-whatsapp-text-tertiary cursor-pointer">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-whatsapp-text-secondary">
                    لا توجد قوالب
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-b border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-whatsapp-text-primary">
                        {template.name || 'بدون اسم'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category)}`}>
                        {template.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(template.status)}`}>
                        {getStatusLabel(template.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded bg-blue-500 bg-opacity-20 text-blue-400">
                        {template.language || 'ar'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-whatsapp-text-secondary">
                        {formatDate(template.updated_at || template.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/templates/edit/${template.id}`)}
                          className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded transition-colors"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, !!template.whatsapp_template_id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-whatsapp-dark-panel rounded transition-colors"
                          title="حذف"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => navigate(`/broadcasts/new?template=${template.id}`)}
                          className="p-2 text-whatsapp-green hover:text-whatsapp-green-dark hover:bg-whatsapp-dark-panel rounded transition-colors"
                          title="إرسال"
                        >
                          ✈️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {templates.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-whatsapp-text-secondary">
              عرض: 
              <select className="ml-2 bg-whatsapp-input-bg text-whatsapp-text-primary rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default TemplatesPage;

