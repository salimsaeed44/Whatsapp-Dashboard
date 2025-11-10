import { useState, useEffect } from 'react';
import { usersService } from '../../services/users.service';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll();
      setUsers(response.data || response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'مدير',
      supervisor: 'مشرف',
      employee: 'موظف',
      user: 'مستخدم',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-500',
      supervisor: 'bg-blue-500',
      employee: 'bg-green-500',
      user: 'bg-gray-500',
    };
    return colors[role] || 'bg-gray-500';
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
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">إدارة المستخدمين</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-whatsapp-green-dark transition-colors"
        >
          + إضافة مستخدم
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border hover:bg-whatsapp-dark-hover transition-colors cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-whatsapp-text-primary truncate">
                    {user.full_name || user.email}
                  </h3>
                  <p className="text-xs text-whatsapp-text-secondary truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs text-white ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className={`text-xs ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {user.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;

