import { useState, useEffect } from 'react';
import { contactsService } from '../services/contacts.service';
import Layout from '../components/Layout';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [searchQuery]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsService.getAll({
        limit: 100,
        offset: 0,
        search: searchQuery || undefined
      });
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاتصال؟')) return;

    try {
      await contactsService.delete(id);
      await loadContacts();
      alert('تم حذف الاتصال بنجاح');
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('فشل حذف الاتصال: ' + (error.response?.data?.message || error.message));
    }
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
            <h1 className="text-xl font-bold text-whatsapp-text-primary">جهات الاتصال</h1>
            <p className="text-sm text-whatsapp-text-secondary mt-1">
              رفع جهات الاتصال الموجودة لديك، تصميم قالب الرسالة وبدء البث فوراً
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-whatsapp-text-secondary self-end mb-1">
              {contacts.length} اتصال
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors flex items-center gap-2"
            >
              <span>📤</span>
              رفع جهات الاتصال
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              إضافة اتصال
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 bg-whatsapp-dark-panel border-b border-whatsapp-border">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن اتصال..."
            className="w-full max-w-md bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
          />
        </div>

        {/* Contacts Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-whatsapp-dark-panel rounded-lg border border-whatsapp-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-whatsapp-dark-hover border-b border-whatsapp-border">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    الاسم
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    رقم الهاتف
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    البريد الإلكتروني
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    تاريخ الإضافة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-whatsapp-text-primary">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-whatsapp-text-secondary">
                      لا توجد جهات اتصال
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-whatsapp-text-primary">
                          {contact.name || 'بدون اسم'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-whatsapp-text-primary">
                          {contact.phone_number}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-whatsapp-text-secondary">
                          {contact.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          contact.is_active 
                            ? 'bg-green-500 bg-opacity-20 text-green-400' 
                            : 'bg-gray-500 bg-opacity-20 text-gray-400'
                        }`}>
                          {contact.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-whatsapp-text-secondary">
                          {new Date(contact.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-panel rounded transition-colors"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-whatsapp-dark-panel rounded transition-colors"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage;

