import SessionService from '../session/SessionService';
import DatabaseService from '../db/DatabaseService';

const storageService = {
  async initUserStorage(email) {
    return await DatabaseService.getDb(email);
  },

  async saveSession(user, sessionData) {
    // console.log('storageService: saveSession pour', user, sessionData);
    return await SessionService.saveSession(user, sessionData);
  },

  async getAnySession() {
    return await SessionService.getActiveSession();
  },

  async getAllSessions() {
    return await SessionService.getAllSessions();
  },

  async getActiveSession() {
    return await SessionService.getActiveSession();
  },

  async deleteSession(email) {
    await SessionService.deleteSession(email);
    DatabaseService.closeDb(email);
  },

  async deactivateSession(email) {
    await SessionService.deactivateSession(email);
  },
};
// 
export default storageService;