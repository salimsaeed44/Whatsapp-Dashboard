import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeView, onViewChange, user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'chats', icon: '💬', label: 'المحادثات', badge: null },
    { id: 'calls', icon: '📞', label: 'المكالمات', badge: null },
    { id: 'status', icon: '📊', label: 'الحالة', badge: null },
    { id: 'notifications', icon: '🔔', label: 'الإشعارات', badge: null },
  ];

  // Add settings and profile for all users
  const bottomItems = [
    { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
    { id: 'profile', icon: '👤', label: 'الملف الشخصي' },
  ];

  // Add admin/supervisor specific items
  if (user?.role === 'admin' || user?.role === 'supervisor') {
    menuItems.push(
      { id: 'templates', icon: '📝', label: 'القوالب', badge: null },
      { id: 'broadcasts', icon: '📢', label: 'البثوث', badge: null },
      { id: 'statistics', icon: '📈', label: 'الإحصائيات', badge: null }
    );
  }

  // Add admin only items
  if (user?.role === 'admin') {
    menuItems.push(
      { id: 'users', icon: '👥', label: 'إدارة المستخدمين', badge: null }
    );
  }

  return (
    <div className="w-16 bg-whatsapp-dark-panel flex flex-col items-center py-4 border-r border-whatsapp-border">
      {/* Top Menu Items */}
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              transition-colors duration-200
              ${activeView === item.id
                ? 'bg-whatsapp-green text-white'
                : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover hover:text-whatsapp-text-primary'
              }
            `}
            title={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            {item.badge && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Menu Items */}
      <div className="flex flex-col gap-2">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              transition-colors duration-200
              ${activeView === item.id
                ? 'bg-whatsapp-green text-white'
                : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-hover hover:text-whatsapp-text-primary'
              }
            `}
            title={item.label}
          >
            <span className="text-xl">{item.icon}</span>
          </button>
        ))}
      </div>

      {/* User Avatar */}
      <div className="mt-4">
        <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80">
          {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

