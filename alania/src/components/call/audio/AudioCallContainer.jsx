import React, { useState, useEffect } from 'react';
import AudioCallArea from './AudioCallArea';
import AudioControlBar from './AudioControlBar';
import AudioSidebar from './AudioSidebar';
import Draggable from '../../../utils/Draggable';

function AudioCallContainer({ 
  callType = 'p2p', 
  callData = { callStatus: "active", isMuted: false },
  onMute = () => console.log('Mute'),
  onUnmute = () => console.log('Unmute'),
  onHangUp = () => console.log('Hang up'),
  onShowParticipants = () => console.log('Show participants'),
  onHomeClick = () => console.log('Go to Home'),
  onSettingsClick = () => console.log('Open Settings'),
  onContactsClick = () => console.log('Show Contacts'),
  onCallHistoryClick = () => console.log('Show Call History'),
  onMessagesClick = () => console.log('Open Messages')
}) {
  const [sidebarOpacity, setSidebarOpacity] = useState(1);
  const [controlBarOpacity, setControlBarOpacity] = useState(1);
  const [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
      } catch (error) {
        console.error("Erreur d’accès au microphone:", error);
      }
    };

    initStream();

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative h-screen bg-gray-200 overflow-hidden">
      <AudioCallArea callType={callType} callData={{ ...callData, audioStream }} />
      
      {/* Sidebar */}
      <Draggable>
        <div
          className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-400 transition-opacity duration-500"
          style={{ opacity: sidebarOpacity }}
        >
          <AudioSidebar
            onHomeClick={onHomeClick}
            onSettingsClick={onSettingsClick}
            onContactsClick={onContactsClick}
            onCallHistoryClick={onCallHistoryClick}
            onMessagesClick={onMessagesClick}
          />
        </div>
      </Draggable>

      {/* Barre de contrôle */}
      <Draggable>
        <div
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-lg border border-gray-500 transition-opacity duration-500"
          style={{ opacity: controlBarOpacity }}
        >
          <AudioControlBar
            callStatus={callData.callStatus}
            isMuted={callData.isMuted}
            onMute={onMute}
            onUnmute={onUnmute}
            onHangUp={onHangUp}
            onShowParticipants={onShowParticipants}
          />
        </div>
      </Draggable>
    </div>
  );
}

export default AudioCallContainer;