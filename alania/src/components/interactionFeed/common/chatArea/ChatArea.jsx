import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useContacts } from '../../../../hooks/useContacts';
import { useGroups } from '../../../../hooks/useGroups';
import Header from './components/header/Header';
import ChatBubble from './components/chatBubble/ChatBubble';
import NotificationMessage from './components/notifications/NotificationMessage';
import InputBar from './components/inputBar/InputBar';
import { useMessages } from '../../../../hooks/useMessages';
import ScrollToBottomButton from './components/inputBar/components/ScrollToBottomButton';

function ChatArea({ targetId, receiverType, currentUser, receiverEmail, ...props }) {
  const { messages, sendMessage, deleteMessage, loading, error, unreadCount, markMessagesAsRead } = useMessages(
    targetId,
    receiverType,
    currentUser.email,
    currentUser,
    receiverEmail,
  );
  console.log('ChatArea - Messages pour userEmail:', currentUser.email, 'targetId:', targetId, 'messages:', messages.map(m => ({ id: m.id, text: m.content.text, senderId: m.senderId })));
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const { getContactById } = useContacts(currentUser);
  const { getGroupById } = useGroups(currentUser?.email);
  const [contact, setContact] = useState(null);
  const [group, setGroup] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const sizeMap = useRef({}); // Stocke les hauteurs des messages
  const observerRef = useRef(null); // Pour ResizeObserver

  // Charger les données du contact ou du groupe
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.email || !targetId || !receiverType) {
        setContact(null);
        setGroup(null);
        return;
      }
      try {
        if (receiverType === 'user') {
          const contactData = await getContactById(targetId);
          setContact(contactData);
          setGroup(null);
        } else if (receiverType === 'group') {
          const groupData = await getGroupById(targetId);
          setGroup(groupData);
          setContact(null);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, [targetId, receiverType, currentUser, getContactById, getGroupById]);

  // Défilement automatique vers le bas lors de l'ajout de messages
  useEffect(() => {
    if (listRef.current && !loading && messages.length > 0) {
      const isAtBottom = isScrolledToBottom();
      if (isAtBottom) {
        listRef.current.scrollToItem(messages.length - 1, 'end');
        if (unreadCount > 0) {
          markMessagesAsRead();
        }
      }
    }
  }, [messages, loading, unreadCount, markMessagesAsRead]);

  useEffect(() => {
    console.log('ChatArea - targetId:', targetId, 'receiverType:', receiverType);
  }, [targetId, receiverType]);
  
  // Vérifier la position de défilement pour afficher/masquer le bouton
  const handleScroll = useCallback(() => {
    setShowScrollButton(!isScrolledToBottom());
  }, []);

  const isScrolledToBottom = () => {
    // console.log('isScrolledToBottom', !scrollContainerRef.current, scrollContainerRef.current);
    if (!scrollContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // Seuil de 50px
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
      setShowScrollButton(false);
    }
  };

  const handleSendMessage = async ({ text, files, voice, replyTo }) => {
    if (!targetId || !receiverType) {
      console.error('targetId ou receiverType manquant');
      return;
    }
    console.log('handleSendMessage', { text, files, voice, replyTo });
    await sendMessage({ text, replyTo }, files, voice);
    setNewMessage('');
    setReplyTo(null);
    scrollToBottom();
  };

  const retryFetchMessages = async () => {
    await sendMessage(null, null, true); // Forcer le rechargement
  };

  // Fonction pour définir la hauteur d'un message
  const setRowHeight = useCallback((index, height) => {
    if (sizeMap.current[index] !== height && height > 0) {
      sizeMap.current[index] = height;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  // Fonction pour obtenir la hauteur d'un message
  const getRowHeight = useCallback(
    (index) => {
      return sizeMap.current[index] || (messages[index]?.IdentificatorType === 'notification' ? 50 : 120); // Hauteurs initiales
    },
    [messages]
  );

  // Configurer ResizeObserver pour surveiller les changements de taille
  useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.dataset.index);
        const height = entry.contentRect.height;
        setRowHeight(index, height);
      });
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setRowHeight]);

  // Composant pour chaque élément de la liste
  const Row = ({ index, style }) => {
    const message = messages[index];
    // console.clear();
    // console.log('message', message);
    const isMine = message.senderId === currentUser.email;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const isFirst = !prevMessage || prevMessage.senderId !== message.senderId;
    const isLast = !nextMessage || nextMessage.senderId !== message.senderId;
  
    // Utiliser une référence pour le container à mesurer
    const containerRef = useRef(null);
  
    useEffect(() => {
      const node = containerRef.current;
      if (node && observerRef.current) {
        // On stocke l'index dans l'attribut data pour que l'observer puisse l'utiliser
        node.dataset.index = index;
        observerRef.current.observe(node);
        return () => {
          observerRef.current.unobserve(node);
        };
      }
    }, [index]);
  
    return (
      /* Le div extérieur utilise le style transmis (positionnement, translation, etc.) */
      <div style={style}>
        {/*
            Le div intérieur contient le padding et le contenu réel. 
            Il sera mesuré pour déterminer la hauteur nécessaire.
        */}
        <div
          ref={containerRef}
          style={{
            padding: '8px 16px',
            boxSizing: 'border-box',
            width: '100%',
          }}
          role="listitem"
        >
          {message.IdentificatorType === 'message' && (
            <ChatBubble
              message={message}
              isMine={isMine}
              isFirst={isFirst}
              isLast={isLast}
              status={message.status}
              onReply={() => setReplyTo(message)}
              messages={messages}
              deleteMessage={deleteMessage}
            />
          )}
          {message.IdentificatorType === 'notification' && (
            <NotificationMessage
              text={message.content.message || 'Notification'}
              type="date"
              onAction={null}
            />
          )}
        </div>
      </div>
    );
  };
  

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      
      {console.log(props)}
      <Header
        {...props}
        type={receiverType === 'user' ? 'contact' : 'group'}
        contact={contact}
        group={group}
        currentUser={currentUser}
      />
      <div
        className="flex-1 p-0 overflow-hidden relative max-w-full bg-white"
        role="region"
        aria-label="Messages de la conversation"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center max-w-full box-border justify-between shadow-sm">
            <span>{error}</span>
            <button
              onClick={retryFetchMessages}
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
        {loading && (
          <p
            className="text-gray-600 text-center py-4 font-medium"
            role="status"
          >
            Chargement...
          </p>
        )}
        {!loading && messages.length === 0 && !error && (
          <p
            className="text-gray-600 text-center py-4 font-medium"
            role="status"
          >
            Aucun message pour l’instant
          </p>
        )}
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              height={height}
              width={width}
              itemCount={messages.length}
              itemSize={getRowHeight}
              className="focus:outline-none"
            >
              {Row}
            </List>
          )}
        </AutoSizer>
        <ScrollToBottomButton visible={showScrollButton} onClick={scrollToBottom} />
      </div>
      <InputBar
        email={currentUser.email}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={handleSendMessage}
        onEmojiSelect={(emoji) => setNewMessage(newMessage + emoji)}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        onKeyPress={() => {}}
      />
    </div>
  );
}

ChatArea.propTypes = {
  targetId: PropTypes.string.isRequired,
  receiverType: PropTypes.oneOf(['user', 'group']).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string,
    token: PropTypes.string,
    refreshToken: PropTypes.string,
  }).isRequired,
  onBlockContact: PropTypes.func,
  onDeleteContact: PropTypes.func,
  onViewProfile: PropTypes.func,
  onAddMember: PropTypes.func,
  onRemoveMember: PropTypes.func,
  onLeaveGroup: PropTypes.func,
  onUpdateGroup: PropTypes.func,
  tools: PropTypes.array,
};

export default ChatArea;