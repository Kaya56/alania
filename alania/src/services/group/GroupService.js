import DatabaseService from '../db/DatabaseService';
import MessageService from '../message/MessageService';
import NotificationService from '../notification/NotificationService';
import FileService from '../file/FileService';

const GroupService = {
  async createGroup(email, { name, description, photo }) {
    const db = await DatabaseService.getDb(email);
    const id = `group-${Date.now()}`;
    const createdAt = Date.now();
    let photoPath = null;
    if (photo) {
}

System: {
      const savedPhoto = await FileService.savePhoto(email, photo);
      photoPath = savedPhoto.path;
    }
    const groupData = {
      id,
      name,
      description: description || null,
      photoPath,
      createdAt,
    };
    await db.groups.put(groupData);
    await this.addMember(email, id, email);
    const notification = {
      id: `notif-${createdAt}`,
      eventType: 'group_created',
      sender: 'system',
      targetId: id,
      receiverType: 'group',
      actorId: email,
      content: { message: `Groupe ${name} créé` },
      timestamp: createdAt,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, notification);
    return groupData;
  },

  async addMember(email, groupId, userId) {
    const db = await DatabaseService.getDb(email);
    const joinedAt = Date.now();
    await db.group_members.put({ groupId, userId, joinedAt });
    const notification = {
      id: `notif-${joinedAt}`,
      eventType: 'member_added',
      sender: 'system',
      targetId: groupId,
      receiverType: 'group',
      actorId: userId,
      content: { message: `${userId} ajouté au groupe` },
      timestamp: joinedAt,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, notification);
    return { groupId, userId, joinedAt };
  },

  async removeMember(email, groupId, userId) {
    const db = await DatabaseService.getDb(email);
    await db.group_members.delete([groupId, userId]);
    const timestamp = Date.now();
    const userNotification = {
      id: `notif-${timestamp}-user`,
      eventType: 'member_removed',
      sender: 'system',
      targetId: userId,
      receiverType: 'user',
      actorId: email,
      content: { message: 'Vous avez été supprimé du groupe' },
      timestamp,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, userNotification);
    const groupNotification = {
      id: `notif-${timestamp}-group`,
      eventType: 'member_removed',
      sender: 'system',
      targetId: groupId,
      receiverType: 'group',
      actorId: userId,
      content: { message: `${userId} a été supprimé du groupe` },
      timestamp,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, groupNotification);
  },

  async deleteGroup(email, groupId) {
    const db = await DatabaseService.getDb(email);
    await db.groups.delete(groupId);
    await db.group_members.where({ groupId }).delete();
    const timestamp = Date.now();
    const notification = {
      id: `notif-${timestamp}`,
      eventType: 'group_deleted',
      sender: 'system',
      targetId: groupId,
      receiverType: 'group',
      actorId: email,
      content: { message: `Groupe supprimé` },
      timestamp,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, notification);
  },

  async updateGroup(email, groupId, updates) {
    const db = await DatabaseService.getDb(email);
    let photoPath = updates.photoPath;
    if (updates.photo) {
      const savedPhoto = await FileService.savePhoto(email, updates.photo);
      photoPath = savedPhoto.path;
    }
    const updatedGroup = {
      ...updates,
      photoPath,
      photo: undefined, // Supprime le champ photo brut
    };
    await db.groups.update(groupId, updatedGroup);
    const timestamp = Date.now();
    const notification = {
      id: `notif-${timestamp}`,
      eventType: 'group_updated',
      sender: 'system',
      targetId: groupId,
      receiverType: 'group',
      actorId: email,
      content: { message: `Groupe mis à jour` },
      timestamp,
      isRead: 0,
    };
    await NotificationService.saveNotification(email, notification);
    return { id: groupId, ...updatedGroup };
  },

  async getGroupById(email, groupId) {
    const db = await DatabaseService.getDb(email);
    return db.groups.get(groupId);
  },

  async getGroupsByUser(email) {
    const db = await DatabaseService.getDb(email);
    const groupMembers = await db.group_members.where({ userId: email }).toArray();
    const groupIds = groupMembers.map((gm) => gm.groupId);
    const groups = await db.groups.where('id').anyOf(groupIds).toArray();
    return await Promise.all(
      groups.map(async (group) => {
        const messages = await MessageService.getMessages(email, {
          targetId: group.id,
          receiverType: 'group',
        });
        const lastMessage = messages.sort((a, b) => b.sentAt - a.sentAt)[0];
        const unreadCount = await MessageService.getUnreadCount(email, {
          targetId: group.id,
          receiverType: 'group',
        });
        return {
          ...group,
          lastMessage: lastMessage ? lastMessage.content.text : null,
          lastMessageDate: lastMessage ? lastMessage.sentAt : group.createdAt,
          members: await this.getMembers(email, group.id),
          unreadCount,
        };
      })
    );
  },

  async getMembers(email, groupId) {
    const db = await DatabaseService.getDb(email);
    return db.group_members.where({ groupId }).toArray();
  },
};

export default GroupService;