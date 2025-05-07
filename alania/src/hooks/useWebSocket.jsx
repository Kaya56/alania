import { useEffect, useRef, useState } from 'react';

// Hook personnalisé pour gérer la connexion WebSocket
export const useWebSocket = (token, url = 'ws://localhost:8080/ws') => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribersRef = useRef(new Set()); // Pour gérer les abonnements aux messages

  // Initialisation de la connexion WebSocket
  useEffect(() => {
    if (wsRef.current) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('Connecting to WebSocket server...');
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Diffuser le message à tous les abonnés
          subscribersRef.current.forEach((callback) => callback(message));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }

    // Nettoyage lors du démontage
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  // Fonction pour s'abonner aux messages WebSocket
  const subscribe = (callback) => {
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback); // Retourne une fonction pour se désabonner
  };

  // Fonction pour envoyer un message
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        token, // Ajouter le token pour l'authentification
      }));
    } else {
      console.error('WebSocket is not open');
    }
  };

  return { isConnected, sendMessage, subscribe, ws: wsRef.current };
};