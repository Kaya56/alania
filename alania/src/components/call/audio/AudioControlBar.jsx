import React from 'react';
import { 
  MicrophoneIcon, // Pour mute/unmute
  PhoneXMarkIcon, // Pour raccrocher
  UserGroupIcon,  // Pour afficher les participants
  EllipsisHorizontalIcon // Pour options supplémentaires
} from '@heroicons/react/24/outline';

function AudioControlBar({ 
  callStatus = 'connecting', 
  isMuted = false, 
  onMute = () => console.log('Mute'), 
  onUnmute = () => console.log('Unmute'), 
  onHangUp = () => console.log('Hang up'), 
  onShowParticipants = () => console.log('Show participants') 
}) {
  const isActive = callStatus === 'active';

  return (
    <div className="flex justify-center items-center p-4 bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-300 hover:opacity-100">
      <div className="flex space-x-4">
        {/* Mute/Unmute */}
        <button
          onClick={isActive ? (isMuted ? onUnmute : onMute) : null}
          disabled={!isActive}
          className={`p-2 rounded transition-colors ${
            isActive && !isMuted ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'
          }`}
          title={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          <MicrophoneIcon className={`w-6 h-6 ${isMuted ? 'text-red-400' : ''}`} />
        </button>

        {/* Raccrocher */}
        <button
          onClick={onHangUp}
          disabled={callStatus === 'ended'}
          className={`p-2 rounded transition-colors ${
            callStatus !== 'ended' ? 'hover:bg-red-600' : 'opacity-50 cursor-not-allowed'
          }`}
          title="Raccrocher"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </button>

        {/* Participants (surtout utile pour groupe) */}
        <button
          onClick={onShowParticipants}
          disabled={!isActive}
          className={`p-2 rounded transition-colors ${
            isActive ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'
          }`}
          title="Participants"
        >
          <UserGroupIcon className="w-6 h-6" />
        </button>

        {/* Plus d’options */}
        <button
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="Plus d'options"
        >
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default AudioControlBar;
