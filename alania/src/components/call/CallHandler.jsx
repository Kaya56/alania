import { useState, useCallback, useEffect } from "react";
import CallManager from "../../components/call/CallManager";
import IncomingCallModal from "../../components/call/IncomingCallModal";
import AudioCallContainer from "../../components/call/audio/AudioCallContainer";
import VideoCallContainer from "../../components/call/video/VideoCallContainer";
import { webRTCService } from "../../services/web/webrtcService";
import { eventService } from "../../services/web/eventService";

function CallHandler({ currentUser, contacts, selectedContact, incomingCall, setIncomingCall, conversations, onCallActions }) {
  const [callState, setCallState] = useState({
    isCalling: false,
    callType: null,
    selectedTargetId: null,
    receiverType: "user",
    receiverEmail: null,
    conversationId: null,
  });
  const [isCallPanelVisible, setIsCallPanelVisible] = useState(false);

  const normalizeConversationId = useCallback((email1, email2) => {
    const emails = [email1, email2].sort();
    return `${emails[0]}_${emails[1]}`;
  }, []);

  const startCall = useCallback(
    async (isVideo = false, targetId, receiverType = "user") => {
      if (!targetId || receiverType !== "user") {
        console.error("Aucun contact sélectionné ou type invalide pour l’appel");
        return;
      }
      const receiverEmail = contacts.find((c) => c.id === targetId)?.email;
      if (!receiverEmail) {
        console.error("Email du destinataire introuvable");
        return;
      }
      const conversationId = normalizeConversationId(currentUser.email, receiverEmail);

      // Récupérer la connexion existante
      const conn = webRTCService.getConnection(conversationId);
      if (!conn) {
        console.error("Connexion WebRTC non trouvée pour la conversation:", conversationId);
        return;
      }

      // Ajouter les flux locaux si nécessaire
      if (!conn.localStream) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo,
          });
          conn.localStream = stream;
          stream.getTracks().forEach((track) => conn.pc.addTrack(track, stream));
          console.log("Flux locaux ajoutés pour l'appel:", stream.getTracks());
        } catch (error) {
          console.error("Erreur lors de l'accès aux médias:", error);
          return;
        }
      }

      // Envoyer une notification d'appel via le canal de données
      const callRequestMessage = {
        type: "call_request",
        from: currentUser.email,
        to: receiverEmail,
        isVideo,
        conversationId,
      };
      webRTCService.sendMessage(conn.channel, callRequestMessage);

      setCallState({
        isCalling: true,
        callType: isVideo ? "video" : "audio",
        selectedTargetId: targetId,
        receiverType,
        receiverEmail,
        conversationId,
      });
      setIsCallPanelVisible(true);
    },
    [contacts, currentUser, normalizeConversationId]
  );

  const handleAcceptCall = useCallback(async (incomingCall) => {
    const conversationId = incomingCall.conversationId;
    const conn = webRTCService.getConnection(conversationId);
    if (!conn) {
      console.error("Connexion WebRTC non trouvée pour accepter l'appel");
      return;
    }

    // Ajouter les flux locaux si nécessaire
    if (!conn.localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: incomingCall.isVideo,
        });
        conn.localStream = stream;
        stream.getTracks().forEach((track) => conn.pc.addTrack(track, stream));
        console.log("Flux locaux ajoutés pour l'acceptation:", stream.getTracks());

        // Forcer une renégociation pour synchroniser les pistes
        const offer = await conn.pc.createOffer();
        await conn.pc.setLocalDescription(offer);
        webRTCService.sendMessage(conn.channel, {
          type: "offer",
          from: currentUser.email,
          to: incomingCall.caller.email,
          sdp: offer.sdp,
          conversationId,
        });
      } catch (error) {
        console.error("Erreur lors de l'accès aux médias:", error);
        return;
      }
    }

    // Envoyer un message d'acceptation
    const callAcceptMessage = {
      type: "call_accept",
      from: currentUser.email,
      to: incomingCall.caller.email,
      conversationId,
    };
    webRTCService.sendMessage(conn.channel, callAcceptMessage);

    setCallState({
      isCalling: true,
      callType: incomingCall.isVideo ? "video" : "audio",
      selectedTargetId: contacts.find((c) => c.email === incomingCall.caller.email)?.id,
      receiverType: "user",
      receiverEmail: incomingCall.caller.email,
      conversationId,
    });
    setIsCallPanelVisible(true);
    setIncomingCall(null);
  }, [contacts, currentUser, setIncomingCall]);

  const handleRejectCall = useCallback((incomingCall) => {
    const conversationId = incomingCall.conversationId;
    const conn = webRTCService.getConnection(conversationId);
    if (conn) {
      const callRejectMessage = {
        type: "call_reject",
        from: currentUser.email,
        to: incomingCall.caller.email,
        conversationId,
      };
      webRTCService.sendMessage(conn.channel, callRejectMessage);
    }
    setIncomingCall(null);
  }, [setIncomingCall]);

  const handleHangUp = useCallback(() => {
    setCallState({
      isCalling: false,
      callType: null,
      selectedTargetId: null,
      receiverType: "user",
      receiverEmail: null,
      conversationId: null,
    });
    setIsCallPanelVisible(false);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsCallPanelVisible(false);
  }, []);

  useEffect(() => {
    // Écoute des notifications d'appel
    const handleCallNotification = (message) => {
      if (message.type === "call_request") {
        setIncomingCall({
          caller: { email: message.from },
          isVideo: message.isVideo,
          conversationId: message.conversationId,
        });
      } else if (message.type === "call_accept" && callState.isCalling) {
        console.log("Appel accepté par l'autre partie");
      } else if (message.type === "call_reject" && callState.isCalling) {
        setCallState((prev) => ({ ...prev, isCalling: false }));
        setIsCallPanelVisible(false);
        console.log("Appel rejeté par l'autre partie");
      } else if (message.type === "offer" && callState.isCalling) {
        // Gérer une nouvelle offre pour renégociation
        const conn = webRTCService.getConnection(message.conversationId);
        if (conn) {
          conn.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: message.sdp }))
            .then(async () => {
              const answer = await conn.pc.createAnswer();
              await conn.pc.setLocalDescription(answer);
              webRTCService.sendMessage(conn.channel, {
                type: "answer",
                from: currentUser.email,
                to: message.from,
                sdp: answer.sdp,
                conversationId: message.conversationId,
              });
            })
            .catch((error) => console.error("Erreur lors de la renégociation:", error));
        }
      } else if (message.type === "answer" && callState.isCalling) {
        const conn = webRTCService.getConnection(message.conversationId);
        if (conn) {
          conn.pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: message.sdp }))
            .catch((error) => console.error("Erreur lors de l'application de l'answer:", error));
        }
      }
    };
    eventService.on("call_notification", handleCallNotification);

    return () => {
      eventService.off("call_notification", handleCallNotification);
    };
  }, [callState.isCalling, setIncomingCall, currentUser]);

  useEffect(() => {
    if (onCallActions) {
      onCallActions({ startCall, isCalling: callState.isCalling });
    }
  }, [startCall, callState.isCalling, onCallActions]);

  return (
    <>
      <CallManager
        userEmail={currentUser?.email}
        currentUser={currentUser}
        onCallStateChange={({ isCalling }) =>
          setCallState((prev) => ({ ...prev, isCalling }))
        }
      />
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall.caller}
          isVideo={incomingCall.isVideo}
          onAccept={() => handleAcceptCall(incomingCall)}
          onReject={() => handleRejectCall(incomingCall)}
        />
      )}
      {callState.isCalling && isCallPanelVisible && callState.callType === "audio" && (
        <div className="fixed inset-0 z-50 md:w-3/4 md:h-3/4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:resize md:overflow-auto">
          <AudioCallContainer
            callType="p2p"
            callData={{
              participantName: contacts.find((c) => c.email === callState.receiverEmail)?.name || callState.receiverEmail,
              participantEmail: callState.receiverEmail,
              participantAvatar: null,
              callStatus: "active",
              isMuted: false,
            }}
            conversationId={callState.conversationId}
            onHangUp={handleHangUp}
            onClosePanel={handleClosePanel}
            onMute={() => console.log("Mute")}
            onUnmute={() => console.log("Unmute")}
            onShowParticipants={() => console.log("Show participants")}
          />
        </div>
      )}
      {callState.isCalling && isCallPanelVisible && callState.callType === "video" && (
        <div className="fixed inset-0 z-50 md:w-3/4 md:h-3/4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:resize md:overflow-auto">
          <VideoCallContainer
            callType="p2p"
            callData={{
              participantName: contacts.find((c) => c.email === callState.receiverEmail)?.name || callState.receiverEmail,
              participantEmail: callState.receiverEmail,
              participantAvatar: null,
              callStatus: "active",
              isMuted: false,
              isVideoOn: true,
            }}
            conversationId={callState.conversationId}
            onHangUp={handleHangUp}
            onClosePanel={handleClosePanel}
            onMute={() => console.log("Mute")}
            onUnmute={() => console.log("Unmute")}
            onToggleVideo={() => console.log("Toggle video")}
            onShowParticipants={() => console.log("Show participants")}
          />
        </div>
      )}
    </>
  );
}

export default CallHandler;