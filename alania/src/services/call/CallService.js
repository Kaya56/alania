import DatabaseService from '../db/DatabaseService';
import PresenceService from '../presence/PresenceService';
import GroupService from '../group/GroupService';

const CallService = {
  async getCallsByConversation(email, conversationId) {
    const db = await DatabaseService.getDb(email);
    return db.calls.where({ conversationId }).toArray();
  },

  async getAllCalls(email) {
    const db = await DatabaseService.getDb(email);
    return db.calls.toArray();
  },

  async addCall(email, call) {
    const db = await DatabaseService.getDb(email);
    const id = `call-${Date.now()}`;
    let participants = call.participants;
    if (call.conversationId.startsWith('group-')) {
      const members = await GroupService.getMembers(email, call.conversationId);
      participants = members.map((m) => m.userId);
    }
    const callData = {
      id,
      conversationId: call.conversationId,
      participants: JSON.stringify(participants),
      startedAt: call.startedAt,
      duration: call.duration || 0,
      status: call.status || 'initiated',
    };
    await db.calls.put(callData);
    return { id, ...call, participants };
  },

  async startCall(email, conversationId, participants) {
    const db = await DatabaseService.getDb(email);
    const id = `call-${Date.now()}`;
    const startedAt = Date.now();
    const callData = {
      id,
      conversationId,
      participants: JSON.stringify(participants),
      startedAt,
      status: 'active',
    };
    await db.calls.put(callData);
    return { id, conversationId, participants, startedAt, status: 'active' };
  },

  async endCall(email, callId, duration) {
    const db = await DatabaseService.getDb(email);
    await db.calls.update(callId, { status: 'ended', duration });
  },

  async getCall(email, callId) {
    const db = await DatabaseService.getDb(email);
    const call = await db.calls.get(callId);
    if (call) {
      call.participants = JSON.parse(call.participants);
    }
    return call;
  },

  async removeCall(email, callId) {
    const db = await DatabaseService.getDb(email);
    await db.calls.delete(callId);
  },

  async clearHistory(email) {
    const db = await DatabaseService.getDb(email);
    await db.calls.clear();
  },

  async enrichCall(email, call) {
    const participants = await Promise.all(
      JSON.parse(call.participants).map(async (userId) => {
        const presence = await PresenceService.getPresence(email, userId);
        return { id: userId, username: `Utilisateur ${userId}`, status: presence?.status || 'offline' };
      })
    );
    return { ...call, participants };
  },
};

export default CallService;