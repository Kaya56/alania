import initializeDb from './DexieSetup';
import Dexie from 'dexie';
import UserService from '../users/userService';

const dbCache = new Map();

const DatabaseService = {

  async getDb(email) {
    console.warn('\ngetDb: récupération de la base pour', email);
    if (!dbCache.has(email)) {
      try {
        const db = initializeDb(email);
        if (!db) {
          throw new Error(`Échec de l'initialisation de la base pour ${email}`);
        }
        dbCache.set(email, db);
      } catch (err) {
        console.error(`Erreur lors de la création de la base pour ${email}:`, err);
        throw new Error(`Impossible de créer la base pour ${email}`);
      }
    }
    return dbCache.get(email);
  },

  async initializeExistingDbs() {
    const initializedEmails = [];
    try {
      const databases = await Dexie.getDatabaseNames();
      // console.log('initializeExistingDbs: bases trouvées:', databases);
      for (const dbName of databases) {
        if (dbName.startsWith('MonApp_')) {
          const email = dbName.replace('MonApp_', '');
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            // console.warn(`initializeExistingDbs: Email invalide extrait de ${dbName}, ignoré`);
            continue;
          }
          // Vérifier si l'utilisateur existe
          const user = await UserService.getUserByEmail(email);
          if (!user) {
            // console.warn(`Utilisateur non trouvé pour ${email}, suppression de la base ${dbName}`);
            await Dexie.delete(dbName);
            continue;
          }
          if (!dbCache.has(email)) {
            const db = initializeDb(email);
            try {
              await db.open();
              // Vérifier la version et la structure
              if (db.verno < 2) {
                // console.warn(`Version obsolète (${db.verno}) pour ${dbName}, suppression de la base`);
                await Dexie.delete(dbName);
                continue;
              }
              const sessionsTable = db.tables.find(table => table.name === 'sessions');
              if (!sessionsTable) {
                // console.warn(`Table 'sessions' absente dans ${dbName}, suppression de la base`);
                await Dexie.delete(dbName);
                continue;
              }
              const hasIsActiveIndex = sessionsTable.schema.indexes.some(idx => idx.name === 'isActive');
              if (!hasIsActiveIndex) {
                // console.warn(`Index 'isActive' absent dans ${dbName}, suppression de la base`);
                await Dexie.delete(dbName);
                continue;
              }
              dbCache.set(email, db);
              initializedEmails.push(email);
              // console.log('initializeExistingDbs: base ouverte pour', email);
            } catch (openError) {
              // console.error(`Erreur lors de l'ouverture de ${dbName}:`, openError);
              await Dexie.delete(dbName);
              continue;
            }
          } else {
            initializedEmails.push(email);
          }
        }
      }
      return initializedEmails;
    } catch (err) {
      // console.error('initializeExistingDbs: erreur:', err);
      throw err;
    }
  },

  closeDb(email) {
    const db = dbCache.get(email);
    if (db) {
      try {
        db.close();
        // console.log('closeDb: base fermée pour', email);
      } catch (err) {
        // console.error(`Erreur lors de la fermeture de la base pour ${email}:`, err);
      }
      dbCache.delete(email);
    }
  },

  closeAll() {
    for (const [email, db] of dbCache) {
      try {
        db.close();
        // console.log('closeAll: base fermée pour', email);
      } catch (err) {
        // console.error(`Erreur lors de la fermeture de la base pour ${email}:`, err);
      }
      dbCache.delete(email);
    }
  },

  getAllDbs() {
    // console.log('getAllDbs: bases dans cache:', Array.from(dbCache.keys()));
    return dbCache.values();
  },

  getEmailFromDb(db) {
    if (!(db instanceof Dexie)) {
      // console.error('getEmailFromDb: Paramètre db invalide, doit être une instance Dexie');
      return null;
    }
    const dbName = db.name;
    if (!dbName.startsWith('MonApp_')) {
      // console.warn(`getEmailFromDb: Nom de base invalide: ${dbName}`);
      return null;
    }
    const email = dbName.replace('MonApp_', '');
    return email || null;
  },

  async getAllEmails() {
    try {
      const databases = await Dexie.getDatabaseNames();
      const emails = databases
        .filter((dbName) => dbName.startsWith('MonApp_'))
        .map((dbName) => dbName.replace('MonApp_', ''))
        .filter((email) => email); // Exclure les emails vides
      return [...new Set(emails)]; // Supprimer les doublons
    } catch (err) {
      // console.error('getAllEmails: erreur:', err);
      return [];
    }
  },

};

export default DatabaseService;