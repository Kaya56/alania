import { useState, useEffect } from "react";
import NotificationService from "../services/notification/NotificationService";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (userId) {
          // Récupère uniquement les notifications non lues
          const userNotifications = await NotificationService.getNotifications(userId, { unreadOnly: true });
          setNotifications(userNotifications);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      const updatedNotification = await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updatedNotification : n))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification :", error.message);
      alert("Impossible de marquer la notification comme lue.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: Date.now() }))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications :", error.message);
      alert("Impossible de marquer toutes les notifications comme lues.");
    }
  };

  return { notifications, loading, markAsRead, markAllAsRead };
};
