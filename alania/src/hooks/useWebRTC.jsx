import { useState, useEffect, useRef, useMemo } from "react";
import { webRTCService } from "../services/web/webrtcService";
import { eventService } from "../services/web/eventService";
import { decode } from "@msgpack/msgpack";

function useWebRTC(currentUser, contacts, groups) {
  const [incomingCall, setIncomingCall] = useState(null);
  const isWebSocketInitialized = useRef(false);

  const normalizeConversationId = (email1, email2) => {
    const emails = [email1, email2].sort();
    return `${emails[0]}_${emails[1]}`;
  };

  const conversations = useMemo(() => {
    if (!currentUser?.email) return [];
    return [
      ...contacts.map((contact) => ({
        conversationId: normalizeConversationId(currentUser.email, contact.email),
        receiverEmail: contact.email,
      })),
      ...groups.map((group) => ({
        conversationId: group.id,
        receiverEmail: null,
      })),
    ];
  }, [contacts, groups, currentUser?.email]);

  useEffect(() => {
    const initializeWebRTC = async () => {
      if (!currentUser?.email || !currentUser?.token || isWebSocketInitialized.current) {
        console.log("WebRTC déjà initialisé ou utilisateur manquant");
        return;
      }
      try {
        await webRTCService.initWebSocket(currentUser);
        isWebSocketInitialized.current = true;
        for (const { conversationId, receiverEmail } of conversations) {
          const existingConn = webRTCService.getConnection(conversationId);
          if (existingConn) {
            if (existingConn.channel) {
              existingConn.channel.onmessage = (event) => {
                try {
                  const rawData = new Uint8Array(event.data);
                  const message = decode(rawData);
                  eventService.emit(conversationId, message);
                } catch (error) {
                  console.error(`Erreur décodage msgpack pour ${conversationId}:`, error);
                }
              };
            }
          } else {
            await webRTCService.setupReceiver(conversationId, currentUser, (message) => {
              eventService.emit(conversationId, message);
            });
          }
        }
      } catch (error) {
        console.error("Erreur initialisation WebRTC:", error);
      }
    };

    initializeWebRTC();

    return () => {
      conversations.forEach(({ conversationId }) => {
        const conn = webRTCService.getConnection(conversationId);
        if (conn) {
          webRTCService.closeConnection(conn.pc, conversationId);
        }
      });
    };
  }, [currentUser, conversations]);

  useEffect(() => {
    const handleIncomingCall = (remoteStream, conversationId) => {
      const [callerEmail] = conversationId
        .split("_")
        .filter((email) => email !== currentUser.email);
      const callerContact = contacts.find((c) => c.email === callerEmail);
      const isVideo = remoteStream.getVideoTracks().length > 0;
      setIncomingCall({
        conversationId,
        caller: callerContact || { email: callerEmail },
        isVideo,
        remoteStream,
      });
    };

    conversations.forEach(({ conversationId }) => {
      eventService.on(`remoteStream:${conversationId}`, (remoteStream) =>
        handleIncomingCall(remoteStream, conversationId)
      );
    });

    return () => {
      conversations.forEach(({ conversationId }) => {
        eventService.off(`remoteStream:${conversationId}`, handleIncomingCall);
      });
    };
  }, [conversations, currentUser, contacts]);

  return { conversations, isWebSocketInitialized, incomingCall, setIncomingCall };
}

export default useWebRTC;