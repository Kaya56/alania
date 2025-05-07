import DatabaseService from '../db/DatabaseService';

const NotificationService = {
  async saveNotification(email, notification) {
    const db = await DatabaseService.getDb(email);
    const notificationData = {
      id: notification.id,
      eventType: notification.eventType,
      sender: notification.sender,
      targetId: notification.targetId,
      receiverType: notification.receiverType,
      actorId: notification.actorId,
      content: JSON.stringify(notification.content || {}),
      timestamp: notification.timestamp,
      isRead: notification.isRead || 0,
    };
    await db.notifications.put(notificationData);
    return notification;
  },

  async getNotifications(email, options = {}) {
    const db = await DatabaseService.getDb(email);
    const { targetId, receiverType, eventType, unreadOnly } = options;
    let query = db.notifications.orderBy('timestamp').reverse();

    if (targetId && receiverType) {
      query = query.filter((n) => n.targetId === targetId && n.receiverType === receiverType);
    } else if (eventType) {
      query = query.filter((n) => n.eventType === eventType);
    }

    if (unreadOnly) {
      query = query.filter((n) => n.isRead === 0);
    }

    const notifications = await query.toArray();
    return notifications.map((n) => ({
      ...n,
      content: JSON.parse(n.content),
    }));
  },

  async markAsRead(email, notificationId) {
    const db = await DatabaseService.getDb(email);
    const notification = await db.notifications.get(notificationId);
    if (notification) {
      await db.notifications.update(notificationId, { isRead: 1 });
      return { ...notification, isRead: 1 };
    }
    throw new Error('Notification non trouvée');
  },

  async markAllAsRead(email) {
    const db = await DatabaseService.getDb(email);
    await db.notifications.where({ isRead: 0 }).modify({ isRead: 1 });
  },
};

export default NotificationService;