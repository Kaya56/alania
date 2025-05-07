import React, { useState, useEffect, useRef } from 'react';
import AudioCallContainer from './audio/AudioCallContainer';
import VideoCallContainer from './video/VideoCallContainer';
import { webRTCService } from '../../services/web/webrtcService';

const CallManager = ({ userEmail, currentUser, onCallStateChange }) => {
  const [callState, setCallState] = useState({
    isCalling: false,
    callType: null, // 'audio' or 'video'
    targetId: null,
    receiverType: null, // 'user' or 'group'
    receiverEmail: null,
  });
  const [stream, setStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const startCall = async (isVideo, targetId, receiverType, receiverEmail) => {
    try {
      console.log('Starting call:', { isVideo, targetId, receiverType, receiverEmail });
      setCallState({
        isCalling: true,
        callType: isVideo ? 'video' : 'audio',
        targetId,
        receiverType,
        receiverEmail,
      });

      // Obtenir le flux local (audio ou audio+vidéo)
      const constraints = { audio: true, video: isVideo };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(localStream);

      // Initialiser WebRTC
      const conversationId = [userEmail, receiverEmail].sort().join('_');
      const conn = await webRTCService.createConnection(conversationId, receiverType === 'group', currentUser, receiverEmail);
      peerConnectionRef.current = conn.pc;
      dataChannelRef.current = conn.channel;

      // Ajouter le flux local à la connexion
      localStream.getTracks().forEach((track) => {
        conn.pc.addTrack(track, localStream);
      });

      // Gérer les flux distants
      conn.pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setStream((prev) => (prev ? prev : remoteStream));
      };

      // Envoyer l'offre WebRTC
      if (receiverType === 'user') {
        await webRTCService.sendOffer(conn.pc, receiverEmail, currentUser, conversationId);
      }

      onCallStateChange?.({ isCalling: true });
    } catch (err) {
      console.error('Erreur lors du démarrage de l’appel:', err);
      setCallState((prev) => ({ ...prev, isCalling: false }));
      onCallStateChange?.({ isCalling: false });
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      webRTCService.closeConnection(peerConnectionRef.current, [userEmail, callState.receiverEmail].sort().join('_'));
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCallState({ isCalling: false, callType: null, targetId: null, receiverType: null, receiverEmail: null });
    onCallStateChange?.({ isCalling: false });
  };

  const handleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
    }
  };

  const handleUnmute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
    }
  };

  return (
    <>
      {callState.isCalling && callState.callType === 'audio' && (
        <AudioCallContainer
          callType={callState.receiverType === 'group' ? 'group' : 'p2p'}
          callData={{
            participantName: callState.receiverEmail,
            callStatus: peerConnectionRef.current?.connectionState || 'connecting',
            audioStream: stream,
            isMuted: stream?.getAudioTracks().every((track) => !track.enabled) || false,
          }}
          onMute={handleMute}
          onUnmute={handleUnmute}
          onHangUp={endCall}
          onShowParticipants={() => console.log('Show participants')}
          onHomeClick={() => console.log('Go to Home')}
          onSettingsClick={() => console.log('Open Settings')}
          onContactsClick={() => console.log('Show Contacts')}
          onCallHistoryClick={() => console.log('Show Call History')}
          onMessagesClick={() => console.log('Open Messages')}
        />
      )}
      {callState.isCalling && callState.callType === 'video' && (
        <VideoCallContainer
          callType={callState.receiverType === 'group' ? 'group' : 'p2p'}
          callData={{
            participantName: callState.receiverEmail,
            callStatus: peerConnectionRef.current?.connectionState || 'connecting',
            videoStream: stream,
          }}
          onMute={handleMute}
          onUnmute={handleUnmute}
          onHangUp={endCall}
          onShowParticipants={() => console.log('Show participants')}
          onHomeClick={() => console.log('Go to Home')}
          onSettingsClick={() => console.log('Open Settings')}
          onContactsClick={() => console.log('Show Contacts')}
          onCallHistoryClick={() => console.log('Show Call History')}
          onMessagesClick={() => console.log('Open Messages')}
        />
      )}
    </>
  );
};

export default CallManager;