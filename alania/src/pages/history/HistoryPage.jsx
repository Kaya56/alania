// src/pages/history/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationService from '../../services/notification/NotificationService';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser) {
      NotificationService.getNotifications(currentUser.email).then(setNotifications);
    }
  }, [currentUser]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Historique</h2>
      {currentUser ? (
        <ul className="my-4">
          {notifications.map((notif) => (
            <li key={notif.id} className="py-2">
              [{new Date(notif.timestamp).toLocaleString('fr-FR')}] {notif.eventType} ({notif.receiverType}): {notif.content.message} 
              (Cible: {notif.targetId}, Par: {notif.actorId || 'Système'})
            </li>
          ))}
        </ul>
      ) : (
        <p>Veuillez vous connecter.</p>
      )}
    </div>
  );
};

export default HistoryPage;