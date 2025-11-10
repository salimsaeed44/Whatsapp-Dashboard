import { useState } from 'react';
import WhatsAppLayout from '../components/WhatsAppLayout';

const Chats = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <WhatsAppLayout
      selectedConversation={selectedConversation}
      onSelectConversation={setSelectedConversation}
    />
  );
};

export default Chats;

