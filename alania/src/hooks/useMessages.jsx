import { useState, useEffect } from 'react';
import MessageService from '../services/message/MessageService';
import NotificationService from '../services/notification/NotificationService';
import FileService from '../services/file/FileService';
import { webRTCService } from '../services/web/webrtcService';
import { eventService } from '../services/web/eventService';

export const useMessages = (targetId, receiverType, userEmail, currentUser, receiverEmail = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);

  useEffect(() => {
    if (!targetId || !receiverType || !userEmail || !currentUser) {
      console.warn('useMessages - paramètres manquants, setupWebRTC ignoré:', {
        targetId,
        receiverType,
        userEmail,
        currentUser,
      });
      return;
    }

    const normalizeConversationId = (email1, email2) => {
      const emails = [email1, email2].sort();
      return `${emails[0]}_${emails[1]}`;
    };

    const setupWebRTC = async () => {
      console.log('Entering setupWebRTC for targetId:', targetId, 'receiverType:', receiverType);
    
      try {
        if (!targetId || !userEmail || !receiverType || !currentUser) {
          console.warn('Missing required parameters, resetting messages');
          setMessages([]);
          return;
        }
    
        const conversationId = normalizeConversationId(userEmail, receiverEmail);
        console.log('Conversation ID:', conversationId);
    
        const fetchedMessages = await MessageService.getMessages(userEmail, { targetId, receiverType });
        setMessages(fetchedMessages);
        const unread = await MessageService.getUnreadCount(userEmail, { targetId, receiverType });
        setUnreadCount(unread);
    
        let conn = webRTCService.getConnection(conversationId);
        if (!conn) {
          console.log('Creating new WebRTC connection for', conversationId);
          conn = await webRTCService.createConnection(conversationId, receiverType === 'group', currentUser, receiverEmail);
          setPeerConnection(conn.pc);
          setDataChannel(conn.channel);
    
          if (receiverType === 'user') {
            console.log('Sending WebRTC offer to', receiverEmail);
            await webRTCService.sendOffer(conn.pc, receiverEmail, currentUser, conversationId);
          }
        } else {
          console.log('Reusing existing WebRTC connection for', conversationId);
          setPeerConnection(conn.pc);
          setDataChannel(conn.channel);
    
          if (conn.pc.signalingState === 'stable') {
            console.log('Connection already stable, no offer needed');
          }
        }
      } catch (err) {
        setError('Erreur lors de l’initialisation de WebRTC');
        console.error('Erreur setupWebRTC:', err);
      } finally {
        setLoading(false);
      }
    };
    
    setupWebRTC();

    return () => {
      if (peerConnection) {
        webRTCService.closeConnection(peerConnection, normalizeConversationId(userEmail, receiverEmail));
      }
    };
  }, [targetId, receiverType, userEmail, currentUser, receiverEmail]);

  useEffect(() => {
    if (!targetId || !receiverType || !userEmail || !receiverEmail || !currentUser) {
      console.warn('useMessages - paramètres manquants pour eventService:', {
        targetId,
        receiverType,
        userEmail,
        receiverEmail,
        currentUser,
      });
      return;
    }

    const conversationId = [userEmail, receiverEmail].sort().join('_');
    console.log('useMessages - Subscribing to eventService with:', {
      conversationId,
      userEmail,
      receiverEmail,
      targetId,
    });

    const handleReceivedMessage = async (message) => {
      console.log('Message reçu pour userEmail :', userEmail, 'message :', message);

      try {
        // Gestion des notifications d'appel
        if (message.type === 'call_request' || message.type === 'call_accept' || message.type === 'call_reject') {
          console.log('Notification d’appel reçue :', message);
          eventService.emit('call_notification', message);
          return;
        }

        // Gestion des messages standards
        if (!message.id || !message.senderId || !message.targetId || !message.receiverType) {
          console.warn('Message reçu invalide :', message);
          return;
        }

        // Traiter les fichiers reçus
        const files = message.content.file || [];
        const localFiles = await Promise.all(
          files.map(async (file) => {
            if (file.arrayBuffer) {
              console.log('Fichier reçu :', {
                name: file.name,
                type: file.type,
                size: file.size,
                arrayBufferLength: file.arrayBuffer.byteLength || file.arrayBuffer.length,
              });

              const buffer = file.arrayBuffer instanceof Uint8Array ? file.arrayBuffer.buffer : file.arrayBuffer;
              const blob = new Blob([buffer], { type: file.type });
              const savedFile = await FileService.saveFile(userEmail, blob, null, null, false);
              return {
                id: savedFile.id,
                path: savedFile.path,
                type: file.type,
                name: file.name,
                size: file.size,
                createdAt: file.createdAt,
              };
            } else {
              console.warn('Fichier sans arrayBuffer valide :', file);
              return null;
            }
          })
        ).then((results) => results.filter((f) => f !== null));

        // Traiter les fichiers vocaux reçus
        const voiceFiles = message.content.voice || [];
        const localVoiceFiles = await Promise.all(
          voiceFiles.map(async (voice) => {
            if (voice.arrayBuffer) {
              console.log('Fichier vocal reçu :', {
                name: voice.name,
                type: voice.type,
                size: voice.size,
                arrayBufferLength: voice.arrayBuffer.byteLength || voice.arrayBuffer.length,
              });

              const buffer = voice.arrayBuffer instanceof Uint8Array ? voice.arrayBuffer.buffer : voice.arrayBuffer;
              const blob = new Blob([buffer], { type: voice.type });
              const savedVoice = await FileService.saveFile(userEmail, blob, null, null, true);
              return {
                id: savedVoice.id,
                path: savedVoice.path,
                type: voice.type,
                name: voice.name,
                size: voice.size,
                createdAt: voice.createdAt,
                isVoice: true,
              };
            } else {
              console.warn('Fichier vocal sans arrayBuffer valide :', voice);
              return null;
            }
          })
        ).then((results) => results.filter((v) => v !== null));

        // Mettre à jour le message avec les fichiers locaux
        const messageToSave = {
          ...message,
          content: {
            ...message.content,
            file: localFiles,
            voice: localVoiceFiles,
          },
          targetId,
        };

        // Sauvegarder le message
        await MessageService.saveMessage(userEmail, {
          targetId,
          receiverType: message.receiverType,
          message: messageToSave,
        });

        // Mettre à jour l’état des messages
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            console.log('Message déjà présent, ignoré :', message.id);
            return prev;
          }
          console.log('Ajout du message :', messageToSave);
          return [...prev, { ...messageToSave, status: message.status || 'delivered' }];
        });

        // Ajouter une notification
        await NotificationService.saveNotification(userEmail, {
          id: `notif-${Date.now()}`,
          eventType: 'message',
          sender: 'system',
          targetId: message.targetId,
          receiverType: message.receiverType,
          actorId: message.senderId,
          content: { message: `Nouveau message de ${message.senderId}` },
          timestamp: Date.now(),
          isRead: 0,
        });

        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('Erreur lors du traitement du message reçu :', err);
        setError('Erreur lors de l’enregistrement du message reçu');
      }
    };

    // S'abonner à eventService
    const unsubscribe = eventService.subscribe(conversationId, handleReceivedMessage);

    // Nettoyer l'abonnement
    return () => {
      console.log('Unsubscribing from eventService for conversationId:', conversationId);
      unsubscribe();
    };
  }, [targetId, receiverType, userEmail, receiverEmail, currentUser]);

  const sendMessage = async (content, files = [], voice = []) => {
    try {
      if (!userEmail) throw new Error('Utilisateur non connecté');
      if (!dataChannel) throw new Error('DataChannel non initialisé');

      if (dataChannel.readyState !== 'open') {
        console.log('Attente de l’ouverture du dataChannel...');
        await Promise.race([
          new Promise((resolve) => {
            dataChannel.onopen = () => resolve();
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout du canal')), 5000)
          ),
        ]);
      }

      // Sauvegarder les fichiers localement et convertir les blobs en Uint8Array
      const savedFiles = await Promise.all(
        files.map(async (f) => {
          console.log('Sauvegarde du fichier :', f);
          const savedFile = await FileService.saveFile(userEmail, f.blob, null, null, false);
          const arrayBuffer = await f.blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          console.log('Fichier préparé pour envoi :', {
            name: f.name,
            size: f.blob.size,
            uint8ArrayLength: uint8Array.length,
          });
          return {
            id: savedFile.id,
            path: savedFile.path,
            type: f.type,
            name: f.name,
            size: f.blob.size,
            createdAt: savedFile.createdAt,
            arrayBuffer: uint8Array,
          };
        })
      );

      // Même logique pour les fichiers vocaux
      const savedVoice = await Promise.all(
        voice.map(async (v) => {
          console.log('Sauvegarde du fichier vocal :', v);
          const savedVoice = await FileService.saveFile(userEmail, v.blob, null, null, true);
          const arrayBuffer = await v.blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          console.log('Fichier vocal préparé pour envoi :', {
            name: v.name,
            size: v.blob.size,
            uint8ArrayLength: uint8Array.length,
          });
          return {
            id: savedVoice.id,
            path: savedVoice.path,
            type: v.type,
            name: v.name,
            size: v.blob.size,
            createdAt: savedVoice.createdAt,
            isVoice: true,
            arrayBuffer: uint8Array,
          };
        })
      );

      // Construire le message
      const message = {
        id: `msg-${Date.now()}`,
        senderId: userEmail,
        targetId,
        receiverType,
        content: {
          text: content.text || null,
          file: savedFiles,
          voice: savedVoice,
          call: content.call || null,
          replyTo: content.replyTo || null,
        },
        status: 'sent',
        sentAt: Date.now(),
        readAt: null,
        IdentificatorType: 'message',
      };

      // Envoyer via WebRTC
      await webRTCService.sendMessage(dataChannel, message);
      await MessageService.saveMessage(userEmail, { targetId, receiverType, message });
      setMessages((prev) => [...prev, message]);

      // Ajouter une notification
      await NotificationService.saveNotification(userEmail, {
        id: `notif-${Date.now()}`,
        eventType: 'message',
        sender: 'system',
        targetId,
        receiverType,
        actorId: userEmail,
        content: { message: `Nouveau message de ${userEmail}` },
        timestamp: Date.now(),
        isRead: 0,
      });
    } catch (err) {
      console.error('Erreur dans sendMessage :', err);
      setError("Erreur lors de l'envoi du message");
      throw err;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await MessageService.deleteMessage(userEmail, messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error('Error in deleteMessage:', err);
      setError('Erreur lors de la suppression du message');
    }
  };

  const markMessagesAsRead = async () => {
    try {
      for (const msg of messages) {
        if (msg.status !== 'read') {
          await MessageService.markAsRead(userEmail, msg.id);
        }
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.status !== 'read' ? { ...msg, status: 'read', readAt: Date.now() } : msg))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error in markMessagesAsRead:', err);
      setError('Erreur lors du marquage des messages comme lus');
    }
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    markMessagesAsRead,
    loading,
    unreadCount,
    error,
  };
};