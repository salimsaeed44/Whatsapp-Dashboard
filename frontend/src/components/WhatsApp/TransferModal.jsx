import { useState, useEffect } from 'react';
import { usersService } from '../../services/users.service';
import { conversationsService } from '../../services/conversations.service';

const TransferModal = ({ conversation, isOpen, onClose, onTransfer }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getEmployees();
      setUsers(response.data || response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUserId || !conversation) return;

    try {
      setTransferring(true);
      await conversationsService.transfer(conversation.id, selectedUserId, notifyCustomer);
      onTransfer && onTransfer(conversation.id, selectedUserId);
      onClose();
    } catch (error) {
      console.error('Error transferring conversation:', error);
      alert('فشل تحويل المحادثة. يرجى المحاولة مرة أخرى.');
    } finally {
      setTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-whatsapp-dark-panel rounded-lg p-6 w-96 max-w-full mx-4">
        <h2 className="text-xl font-semibold text-whatsapp-text-primary mb-4">
          تحويل المحادثة
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-whatsapp-text-secondary mb-2">
            اختر الموظف
          </label>
          {loading ? (
            <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
          ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-whatsapp-input-bg text-whatsapp-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
            >
              <option value="">-- اختر موظف --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.role})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="w-4 h-4 text-whatsapp-green bg-whatsapp-input-bg border-whatsapp-border rounded focus:ring-whatsapp-green"
            />
            <span className="text-sm text-whatsapp-text-secondary">
              إرسال إشعار للعميل
            </span>
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:bg-whatsapp-dark-hover rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedUserId || transferring}
            className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {transferring ? 'جاري التحويل...' : 'تحويل'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;

