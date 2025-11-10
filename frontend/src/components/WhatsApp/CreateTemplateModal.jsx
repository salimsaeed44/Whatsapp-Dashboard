import { useState } from 'react';
import { templatesService } from '../../services/templates.service';

const CreateTemplateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'UTILITY',
    language: 'ar',
    submitToMeta: true,
    header: { text: '', format: 'TEXT' },
    footer: { text: '' },
    buttons: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build components for Meta API
      const components = {
        body: {
          text: formData.content,
          example: {}
        }
      };

      if (formData.header.text) {
        components.header = {
          text: formData.header.text,
          format: formData.header.format,
          example: {}
        };
      }

      if (formData.footer.text) {
        components.footer = {
          text: formData.footer.text
        };
      }

      if (formData.buttons.length > 0) {
        components.buttons = formData.buttons;
      }

      const response = await templatesService.create({
        name: formData.name,
        content: formData.content,
        category: formData.category,
        language: formData.language,
        submitToMeta: formData.submitToMeta,
        components
      });

      onSuccess && onSuccess(response.data);
      onClose();
      // Reset form
      setFormData({
        name: '',
        content: '',
        category: 'UTILITY',
        language: 'ar',
        submitToMeta: true,
        header: { text: '', format: 'TEXT' },
        footer: { text: '' },
        buttons: []
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل إنشاء القالب');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-whatsapp-dark-panel rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <h2 className="text-xl font-semibold text-whatsapp-text-primary mb-4">
          إنشاء قالب جديد
        </h2>

        {error && (
          <div className="mb-4 bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              اسم القالب <span className="text-red-400">*</span>
              <span className="text-xs text-whatsapp-text-tertiary block mt-1">
                (يجب أن يكون بالحروف الصغيرة والأرقام والشرطة السفلية فقط)
              </span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              pattern="[a-z0-9_]+"
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
              placeholder="template_name_example"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              الفئة <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            >
              <option value="UTILITY">UTILITY - رسائل خدمية</option>
              <option value="MARKETING">MARKETING - رسائل تسويقية</option>
              <option value="AUTHENTICATION">AUTHENTICATION - رسائل مصادقة</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              اللغة <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              required
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            >
              <option value="ar">العربية (ar)</option>
              <option value="en">English (en)</option>
            </select>
          </div>

          {/* Header */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              العنوان (اختياري)
            </label>
            <input
              type="text"
              value={formData.header.text}
              onChange={(e) => setFormData({ 
                ...formData, 
                header: { ...formData.header, text: e.target.value } 
              })}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
              placeholder="عنوان الرسالة"
            />
          </div>

          {/* Body Content */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              محتوى الرسالة <span className="text-red-400">*</span>
              <span className="text-xs text-whatsapp-text-tertiary block mt-1">
                استخدم {"{{1}}"} للمتغيرات (مثال: {"{{1}}"} مرحباً بك)
              </span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={5}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green resize-none"
              placeholder="محتوى الرسالة..."
            />
          </div>

          {/* Footer */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              التذييل (اختياري)
            </label>
            <input
              type="text"
              value={formData.footer.text}
              onChange={(e) => setFormData({ 
                ...formData, 
                footer: { ...formData.footer, text: e.target.value } 
              })}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
              placeholder="نص التذييل"
            />
          </div>

          {/* Submit to Meta */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="submitToMeta"
              checked={formData.submitToMeta}
              onChange={(e) => setFormData({ ...formData, submitToMeta: e.target.checked })}
              className="w-4 h-4 text-whatsapp-green bg-whatsapp-input-bg border-whatsapp-border rounded focus:ring-whatsapp-green"
            />
            <label htmlFor="submitToMeta" className="text-sm text-whatsapp-text-secondary">
              إرسال إلى Meta للموافقة
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-hover rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء وإرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;

