import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { UserIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../../../hooks/useFileUrl';
import MessageTools from '../../common/chatArea/components/header/components/MessageTools';
import ContactInfo from './ContactInfo';
import ContactInfoBubble from './ContactInfoBubble';

function ConversationHeader({ contact, currentUser, onViewContactInfo, onBlockContact, onDeleteContact, onViewProfile, tools = [] }) {
  const { username, photoPath, status, lastSeen } = contact;
  const { fileUrl, metadata } = useFileUrl(photoPath, { lazy: false });
  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const toolsRef = useRef(null);

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    const date = new Date(lastSeen);
    return `Dernière connexion : ${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
  };

  const handleToggleInfo = (e) => {
    // Vérifier si le clic provient de la zone des outils
    if (toolsRef.current && toolsRef.current.contains(e.target)) {
      return;
    }
    setShowInfo(!showInfo);
  };

  const handleCloseInfo = () => {
    setShowInfo(false);
  };

  return (
    <div className="relative">
      <div
        className="bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 py-2 cursor-pointer"
        onClick={handleToggleInfo}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {fileUrl && metadata?.type.startsWith('image/') ? (
            <img
              src={fileUrl}
              alt={username || 'Utilisateur'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-8 h-8 text-gray-400" />
          )}
          <div className="truncate">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">{username || 'Nom inconnu'}</p>
              <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {status === 'offline' && lastSeen ? formatLastSeen(lastSeen) : status}
            </p>
          </div>
        </div>
        <div 
          ref={toolsRef} 
          className="ml-2 flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
        >
          <MessageTools tools={tools} />
        </div>
      </div>

      {showInfo && isMobile && (
        <ContactInfoBubble
          contact={contact}
          currentUser={currentUser}
          onViewContactInfo={() => {
            handleCloseInfo();
            onViewContactInfo();
          }}
          onClose={handleCloseInfo}
        />
      )}

    {/* PANNEAU FLOTTANT À DROITE, SOUS LA BARRE D’EN-TÊTE */}
    {showInfo && !isMobile && (
      <div className="absolute right-0 top-full w-80 sm:w-96 bg-white shadow-lg border border-gray-200 z-50">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Informations du contact</h2>
          <button
            onClick={handleCloseInfo}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ContactInfo
          contact={contact}
          currentUser={currentUser}
          onBlockContact={onBlockContact}
          onDeleteContact={onDeleteContact}
          onViewProfile={onViewProfile}
        />
      </div>
    )}
  </div>

  );
}

ConversationHeader.propTypes = {
  contact: PropTypes.shape({
    username: PropTypes.string,
    photoPath: PropTypes.string,
    status: PropTypes.string.isRequired,
    lastSeen: PropTypes.number,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  onViewContactInfo: PropTypes.func.isRequired,
  onBlockContact: PropTypes.func.isRequired,
  onDeleteContact: PropTypes.func.isRequired,
  onViewProfile: PropTypes.func.isRequired,
  tools: PropTypes.array,
};

export default ConversationHeader;