import DatabaseService from '../db/DatabaseService';
import UserService from '../users/UserService';

const PresenceService = {
  /**
   * Met à jour la présence d’un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} status - Statut de présence (online, offline, etc.)
   * @returns {Object} - Données de présence mises à jour
   */
  async updatePresence(email, status) {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const db = await DatabaseService.getDb(email);
    const userId = user.userId;
    const lastSeen = Date.now();
    await db.presences.put({ userId, status, lastSeen });
    return { userId, status, lastSeen };
  },

  /**
   * Récupère la présence d’un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} - Données de présence ou état par défaut
   */
  async getPresence(email) {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const db = await DatabaseService.getDb(email);
    const presence = await db.presences.get(user.userId);
    return presence || { userId: user.userId, status: 'offline', lastSeen: null };
  },
};

export default PresenceService;