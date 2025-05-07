import React from 'react';
import { 
  Cog6ToothIcon,      // Paramètres
  UserGroupIcon,      // Participants
  ClockIcon,          // Historique des appels
  ChatBubbleLeftIcon, // Chat
  ArrowLeftIcon       // Quitter l’appel ou retour
} from '@heroicons/react/24/outline';

function AudioSidebar({ 
  onExitCall = () => console.log('Exit call'),        
  onSettingsClick = () => console.log('Open Settings'),    
  onParticipantsClick = () => console.log('Show Participants'), 
  onCallHistoryClick = () => console.log('Show Call History'), 
  onChatClick = () => console.log('Open Chat')        
}) {
  return (
    <div className="min-w-16 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4 rounded-lg">
      {/* Quitter l’appel ou retour */}
      <button
        onClick={onExitCall}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Quitter l’appel"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {/* Paramètres */}
      <button
        onClick={onSettingsClick}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Paramètres"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>

      {/* Participants */}
      <button
        onClick={onParticipantsClick}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Participants"
      >
        <UserGroupIcon className="w-6 h-6" />
      </button>

      {/* Historique des appels */}
      <button
        onClick={onCallHistoryClick}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Historique des appels"
      >
        <ClockIcon className="w-6 h-6" />
      </button>

      {/* Chat */}
      <button
        onClick={onChatClick}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Chat"
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

export default AudioSidebar;
