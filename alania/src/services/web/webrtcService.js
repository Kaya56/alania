import { encode, decode } from '@msgpack/msgpack';
import { eventService } from './eventService';
import { WS_BASE } from '../api/apiBase';

let socket = null;
let isConnecting = false;
let signalingCallbacks = new Map();
let errorCallbacks = new Map();
let peerConnections = new Map();
let sessionId = null;
let pendingMessages = new Map();

const normalizeConversationId = (email1, email2) => {
  const emails = [email1, email2].sort();
  return `${emails[0]}_${emails[1]}`;
};

export const webRTCService = {
  getConnection(conversationId) {
    console.log('Checking for existing connection for', conversationId);
    const conn = peerConnections.get(conversationId);
    if (
      conn &&
      conn.pc &&
      conn.pc.signalingState !== 'closed' &&
      conn.channel &&
      conn.channel.readyState === 'open'
    ) {
      console.log('Found existing connection:', conn.pc.signalingState);
      return conn;
    }
    console.log('No valid existing connection found for', conversationId);
    return null;
  },

  async initWebSocket(currentUser) {
    console.log('Starting initWebSocket for', currentUser.email);
    if (socket && socket.readyState === WebSocket.OPEN) return;
    if (isConnecting) return;

    sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      console.log('Reusing existing sessionId from localStorage:', sessionId);
    } else {
      console.log('No sessionId found in localStorage, will register a new one');
    }

    isConnecting = true;

    const socketUrl = `${WS_BASE}/ws?token=${encodeURIComponent(currentUser.token)}`;
    console.log('Init WebSocket on', socketUrl);
    socket = new WebSocket(socketUrl);

    return new Promise((resolve, reject) => {
      socket.onopen = () => {
        console.log('WebSocket connected for', currentUser.email);
        const registerMessage = {
          type: 'register',
          email: currentUser.email,
          token: currentUser.token,
        };
        socket.send(JSON.stringify(registerMessage));
        isConnecting = false;
        resolve();
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);

          if (typeof message.success === 'boolean') {
            if (message.success && message.data && message.data.sessionId) {
              sessionId = message.data.sessionId;
              console.log('Session ID received:', sessionId);
              localStorage.setItem('sessionId', sessionId);
            } else if (!message.success) {
              console.error('Server error:', message.message);
              errorCallbacks.forEach((cb) => cb(message));
            }
          } else if (message.type === 'offer' || message.type === 'answer' || message.type === 'candidate') {
            console.log('Processing signaling message:', message);
            let conversationId = message.conversationId;
            if (!conversationId) {
              conversationId = normalizeConversationId(message.from, message.to);
              console.warn(`No conversationId in message, deduced: ${conversationId}`);
            }

            const callback = signalingCallbacks.get(conversationId);
            if (callback) {
              callback(message);
            } else {
              if (!pendingMessages.has(conversationId)) {
                pendingMessages.set(conversationId, []);
              }
              pendingMessages.get(conversationId).push(message);
              console.log(`Buffered message for ${conversationId}:`, message);
              if (pendingMessages.get(conversationId).length > 100) {
                pendingMessages.set(conversationId, pendingMessages.get(conversationId).slice(-50));
                console.warn(`Trimmed old pending messages for ${conversationId}`);
              }
            }
          } else {
            console.warn('Unhandled message:', message);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting = false;
        reject(error);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        socket = null;
        isConnecting = false;
      };
    });
  },

  async createConnection(conversationId, isGroup = false, currentUser, receiverEmail, isVideo = false) {
    console.log('Creating connection for conversation:', conversationId);
    alert('Création connexion pour : ' + conversationId);
  
    const existingConn = this.getConnection(conversationId);
    if (existingConn) {
      console.log('Reusing existing connection for', conversationId);
      alert('Connexion existante réutilisée pour : ' + conversationId);
      return existingConn;
    }
  
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const conn = { pc, channel: null, localStream: null, remoteStream: new MediaStream() };
    peerConnections.set(conversationId, conn);
    alert('Nouvelle connexion WebRTC créée');
  
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('mediaDevices non supporté sur ce navigateur');
        throw new Error('mediaDevices.getUserMedia is not supported');
      }
    
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      conn.localStream = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      console.log('Local stream added:', stream.getTracks());
      alert('Flux local obtenu et ajouté');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Erreur accès média : ' + error.message);
      // throw new Error('Failed to access media devices');
    }
    
  
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        conn.remoteStream.addTrack(track);
      });
      console.log('Remote stream received:', conn.remoteStream);
      alert('Flux distant reçu');
      eventService.emit(`remoteStream:${conversationId}`, conn.remoteStream);
    };
  
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'candidate',
            from: currentUser.email,
            to: receiverEmail,
            candidate: event.candidate.candidate,
            token: currentUser.token,
            conversationId,
          })
        );
        alert('ICE candidate envoyé');
      }
    };
  
    const channel = pc.createDataChannel(`messages-${conversationId}`, {
      maxRetransmits: 5,
      ordered: true,
    });
  
    channel.onopen = () => {
      console.log('Data channel open');
      alert('Canal de données ouvert');
    };
  
    channel.onmessage = (event) => {
      try {
        const rawData = new Uint8Array(event.data);
        console.log('Données brutes reçues via DataChannel:', {
          conversationId,
          dataLength: rawData.length,
        });
        const message = decode(rawData);
        console.log('Message décodé avec msgpack:', {
          conversationId,
          files: message.content?.file?.map((f) => ({
            name: f.name,
            size: f.size,
            arrayBufferLength: f.arrayBuffer?.length || 0,
          })) || [],
        });
        eventService.emit(conversationId, message);
        alert('Message reçu via DataChannel');
      } catch (error) {
        console.error('Erreur lors du décodage msgpack:', error);
        alert('Erreur décodage message : ' + error.message);
      }
    };
  
    channel.onerror = (err) => {
      console.error('Channel error:', err);
      alert('Erreur canal : ' + err.message);
    };
  
    channel.onclose = () => {
      console.log('Data channel closed');
      alert('Canal de données fermé');
    };
  
    conn.channel = channel;
  
    return conn;
  },
  

  async sendOffer(pc, receiverEmail, currentUser, conversationId) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Local description set');

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
      }

      const signalingMessage = {
        type: 'offer',
        from: currentUser.email,
        to: receiverEmail,
        sdp: offer.sdp,
        token: currentUser.token,
        conversationId,
      };
      socket.send(JSON.stringify(signalingMessage));
      console.log('Offer sent:', signalingMessage);

      return new Promise((resolve, reject) => {
        signalingCallbacks.set(conversationId, (signalingMessage) => {
          if (signalingMessage.type === 'answer' && signalingMessage.to === currentUser.email) {
            pc.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: signalingMessage.sdp })
            )
              .then(() => {
                signalingCallbacks.delete(conversationId);
                resolve();
              })
              .catch(reject);
          } else if (signalingMessage.type === 'candidate' && signalingMessage.to === currentUser.email) {
            pc.addIceCandidate(
              new RTCIceCandidate({
                candidate: signalingMessage.candidate,
                sdpMid: '0',
                sdpMLineIndex: 0,
              })
            ).catch(reject);
          }
        });

        errorCallbacks.set(conversationId, (error) => {
          signalingCallbacks.delete(conversationId);
          errorCallbacks.delete(conversationId);
          reject(new Error(error.message));
        });

        setTimeout(() => {
          if (signalingCallbacks.has(conversationId)) {
            console.warn(`Timeout waiting for answer on conversation ${conversationId}`);
            signalingCallbacks.delete(conversationId);
            errorCallbacks.delete(conversationId);
            reject(new Error('Timeout waiting for WebRTC answer'));
          }
        }, 30000);
      });
    } catch (error) {
      console.error('Error sending offer:', error);
      throw error;
    }
  },

  async sendMessage(channel, message) {
    if (!channel) {
      throw new Error('Canal de données non défini');
    }
    console.log('État du canal avant envoi :', channel.readyState);
    if (channel.readyState !== 'open') {
      throw new Error('Le canal de données n’est pas ouvert');
    }
    try {
      console.log('Message avant encodage msgpack:', {
        files: message.content?.file?.map((f) => ({
          name: f.name,
          size: f.size,
          arrayBufferLength: f.arrayBuffer?.length || 0,
        })) || [],
      });
      const encodedMessage = encode(message);
      console.log('Taille après encodage msgpack:', encodedMessage.length);
      channel.send(encodedMessage);
      console.log('Message envoyé avec msgpack:', message);
    } catch (error) {
      console.error('Erreur lors de l’encodage msgpack:', error);
      throw new Error('Échec de l’envoi du message');
    }
  },

  async closeConnection(pc, conversationId) {
    console.log('Closing connection for', conversationId);
    const conn = peerConnections.get(conversationId);
    if (conn) {
      if (conn.localStream) {
        conn.localStream.getTracks().forEach((track) => {
          track.stop();
          console.log('Stopped track:', track);
        });
      }
      if (conn.pc) {
        conn.pc.close();
      }
      peerConnections.delete(conversationId);
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      socket = null;
    }
    signalingCallbacks.forEach((_, key) => {
      if (key.startsWith(conversationId)) {
        signalingCallbacks.delete(key);
      }
    });
    errorCallbacks.forEach((_, key) => {
      if (key.startsWith(conversationId)) {
        errorCallbacks.delete(key);
      }
    });
    pendingMessages.delete(conversationId);
    console.log('Connection closed');
  },

  async setupReceiver(conversationId, currentUser, onMessage) {
    console.log('Setting up receiver for conversation:', conversationId);
    let conn = peerConnections.get(conversationId);
    if (!conn) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      conn = { pc, channel: null, localStream: null, remoteStream: new MediaStream() };
      peerConnections.set(conversationId, conn);
    }

    conn.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        conn.remoteStream.addTrack(track);
      });
      console.log('Remote stream received in setupReceiver:', conn.remoteStream);
      eventService.emit(`remoteStream:${conversationId}`, conn.remoteStream);
    };

    conn.pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (event) => {
        try {
          const rawData = new Uint8Array(event.data);
          console.log('Taille des données brutes reçues:', rawData.length);
          const message = decode(rawData);
          console.log('Message décodé dans setupReceiver:', message);
          onMessage(message);
        } catch (error) {
          console.error('Erreur lors du décodage msgpack:', error);
        }
      };
      channel.onopen = () => console.log('Data channel opened');
      channel.onclose = () => console.log('Data channel closed');
      conn.channel = channel;
    };

    signalingCallbacks.set(conversationId, async (signalingMessage) => {
      console.log('Processing signaling message for conversation:', conversationId, signalingMessage);
      if (signalingMessage.type === 'offer' && signalingMessage.to === currentUser.email) {
        try {
          console.log('STEP 1: Setting remote description with offer');
          await conn.pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'offer', sdp: signalingMessage.sdp })
          );
          console.log('STEP 2: Creating answer');
          const answer = await conn.pc.createAnswer();
          console.log('STEP 3: Setting local description with answer');
          await conn.pc.setLocalDescription(answer);
          console.log('STEP 4: Sending answer via WebSocket');
          socket.send(
            JSON.stringify({
              type: 'answer',
              from: currentUser.email,
              to: signalingMessage.from,
              sdp: answer.sdp,
              token: currentUser.token,
              conversationId,
            })
          );
          console.log('STEP 5: Answer sent successfully');
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      } else if (signalingMessage.type === 'candidate' && signalingMessage.to === currentUser.email) {
        try {
          console.log('Adding ICE candidate:', signalingMessage.candidate);
          await conn.pc.addIceCandidate(
            new RTCIceCandidate({
              candidate: signalingMessage.candidate,
              sdpMid: '0',
              sdpMLineIndex: 0,
            })
          );
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        console.log('Message ignored: type or recipient mismatch');
      }
    });

    if (pendingMessages.has(conversationId)) {
      const messages = pendingMessages.get(conversationId);
      console.log(`Processing ${messages.length} pending messages for ${conversationId}`);
      messages.forEach((message) => {
        signalingCallbacks.get(conversationId)(message);
      });
      pendingMessages.delete(conversationId);
    }

    if (pendingMessages.has('default')) {
      const defaultMessages = pendingMessages.get('default');
      const relevantMessages = defaultMessages.filter(
        (msg) => normalizeConversationId(msg.from, msg.to) === conversationId
      );
      relevantMessages.forEach((message) => {
        signalingCallbacks.get(conversationId)(message);
      });
      pendingMessages.set(
        'default',
        defaultMessages.filter((msg) => normalizeConversationId(msg.from, msg.to) !== conversationId)
      );
    }

    console.log(`No pending messages for ${conversationId}`);
    return conn.pc;
  },
};