const listeners = new Map();

export const eventService = {
  on(eventName, callback) {
    if (typeof eventName !== 'string' || !eventName) {
      console.error('eventService - Erreur: eventName doit être une chaîne non vide');
      return () => {};
    }
    if (typeof callback !== 'function') {
      console.error('eventService - Erreur: callback doit être une fonction');
      return () => {};
    }
    if (!listeners.has(eventName)) {
      listeners.set(eventName, []);
    }
    listeners.get(eventName).push(callback);
    console.log('eventService - Subscribed to:', { eventName, listenerCount: listeners.get(eventName).length });
    return () => {
      const updatedListeners = listeners.get(eventName).filter((cb) => cb !== callback);
      if (updatedListeners.length === 0) {
        listeners.delete(eventName);
        console.log('eventService - Unsubscribed from:', { eventName, listenerCount: 0 });
      } else {
        listeners.set(eventName, updatedListeners);
        console.log('eventService - Unsubscribed from:', { eventName, listenerCount: updatedListeners.length });
      }
    };
  },

  off(eventName, callback) {
    if (typeof eventName !== 'string' || !eventName) {
      console.error('eventService - Erreur: eventName doit être une chaîne non vide');
      return;
    }
    if (typeof callback !== 'function') {
      console.error('eventService - Erreur: callback doit être une fonction');
      return;
    }
    if (listeners.has(eventName)) {
      const updatedListeners = listeners.get(eventName).filter((cb) => cb !== callback);
      if (updatedListeners.length === 0) {
        listeners.delete(eventName);
        console.log('eventService - Unsubscribed from:', { eventName, listenerCount: 0 });
      } else {
        listeners.set(eventName, updatedListeners);
        console.log('eventService - Unsubscribed from:', { eventName, listenerCount: updatedListeners.length });
      }
    }
  },

  emit(eventName, data) {
    const callbacks = listeners.get(eventName) || [];
    console.log('eventService - Emitting event:', { 
      eventName, 
      listenerCount: callbacks.length, 
      dataId: data && typeof data === 'object' && 'id' in data ? data.id : 'N/A' 
    });
    callbacks.forEach((cb) => {
      try {
        console.log('eventService - Appel du callback pour:', { 
          eventName, 
          dataId: data && typeof data === 'object' && 'id' in data ? data.id : 'N/A' 
        });
        cb(data);
      } catch (error) {
        console.error('eventService - Erreur lors de l’exécution du callback:', { eventName, error });
      }
    });
  },

  // Méthodes legacy pour compatibilité
  subscribe(conversationId, callback) {
    return this.on(conversationId, callback);
  }
};