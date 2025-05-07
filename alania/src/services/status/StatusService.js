import DatabaseService from '../db/DatabaseService';
import FileService from '../file/FileService';
import GroupService from '../group/GroupService';
import NotificationService from '../notification/NotificationService';

const StatusService = {
  async createStatus(userId, content, visibility = 'contacts', groupId = null, file = null) {
    try {
      const db = await DatabaseService.getDb(userId);
      const id = `status-${Date.now()}`;
      const createdAt = Date.now();

      if (!['public', 'contacts', 'group'].includes(visibility)) {
        throw new Error('Visibilité invalide');
      }
      if (visibility === 'group' && !groupId) {
        throw new Error("groupId requis pour visibility='group'");
      }
      if (visibility === 'group') {
        const group = await GroupService.getGroupById(userId, groupId);
        if (!group) throw new Error('Groupe non trouvé');
      }

      let finalContent = content;
      if (file) {
        const savedFile = await FileService.saveFile(userId, file, null, id);
        finalContent = { ...content, file: savedFile.id };
      }

      const status = {
        id,
        userId,
        content: JSON.stringify(finalContent),
        visibility,
        groupId: visibility === 'group' ? groupId : null,
        createdAt,
        expiresAt: createdAt + 24 * 60 * 60 * 1000,
      };

      await db.statuses.put(status);

      if (visibility === 'contacts') {
        const contacts = await db.contacts.toArray();
        for (const contact of contacts) {
          await NotificationService.saveNotification(userId, {
            id: `notif-${Date.now()}`,
            eventType: 'status',
            sender: userId,
            targetId: contact.id,
            receiverType: 'user',
            actorId: userId,
            content: { message: `Nouveau statut posté` },
            timestamp: Date.now(),
            isRead: 0,
          });
        }
      } else if (visibility === 'group') {
        const members = await db.group_members.where({ groupId }).toArray();
        for (const member of members) {
          if (member.userId !== userId) {
            await NotificationService.saveNotification(userId, {
              id: `notif-${Date.now()}`,
              eventType: 'status',
              sender: userId,
              targetId: member.userId,
              receiverType: 'user',
              actorId: userId,
              content: { message: `Statut posté dans le groupe` },
              timestamp: Date.now(),
              isRead: 0,
            });
          }
        }
      }

      return status;
    } catch (error) {
      throw new Error(`Erreur lors de la création du statut : ${error.message}`);
    }
  },

  async getVisibleStatuses(userId) {
    try {
      const db = await DatabaseService.getDb(userId);
      const allStatuses = await db.statuses.where('expiresAt').above(Date.now()).toArray();
      const contacts = await db.contacts.toArray();
      const contactIds = contacts.map((c) => c.id);
      const groups = await db.group_members.where({ userId }).toArray();
      const groupIds = groups.map((g) => g.groupId);

      const visibleStatuses = allStatuses.filter(
        (status) =>
          status.visibility === 'public' ||
          (status.visibility === 'contacts' && contactIds.includes(status.userId)) ||
          (status.visibility === 'group' && groupIds.includes(status.groupId))
      );

      return visibleStatuses.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statuts visibles : ${error.message}`);
    }
  },
};

export default StatusService;