import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesService } from '../services/templates.service';
import Layout from '../components/Layout';

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING',
    language: 'ar',
    headerType: 'NONE',
    headerText: '',
    headerImage: '',
    headerVideo: '',
    headerDocument: '',
    body: '',
    footer: 'Powered by WhatsApp Dashboard',
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
          text: formData.body
        }
      };

      // Add example for body if there are variables
      const bodyVariables = formData.body.match(/\{\{(\d+)\}\}/g) || [];
      if (bodyVariables.length > 0) {
        // Create example values for variables
        const exampleValues = bodyVariables.map((_, index) => `Sample${index + 1}`);
        components.body.example = {
          body_text: [exampleValues]
        };
      }

      // Header
      if (formData.headerType !== 'NONE') {
        if (formData.headerType === 'TEXT' && formData.headerText) {
          components.header = {
            text: formData.headerText,
            format: 'TEXT',
            example: {
              header_text: [formData.headerText] // Meta requires this for TEXT headers
            }
          };
        } else if (formData.headerType === 'IMAGE' && formData.headerImage) {
          components.header = {
            format: 'IMAGE',
            example: { 
              header_handle: [formData.headerImage] 
            }
          };
        } else if (formData.headerType === 'VIDEO' && formData.headerVideo) {
          components.header = {
            format: 'VIDEO',
            example: { 
              header_handle: [formData.headerVideo] 
            }
          };
        } else if (formData.headerType === 'DOCUMENT' && formData.headerDocument) {
          components.header = {
            format: 'DOCUMENT',
            example: { 
              header_handle: [formData.headerDocument] 
            }
          };
        }
      }

      // Footer
      if (formData.footer) {
        components.footer = {
          text: formData.footer
        };
      }

      // Buttons
      if (formData.buttons.length > 0) {
        components.buttons = {
          buttons: formData.buttons
        };
      }

      const response = await templatesService.create({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        content: formData.body,
        category: formData.category,
        language: formData.language,
        submitToMeta: true,
        components
      });

      navigate('/templates');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل إنشاء القالب');
    } finally {
      setLoading(false);
    }
  };

  const addVariable = () => {
    const variableNumber = formData.body.match(/\{\{(\d+)\}\}/g)?.length || 0;
    const newVariable = `{{${variableNumber + 1}}}`;
    setFormData({
      ...formData,
      body: formData.body + newVariable
    });
  };

  const previewText = formData.body || 'Your message will appear here';

  return (
    <Layout>
      <div className="flex-1 bg-whatsapp-dark-bg flex">
      {/* Main Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-whatsapp-text-primary mb-6">قالب جديد</h1>

        {error && (
          <div className="mb-4 bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">معلومات أساسية</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
                  اسم القالب <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  pattern="[a-z0-9_]+"
                  className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                  placeholder="Template Name"
                />
              </div>
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
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>
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
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
              العنوان (اختياري)
            </h2>
            <div className="flex gap-4 mb-4">
              {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="headerType"
                    value={type}
                    checked={formData.headerType === type}
                    onChange={(e) => setFormData({ ...formData, headerType: e.target.value })}
                    className="w-4 h-4 text-whatsapp-green bg-whatsapp-input-bg border-whatsapp-border"
                  />
                  <span className="text-sm text-whatsapp-text-secondary">{type}</span>
                </label>
              ))}
            </div>
            {formData.headerType === 'TEXT' && (
              <input
                type="text"
                value={formData.headerText}
                onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                placeholder="Header text"
              />
            )}
            {formData.headerType === 'IMAGE' && (
              <input
                type="text"
                value={formData.headerImage}
                onChange={(e) => setFormData({ ...formData, headerImage: e.target.value })}
                className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                placeholder="Image URL or handle"
              />
            )}
            {formData.headerType === 'VIDEO' && (
              <input
                type="text"
                value={formData.headerVideo}
                onChange={(e) => setFormData({ ...formData, headerVideo: e.target.value })}
                className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                placeholder="Video URL or handle"
              />
            )}
            {formData.headerType === 'DOCUMENT' && (
              <input
                type="text"
                value={formData.headerDocument}
                onChange={(e) => setFormData({ ...formData, headerDocument: e.target.value })}
                className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                placeholder="Document URL or handle"
              />
            )}
          </div>

          {/* Body */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-whatsapp-text-secondary">
                المحتوى (استخدم المتغيرات بالتنسيق التالي: {"{{1}}"}) <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addVariable}
                className="px-3 py-1 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark text-sm flex items-center gap-1"
              >
                + إضافة متغير
              </button>
            </div>
            <div className="mb-2 flex gap-2 p-2 bg-whatsapp-dark-hover rounded">
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">B</button>
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">U</button>
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">I</button>
              <div className="flex-1"></div>
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">←</button>
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">→</button>
              <button type="button" className="px-2 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary">S</button>
            </div>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
              rows={8}
              maxLength={1024}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green resize-none"
              placeholder="Enter template body..."
            />
            <div className="text-xs text-whatsapp-text-tertiary mt-1">
              {formData.body.length}/1024
            </div>
          </div>

          {/* Footer */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              التذييل (اختياري)
            </label>
            <input
              type="text"
              value={formData.footer}
              onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
              maxLength={60}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
              placeholder="Footer text"
            />
            <div className="text-xs text-whatsapp-text-tertiary mt-1">
              {formData.footer.length}/60
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
              الأزرار (اختياري)
            </label>
            <p className="text-xs text-whatsapp-text-tertiary mb-4">
              أنشئ أزراراً تسمح للعملاء بالرد على رسالتك أو اتخاذ إجراء. يمكنك إضافة حتى 10 أزرار.
            </p>
            {/* Button management will be added here */}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => navigate('/templates')}
              className="px-6 py-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-hover rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Pane */}
      <div className="w-96 bg-whatsapp-dark-panel border-l border-whatsapp-border p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">WhatsApp</h2>
        <div className="bg-whatsapp-dark-hover rounded-lg p-4 mb-4">
          <p className="text-xs text-whatsapp-text-tertiary">
            This business uses a secure service from Meta to manage this chat. Tap to learn more
          </p>
        </div>
        <div className="bg-whatsapp-dark-hover rounded-lg p-4">
          <div className="space-y-2">
            {formData.headerType !== 'NONE' && formData.headerText && (
              <div className="text-sm font-semibold text-whatsapp-text-primary">
                {formData.headerText}
              </div>
            )}
            <div className="text-sm text-whatsapp-text-primary whitespace-pre-wrap">
              {previewText}
            </div>
            {formData.footer && (
              <div className="text-xs text-whatsapp-text-tertiary mt-2">
                {formData.footer}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default CreateTemplatePage;

