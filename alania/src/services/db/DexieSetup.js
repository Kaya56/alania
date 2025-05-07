// DexieSetup.js
import Dexie from 'dexie';
import { validateEmail } from '../../utils/validatation/validation'; // Ajustez le chemin selon votre structure

const initializeDb = (email) => {
  // console.log('initializeDb: Début de l\'initialisation pour', email);

  // Valider l'email
  try {
    validateEmail(email);
  } catch (err) {
    // console.error('initializeDb: Échec de la validation de l\'email', err.message);
    throw err;
  }

  const dbName = `MonApp_${email}`;
  // console.log('initializeDb: Création de la base', dbName);
  // console.warn("Dexie: initializeDb", dbName);
  const db = new Dexie(dbName);

  // Version 1 : Schéma initial
  db.version(1).stores({
    users: 'userId,email,username,name,phone,photoId,password,createdAt',
    sessions: 'userId,accessToken,refreshToken,isActive,lastActiveAt',
    contacts: 'id,name,email,createdAt,photoPath,isBlocked',
    messages: 'id,senderId,targetId,receiverType,content,status,sentAt,readAt,[targetId+receiverType],[targetId+receiverType+readAt]',
    groups: 'id,name,description,photoPath,createdAt',
    group_members: '[groupId+userId],groupId,userId,joinedAt',
    calls: 'id,conversationId,participants,startedAt,duration,status',
    statuses: 'id,userId,content,visibility,groupId,createdAt',
    notifications: 'id,eventType,sender,targetId,receiverType,actorId,content,timestamp,isRead,[targetId+receiverType+isRead]',
    message_reads: '[messageId+userId],messageId,userId,readAt',
    files: 'id,messageId,statusId,path,type,size,createdAt',
    presences: 'userId,status,lastSeen',
  });

  // Version 2 : Migration pour corriger les sessions
  db.version(2).stores({
    sessions: 'userId,accessToken,refreshToken,isActive,lastActiveAt', // Même schéma
  }).upgrade(async (trans) => {
    // console.log('initializeDb: Exécution de la migration pour', dbName);
    const sessions = await trans.table('sessions').toArray();
    // console.log('initializeDb: Sessions existantes', sessions);
    for (const session of sessions) {
      if (typeof session.isActive !== 'boolean') {
        // console.warn(`initializeDb: Session corrompue trouvée pour userId ${session.userId}, correction`);
        await trans.table('sessions').update(session.userId, { isActive: false });
      }
    }
    // console.log('initializeDb: Migration terminée pour', dbName);
  });

  // console.log('initializeDb: Base initialisée avec succès', dbName);
  return db;
};

export default initializeDb;