import React, { useState, useRef, useEffect } from 'react';
import MessageContainer from './MessageContainer';
import MessageHeader from '../area/header';
import MessageInputBar from '../area/InputBar';
import { useMessages } from '../../../hooks/useMessages';
import { useContacts } from '../../../hooks/useContacts';
import { useAuth } from '../../../hooks/useAuth';
import { MagnifyingGlassIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import NotificationMessage from '../../notifications/NotificationMessage';

function MessageArea({ conversationId }) {
  const [newMessage, setNewMessage] = useState('');
  const { messages, sendMessage, loading, isTyping, unreadCount } = useMessages(conversationId);
  const { contacts } = useContacts();
  const { userEmail } = useAuth();
  const messagesEndRef = useRef(null);
  const activeContact = contacts.find(contact => contact.id === conversationId);
  const status = isTyping ? 'En train d’écrire' : activeContact?.status === 'online' ? 'Online' : `Dernière connexion : ${new Date(activeContact?.lastMessageDate).toLocaleTimeString()}`;

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const tools = [
    { icon: MagnifyingGlassIcon, action: () => console.log('Rechercher') },
    { icon: PhoneIcon, action: () => console.log('Appel audio') },
    { icon: VideoCameraIcon, action: () => console.log('Appel vidéo') },
    { icon: EllipsisVerticalIcon, action: () => console.log('Menu') },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fonction pour formater les dates en "Aujourd’hui", "Hier", etc.
  const formatDate = (timestamp) => {
    const today = new Date();
    const msgDate = new Date(timestamp);
    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd’hui';
    if (diffDays === 1) return 'Hier';
    return msgDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  // Regroupe les messages par date
  const groupedMessages = messages.reduce((acc, message, index) => {
    const dateLabel = formatDate(message.timestamp);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push({ ...message, index });
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white">
      <MessageHeader contact={activeContact} status={status} tools={tools} />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <>
            <div className="flex-1" />
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <React.Fragment key={date}>
                <NotificationMessage text={date} />
                {msgs.map((message, index) => {
                  const isFirstUnread = unreadCount > 0 && message.status !== 'read' && index === 0;
                  return (
                    <React.Fragment key={message.id}>
                      {isFirstUnread && unreadCount > 0 && (
                        <NotificationMessage text={`${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`} />
                      )}
                      <MessageContainer
                        message={message}
                        isMine={message.sender.email === userEmail}
                        isFirst={message.index === 0 || messages[message.index - 1]?.sender.email !== message.sender.email}
                        isLast={message.index === messages.length - 1 || messages[message.index + 1]?.sender.email !== message.sender.email}
                        status={message.status}
                      />
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
            {isTyping && activeContact && (
              <div className="flex items-center space-x-1 mt-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInputBar newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSend} onKeyPress={handleKeyPress} />
    </div>
  );
}

export default MessageArea;