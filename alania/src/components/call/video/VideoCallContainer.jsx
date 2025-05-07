import React, { useState, useEffect } from 'react';
import VideoCallArea from './VideoCallArea';
import VideoControlBar from './VideoControlBar';
import VideoSidebar from './VideoSidebar';
import Draggable from '../../../utils/Draggable';
import { MOCK_CALL_DATA } from './mockData';

function VideoCallContainer({
  callType = 'group',
  callData = null,
  onMute = () => console.log('Mute'),
  onUnmute = () => console.log('Unmute'),
  onToggleVideo = () => console.log('Toggle video'),
  onHangUp = () => console.log('Hang up'),
  onShowParticipants = () => console.log('Show participants'),
  onHomeClick = () => console.log('Go to Home'),
  onSettingsClick = () => console.log('Open Settings'),
  onContactsClick = () => console.log('Show Contacts'),
  onCallHistoryClick = () => console.log('Show Call History'),
  onMessagesClick = () => console.log('Open Messages'),
}) {
  const [sidebarOpacity, setSidebarOpacity] = useState(1);
  const [controlBarOpacity, setControlBarOpacity] = useState(1);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isControlBarHovered, setIsControlBarHovered] = useState(false);

  // Utilise les données externes ou les mocks par défaut
  const callDataResolved = callData || MOCK_CALL_DATA[callType];

  // Gestion de l’opacité de la sidebar
  useEffect(() => {
    let interval;
    if (!isSidebarHovered) {
      interval = setInterval(() => {
        setSidebarOpacity((prev) => Math.max(prev - 0.1, 0.2));
      }, 2000);
    } else {
      setSidebarOpacity(1);
    }
    return () => clearInterval(interval);
  }, [isSidebarHovered]);

  // Gestion de l’opacité de la barre de contrôle
  useEffect(() => {
    let interval;
    if (!isControlBarHovered) {
      interval = setInterval(() => {
        setControlBarOpacity((prev) => Math.max(prev - 0.1, 0.2));
      }, 2000);
    } else {
      setControlBarOpacity(1);
    }
    return () => clearInterval(interval);
  }, [isControlBarHovered]);

  return (
    <div className="relative h-screen bg-gray-200 overflow-hidden">
      <VideoCallArea callType={callType} callData={callDataResolved} />

      {/* Sidebar */}
      <Draggable>
        <div
          className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-400 transition-opacity duration-500"
          style={{ opacity: sidebarOpacity, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)' }}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          <VideoSidebar
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
          style={{ opacity: controlBarOpacity, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)' }}
          onMouseEnter={() => setIsControlBarHovered(true)}
          onMouseLeave={() => setIsControlBarHovered(false)}
        >
          <VideoControlBar
            callStatus={callDataResolved.callStatus}
            isMuted={callDataResolved.isMuted}
            isVideoOn={callDataResolved.isVideoOn}
            onMute={onMute}
            onUnmute={onUnmute}
            onToggleVideo={onToggleVideo}
            onHangUp={onHangUp}
            onShowParticipants={onShowParticipants}
          />
        </div>
      </Draggable>
    </div>
  );
}

export default VideoCallContainer;
