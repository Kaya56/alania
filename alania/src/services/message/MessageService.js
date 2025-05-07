import DatabaseService from '../db/DatabaseService';

const MessageService = {
  async saveMessage(email, { targetId, receiverType, message }) {
    if (!email || !targetId || !["user", "group"].includes(receiverType)) {
      throw new Error(`Paramètres invalides: email=${email}, targetId=${targetId}, receiverType=${receiverType}`);
    }
    // Valider qu'au moins un champ est présent
    const { text, file, voice, call } = message.content || {};
    if (!text && (!file || file.length === 0) && (!voice || voice.length === 0) && !call) {
      throw new Error('Le message doit contenir au moins un texte, fichier, enregistrement vocal ou appel');
    }
    try {
      const db = await DatabaseService.getDb(email);
      const messageData = {
        id: message.id,
        senderId: message.senderId,
        targetId,
        receiverType,
        content: {
          text: text || null,
          file: file || [],
          voice: voice || [],
          call: call || null,
          replyTo: message.content.replyTo || null,
        },
        status: message.status || 'sent',
        sentAt: message.sentAt,
        readAt: message.readAt,
      };
      console.log('MessageService - Saving message pour email:', email, 'targetId:', targetId, 'messageData:', messageData);
      await db.messages.put(messageData);
      console.log('MessageService - Message saved successfully pour email:', email, 'messageId:', message.id);
      return message;
    } catch (err) {
      console.error('MessageService - Erreur saveMessage pour email:', email, 'targetId:', targetId, 'erreur:', err);
      throw err;
    }
  },

  async getMessages(email, { targetId, receiverType }) {
    if (!email || !targetId || !["user", "group"].includes(receiverType)) {
      throw new Error(`Paramètres invalides: email=${email}, targetId=${targetId}, receiverType=${receiverType}`);
    }
    try {
      const db = await DatabaseService.getDb(email);
      let messages = [];
      if (receiverType === 'user') {
        messages = await db.messages
          .where('[targetId+receiverType]')
          .equals([targetId, receiverType])
          .or('senderId')
          .equals(targetId)
          .toArray();
      } else {
        messages = await db.messages
          .where('[targetId+receiverType]')
          .equals([targetId, receiverType])
          .toArray();
      }
      // console.clear();
      console.log("\n\nmessssages: ", messages);
      const notifications = await db.notifications
        .where('[targetId+receiverType+isRead]')
        .equals([targetId, receiverType, 0])
        .toArray();
      const items = [
        ...messages.map((m) => {
          const content = m.content || {};
          // Séparer file et voice en fonction du type MIME
          const file = (content.file || []).filter(f => !f.isVoice);
          const voice = (content.file || []).filter(f => f.isVoice).map(f => ({
            ...f,
            isVoice: true,
          }));
          return {
            ...m,
            IdentificatorType: 'message',
            content: {
              text: content.text || null,
              file,
              voice,
              call: content.call || null,
              replyTo: content.replyTo || null,
            },
          };
        }),
        ...notifications.map((n) => ({
          id: n.id,
          sender: n.sender,
          targetId: n.targetId,
          receiverType: n.receiverType,
          content: n.content || {},
          status: 'delivered',
          sentAt: n.timestamp,
          readAt: null,
          IdentificatorType: 'notification',
        })),
      ];
      console.log("\n\nItemns: ", items);
      return items.sort((a, b) => a.sentAt - b.sentAt);
    } catch (err) {
      console.error('Erreur getMessages:', err);
      throw err;
    }
  },

  async markAsRead(email, messageId, userId) {
    try {
      const db = await DatabaseService.getDb(email);
      await db.message_reads.put({
        messageId,
        userId: userId || email,
        readAt: Date.now(),
      });
      const message = await db.messages.get(messageId);
      if (message && message.receiverType === 'user') {
        await db.messages.update(messageId, {
          status: 'read',
          readAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Erreur markAsRead:', err);
      throw err;
    }
  },

  async getUnreadCount(email, { targetId, receiverType }) {
    if (!email || !targetId || !["user", "group"].includes(receiverType)) {
      throw new Error(`Paramètres invalides: email=${email}, targetId=${targetId}, receiverType=${receiverType}`);
    }
    try {
      const db = await DatabaseService.getDb(email);
      let query = db.messages
        .where('[targetId+receiverType]')
        .equals([targetId, receiverType])
        .filter(m => m.readAt === null);
      if (receiverType === 'user') {
        query = query.filter(m => m.senderId !== email);
      }
      return await query.count();
    } catch (err) {
      console.error('Erreur getUnreadCount:', err);
      throw err;
    }
  },

  async deleteMessage(email, messageId) {
    try {
      const db = await DatabaseService.getDb(email);
      await db.messages.delete(messageId);
      await db.message_reads.where({ messageId }).delete();
    } catch (err) {
      console.error('Erreur deleteMessage:', err);
      throw err;
    }
  },

  async getReadStatus(email, messageId) {
    try {
      const db = await DatabaseService.getDb(email);
      return await db.message_reads.where({ messageId }).toArray();
    } catch (err) {
      console.error('Erreur getReadStatus:', err);
      throw err;
    }
  },
};

export default MessageService;