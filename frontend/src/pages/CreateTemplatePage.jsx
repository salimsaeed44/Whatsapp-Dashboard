import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesService } from '../services/templates.service';
import Layout from '../components/Layout';

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates'); // campaigns or templates
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING',
    language: 'ar',
    headerType: 'NONE',
    headerText: '',
    body: '',
    footer: '',
    buttons: []
  });
  const [buttonTexts, setButtonTexts] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [policyChecks, setPolicyChecks] = useState({
    nameValid: false,
    bodyLengthValid: false,
    linksValid: true,
    variablesValid: false,
    contentValid: false
  });

  // Validate template name
  useEffect(() => {
    const nameRegex = /^[a-z0-9_]+$/;
    setPolicyChecks(prev => ({
      ...prev,
      nameValid: formData.name.length > 0 && nameRegex.test(formData.name)
    }));
  }, [formData.name]);

  // Validate body length
  useEffect(() => {
    setPolicyChecks(prev => ({
      ...prev,
      bodyLengthValid: formData.body.length > 0 && formData.body.length <= 1024
    }));
  }, [formData.body]);

  // Validate variables
  useEffect(() => {
    const variableRegex = /\{\{(\d+)\}\}/g;
    const matches = formData.body.match(variableRegex) || [];
    const numbers = matches.map(m => parseInt(m.match(/\d+/)[0]));
    const isValid = numbers.length === 0 || (numbers.length === new Set(numbers).size && 
      numbers.every((n, i) => n === i + 1));
    setPolicyChecks(prev => ({
      ...prev,
      variablesValid: isValid
    }));
  }, [formData.body]);

  // Check for shortened links
  useEffect(() => {
    const shortenedLinkPatterns = /(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link)/i;
    setPolicyChecks(prev => ({
      ...prev,
      linksValid: !shortenedLinkPatterns.test(formData.body + formData.footer)
    }));
  }, [formData.body, formData.footer]);

  const addVariable = () => {
    const variableNumber = (formData.body.match(/\{\{(\d+)\}\}/g) || []).length;
    const newVariable = `{{${variableNumber + 1}}}`;
    setFormData({
      ...formData,
      body: formData.body + newVariable
    });
  };

  const handleBodyFormat = (format) => {
    const textarea = document.querySelector('textarea[name="body"]');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `*${selectedText}*`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'strikethrough':
        formattedText = `~${selectedText}~`;
        break;
      default:
        return;
    }

    const newBody = formData.body.substring(0, start) + formattedText + formData.body.substring(end);
    setFormData({ ...formData, body: newBody });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      textarea.focus();
    }, 0);
  };

  const handleSubmit = async (e, asDraft = false) => {
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
        const exampleValues = bodyVariables.map((_, index) => `Sample${index + 1}`);
        components.body.example = {
          body_text: [exampleValues]
        };
      }

      // Header
      if (formData.headerType === 'TEXT' && formData.headerText) {
        components.header = {
          format: 'TEXT',
          text: formData.headerText,
          example: {
            header_text: [formData.headerText]
          }
        };
      }

      // Footer
      if (formData.footer) {
        components.footer = {
          text: formData.footer
        };
      }

      // Buttons (up to 2 buttons)
      const validButtons = buttonTexts.filter(btn => btn.trim()).slice(0, 2);
      if (validButtons.length > 0) {
        components.buttons = {
          buttons: validButtons.map(text => ({
            type: 'QUICK_REPLY',
            text: text.trim()
          }))
        };
      }

      const response = await templatesService.create({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        content: formData.body,
        category: formData.category,
        language: formData.language,
        submitToMeta: !asDraft,
        components
      });

      navigate('/templates');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'فشل إنشاء القالب';
      setError(errorMessage);
      console.error('Template creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preview text with variable placeholders
  const previewBody = formData.body.replace(/\{\{(\d+)\}\}/g, (match, num) => {
    const placeholders = ['[اسم العميل]', '[رقم الطلب]', '[التاريخ]', '[المبلغ]'];
    return placeholders[parseInt(num) - 1] || `[متغير ${num}]`;
  });

  return (
    <Layout>
      <div className="flex h-screen bg-whatsapp-dark-bg">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-whatsapp-dark-hover px-6 py-4 border-b border-whatsapp-border">
            <h1 className="text-2xl font-bold text-whatsapp-text-primary mb-2">
              إنشاء قالب جديد
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'campaigns'
                    ? 'text-whatsapp-green border-b-2 border-whatsapp-green'
                    : 'text-whatsapp-text-secondary hover:text-whatsapp-text-primary'
                }`}
              >
                الحملات
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'text-whatsapp-green border-b-2 border-whatsapp-green'
                    : 'text-whatsapp-text-secondary hover:text-whatsapp-text-primary'
                }`}
              >
                القوالب
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Template Setup */}
              <div className="bg-whatsapp-dark-panel rounded-lg p-6 border border-whatsapp-border">
                <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-2">
                  إعداد القالب
                </h2>
                <p className="text-sm text-whatsapp-text-secondary mb-4">
                  قم بإنشاء قالب رسالة متوافق مع سياسات WhatsApp/Meta.
                </p>

                <div className="space-y-4">
                  {/* Template Name */}
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
                      placeholder="offer_25_discount"
                    />
                    <p className="text-xs text-whatsapp-text-tertiary mt-1">
                      استخدم أحرف إنجليزية صغيرة وأرقام وشرطات سفلية فقط.
                    </p>
                  </div>

                  {/* Category and Language */}
                  <div className="grid grid-cols-2 gap-4">
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
                        <option value="MARKETING">التسويق</option>
                        <option value="UTILITY">الأدوات</option>
                        <option value="AUTHENTICATION">المصادقة</option>
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
                        <option value="ar">العربية (ar)</option>
                        <option value="en">English (en)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-whatsapp-dark-panel rounded-lg p-6 border border-whatsapp-border">
                <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
                  محتوى الرسالة
                </h2>

                {/* Header */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
                    الرأس (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.headerText}
                    onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                    maxLength={60}
                    className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                    placeholder="مثال: عرض خاص!"
                  />
                  <p className="text-xs text-whatsapp-text-tertiary mt-1">
                    نص فقط. 60 حرفًا كحد أقصى
                  </p>
                </div>

                {/* Body */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
                    النص الأساسي <span className="text-red-400">*</span>
                  </label>
                  
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-2 mb-2 p-2 bg-whatsapp-dark-hover rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleBodyFormat('bold')}
                      className="px-3 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded"
                      title="عريض"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBodyFormat('italic')}
                      className="px-3 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded"
                      title="مائل"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBodyFormat('strikethrough')}
                      className="px-3 py-1 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded"
                      title="خط في الوسط"
                    >
                      <s>S</s>
                    </button>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={addVariable}
                      className="px-3 py-1 bg-whatsapp-green text-white rounded hover:bg-whatsapp-green-dark text-sm flex items-center gap-1"
                    >
                      + إضافة متغير
                    </button>
                  </div>

                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    required
                    rows={8}
                    maxLength={1024}
                    className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green resize-none"
                    placeholder="مرحباً {{1}} شكراً لاهتمامك بمنتجاتنا..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-whatsapp-text-tertiary">
                      استخدم {{1}} {{2}}... للمتغيرات.
                    </p>
                    <p className="text-xs text-whatsapp-text-tertiary">
                      {formData.body.length} / 1024
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
                    التذييل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.footer}
                    onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                    maxLength={60}
                    className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                    placeholder="لإلغاء الاشتراك، أرسل 'توقف'"
                  />
                  <p className="text-xs text-whatsapp-text-tertiary mt-1">
                    نص فقط. 60 حرفًا كحد أقصى
                  </p>
                </div>

                {/* Buttons */}
                <div>
                  <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
                    أزرار الدعوة لاتخاذ إجراء (اختياري)
                  </label>
                  <div className="space-y-2">
                    {[0, 1].map((index) => (
                      <input
                        key={index}
                        type="text"
                        value={buttonTexts[index] || ''}
                        onChange={(e) => {
                          const newButtons = [...buttonTexts];
                          newButtons[index] = e.target.value;
                          setButtonTexts(newButtons);
                        }}
                        maxLength={20}
                        className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                        placeholder={`نص الزر ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-whatsapp-text-tertiary mt-1">
                    يمكنك إضافة ما يصل إلى زرين.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="px-6 py-2 bg-whatsapp-dark-hover text-whatsapp-text-secondary rounded-lg hover:bg-whatsapp-dark-panel transition-colors disabled:opacity-50"
                >
                  حفظ كمسودة
                </button>
                <button
                  type="submit"
                  disabled={loading || !policyChecks.nameValid || !policyChecks.bodyLengthValid || !policyChecks.variablesValid}
                  className="px-6 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Preview and Policy Check */}
        <div className="w-96 bg-whatsapp-dark-panel border-l border-whatsapp-border flex flex-col">
          {/* Live Preview */}
          <div className="p-6 border-b border-whatsapp-border">
            <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
              معاينة مباشرة
            </h2>
            <div className="bg-whatsapp-dark-hover rounded-lg p-4">
              <div className="bg-whatsapp-message-sent rounded-lg p-3 mb-2">
                {formData.headerText && (
                  <div className="text-sm font-semibold text-whatsapp-text-primary mb-2">
                    {formData.headerText}
                  </div>
                )}
                <div className="text-sm text-whatsapp-text-primary whitespace-pre-wrap">
                  {previewBody || 'مرحباً [اسم العميل]، شكراً لاهتمامك بمنتجاتنا...'}
                </div>
                {formData.footer && (
                  <div className="text-xs text-whatsapp-text-tertiary mt-2">
                    {formData.footer}
                  </div>
                )}
                <div className="text-xs text-whatsapp-text-tertiary mt-2 text-right">
                  10:45 ص
                </div>
              </div>
              {buttonTexts.filter(btn => btn.trim()).length > 0 && (
                <div className="space-y-2 mt-2">
                  {buttonTexts.filter(btn => btn.trim()).map((btn, index) => (
                    <button
                      key={index}
                      className="w-full bg-whatsapp-dark-panel text-whatsapp-text-primary rounded-lg px-4 py-2 text-sm hover:bg-whatsapp-dark-hover transition-colors"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Policy Check */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
              التحقق من السياسات
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {policyChecks.nameValid ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
                <span className="text-sm text-whatsapp-text-secondary">
                  اسم القالب صحيح
                </span>
              </div>
              <div className="flex items-center gap-2">
                {policyChecks.bodyLengthValid ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
                <span className="text-sm text-whatsapp-text-secondary">
                  النص الأساسي أقل من 1024 حرفًا
                </span>
              </div>
              <div className="flex items-center gap-2">
                {policyChecks.linksValid ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-yellow-400">⚠</span>
                )}
                <span className="text-sm text-whatsapp-text-secondary">
                  تجنب تقصير الروابط
                </span>
              </div>
              <div className="flex items-center gap-2">
                {policyChecks.variablesValid ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-yellow-400">⚠</span>
                )}
                <span className="text-sm text-whatsapp-text-secondary">
                  المتغيرات مهيأة بشكل صحيح
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-sm text-whatsapp-text-secondary">
                  التحقق من المحتوى الترويجي
                </span>
              </div>
            </div>
            <p className="text-xs text-whatsapp-text-tertiary mt-4">
              سيتم مراجعة القالب من قبل Meta. قد يستغرق الأمر ما يصل إلى 24 ساعة.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTemplatePage;
