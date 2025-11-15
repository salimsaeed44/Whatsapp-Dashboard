import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './WhatsApp/Sidebar';
import ChatList from './WhatsApp/ChatList';
import ChatWindow from './WhatsApp/ChatWindow';
import UsersManagement from './WhatsApp/UsersManagement';
import Statistics from './WhatsApp/Statistics';
import Templates from './WhatsApp/Templates';
import Broadcasts from './WhatsApp/Broadcasts';
import Notifications from './WhatsApp/Notifications';

const WhatsAppLayout = ({ children, selectedConversation, onSelectConversation }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('chats'); // chats, calls, status, settings, users, statistics

  // Map view IDs to routes
  const viewToRoute = {
    'chats': '/chats',
    'templates': '/templates',
    'broadcasts': '/broadcasts',
    'statistics': '/statistics',
    'users': '/users',
    'notifications': '/notifications',
    'contacts': '/contacts',
    'automations': '/automations'
  };

  // Update URL when view changes
  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    const route = viewToRoute[viewId];
    if (route && location.pathname !== route) {
      navigate(route, { replace: true });
    }
  };

  // Sync activeView with current route
  useEffect(() => {
    const routeToView = Object.entries(viewToRoute).find(([_, route]) => route === location.pathname);
    if (routeToView) {
      setActiveView(routeToView[0]);
    }
  }, [location.pathname]);

  const renderMainContent = () => {
    if (activeView === 'users') {
      return <UsersManagement />;
    }
    
    if (activeView === 'statistics') {
      return <Statistics />;
    }

    if (activeView === 'templates') {
      // Templates view is handled by route, so we don't render here
      // The route will handle it
      return null;
    }

    if (activeView === 'broadcasts') {
      return <Broadcasts />;
    }

    if (activeView === 'notifications') {
      return <Notifications />;
    }

    if (activeView === 'chats') {
      return (
        <>
          {/* Chat List - Middle Column */}
          <ChatList 
            activeView={activeView}
            selectedConversation={selectedConversation}
            onSelectConversation={onSelectConversation}
            user={user}
          />

          {/* Chat Window - Right Column */}
          <ChatWindow 
            conversation={selectedConversation}
            user={user}
          />
        </>
      );
    }

    // For other views (calls, status, settings, etc.)
    return (
      <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">قريباً: {activeView}</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-whatsapp-dark-bg overflow-hidden">
      {/* Sidebar - Left Column */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange}
        user={user}
      />

      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
};

export default WhatsAppLayout;

