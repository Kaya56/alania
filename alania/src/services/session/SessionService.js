import DatabaseService from '../db/DatabaseService';
import UserService from '../users/userService';

const SessionService = {

  async saveSession(user, sessionData) {
    // console.warn('SessionService: saveSession pour', user, sessionData);
    const email = user?.email;
    // console.log('SessionService: Début de saveSession pour', { email, sessionData });
  
    try {
      // Vérification initiale de l'utilisateur
      if (!user) {
        // console.error('SessionService: Aucun utilisateur fourni');
        throw new Error('Utilisateur non trouvé');
      }
      // console.log('SessionService: Utilisateur valide', { email, userId: user.userId });
  
      const { password, accessToken, refreshToken, isActive } = sessionData;
      // console.log('SessionService: Données de session reçues', { password: !!password, accessToken, refreshToken, isActive });
  
      // Vérifier le mot de passe si fourni et si l'utilisateur en a un
      if (password && user.password) {
        // console.log('SessionService: Vérification du mot de passe pour', email);
        const isValid = await UserService.verifyPassword(email, password);
        if (!isValid) {
          // console.error('SessionService: Mot de passe incorrect pour', email);
          throw new Error('Mot de passe incorrect');
        }
        // console.log('SessionService: Mot de passe vérifié avec succès');
      } else if (password && !user.password) {
        // console.error('SessionService: Tentative de fournir un mot de passe, mais aucun mot de passe défini pour', email);
        throw new Error('Aucun mot de passe défini pour cet utilisateur');
      } else {
        // console.log('SessionService: Aucun mot de passe fourni ou requis, poursuite');
      }
  
      // Récupération de la base de données
      // console.log('SessionService: Récupération de la base pour', email);
      const db = await DatabaseService.getDb(email);
      // console.log('SessionService: Base de données obtenue', { dbName: db.name });
  
      // Suppression des sessions existantes pour cet utilisateur
      // console.log('SessionService: Suppression des sessions existantes pour userId', user.userId);
      const deletedCount = await db.sessions.where('userId').equals(user.userId).delete();
      // console.log('SessionService: Nombre de sessions supprimées', deletedCount);
  
      // Création de la nouvelle session
      const session = {
        userId: user.userId,
        accessToken,
        refreshToken,
        isActive: isActive !== undefined ? isActive : true,
        lastActiveAt: new Date().toISOString(),
      };
      // console.log('SessionService: Nouvelle session à sauvegarder', session);
  
      // Sauvegarde de la session
      // console.log('SessionService: Sauvegarde de la session dans la base');
      await db.sessions.put(session);
      // console.log('SessionService: Session sauvegardée avec succès', session);
  
      return session;
    } catch (error) {
      // console.error('SessionService: Erreur dans saveSession pour', email, error.message, error.stack);
      throw error;
    }
  },

  async getSession(email) {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return null;
      }
      const db = await DatabaseService.getDb(email);
      const session = await db.sessions.get(user.userId);
      return session || null;
    } catch (error) {
      // console.error('getSession: erreur:', error);
      return null;
    }
  },

  async getActiveSession() {
    try {
      const allDbs = Array.from(DatabaseService.getAllDbs());
      // console.log('allDbs:', allDbs.map(db => db.name));
      let latestSession = null;
  
      for (const db of allDbs) {
        // console.log('Inspecte base:', db.name);
        try {
          // Assurez-vous que la base est ouverte
          await db.open();
  
          // Vérifiez que la table sessions existe
          if (!db.tables.find(table => table.name === 'sessions')) {
            // console.warn('Table sessions non trouvée dans', db.name);
            continue;
          }
  
          // Vérifiez les données existantes pour éviter les erreurs
          const allSessions = await db.sessions.toArray();
          // console.log('Sessions dans', db.name, ':', allSessions);
          for (const session of allSessions) {
            // console.warn('Vérification de la session:', session);
            if (typeof session.isActive !== 'boolean') {
              // console.warn('Session avec isActive non booléen trouvée:', session);
              await db.sessions.delete(session.userId); // Supprime les sessions corrompues
              continue;
            }
          }
  
          // Essayez d'utiliser l'index
          let session;
          try {
            session = await db.sessions.where('isActive').equals(true).first();
          } catch (indexError) {
            // console.warn('Erreur avec l\'index isActive, tentative de filtrage manuel:', indexError);
            // Fallback : filtrer manuellement
            session = allSessions.find(s => s.isActive === true);
            // console.warn('Session active trouvée manuellement:', session);
          }
  
          // console.log('Session active trouvée dans', db.name, ':', session);
          if (session && (!latestSession || session.lastActiveAt > latestSession.lastActiveAt)) {
            // console.log('Mise à jour de la session active la plus récente:', session);
            latestSession = session;
            // console.log('Session active la plus récente mise à jour:', latestSession);
          }
        } catch (error) {
          // console.error('Erreur sur la base', db.name, ':', error);
        }
      }
  
      return latestSession;
    } catch (error) {
      // console.error('getActiveSession: erreur:', error);
      return null;
    }
  },

  async getAllSessions() {
    try {
      const allDbs = Array.from(DatabaseService.getAllDbs());
      const sessions = [];
      for (const db of allDbs) {
        const email = DatabaseService.getEmailFromDb(db);
        if (email) {
          const dbSessions = await db.sessions.toArray();
          sessions.push(...dbSessions.map((session) => ({ ...session, email })));
        }
      }
      return sessions.sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt));
    } catch (error) {
      // console.error('getAllSessions: erreur:', error);
      return [];
    }
  },

  async deleteSession(email) {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return;
      }
      const db = await DatabaseService.getDb(email);
      await db.sessions.delete(user.userId);
    } catch (error) {
      // console.error('deleteSession: erreur:', error);
    }
  },

  async deactivateSession(email) {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return;
      }
      const db = await DatabaseService.getDb(email);
      await db.sessions.update(user.userId, { isActive: false });
    } catch (error) {
      // console.error('deactivateSession: erreur:', error);
    }
  },
};

export default SessionService;