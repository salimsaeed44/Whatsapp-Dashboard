import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-whatsapp-dark-bg">
      {/* Navigation Bar */}
      <nav className="bg-whatsapp-dark-panel border-b border-whatsapp-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/chats" className="text-xl font-bold text-whatsapp-text-primary">
                  WhatsApp Dashboard
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/chats"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  المحادثات
                </Link>
                <Link
                  to="/templates"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  القوالب
                </Link>
                <Link
                  to="/contacts"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  جهات الاتصال
                </Link>
                <Link
                  to="/broadcasts"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  البثوث
                </Link>
                <Link
                  to="/automations"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  الأتمتة
                </Link>
                <Link
                  to="/delivery-stats"
                  className="border-transparent text-whatsapp-text-secondary hover:text-whatsapp-text-primary hover:border-whatsapp-green inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  إحصائيات التسليم
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-whatsapp-text-secondary text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;

