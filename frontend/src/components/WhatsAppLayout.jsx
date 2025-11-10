import { useState } from 'react';
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
  const [activeView, setActiveView] = useState('chats'); // chats, calls, status, settings, users, statistics

  const renderMainContent = () => {
    if (activeView === 'users') {
      return <UsersManagement />;
    }
    
    if (activeView === 'statistics') {
      return <Statistics />;
    }

    if (activeView === 'templates') {
      return <Templates />;
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
        onViewChange={setActiveView}
        user={user}
      />

      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
};

export default WhatsAppLayout;

