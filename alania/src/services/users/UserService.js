import DatabaseService from '../db/DatabaseService';
import ProfileService from '../profile/ProfileService';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des userId uniques
import Dexie from 'dexie';

const UserService = {

  async initUser(userData) {
    console.log('\n\n\n\ninitUser', userData);
    const { email, username, name, phone } = userData;
    if (!email) {
      
      // console.error('initUser: email manquant');
      throw new Error('Email requis');
      
    }
    console.log('initUser: email', email);
    // Vérifier si l'email existe déjà dans une autre base
    const dbName = `MonApp_${email}`;
    if (await Dexie.exists(dbName)) {
      const db = await DatabaseService.getDb(email);
      const existingUser = await db.users.where('email').equals(email).first();
      if (existingUser) {
        throw new Error('Cet email est déjà associé à un utilisateur');
      }
    }

    console.log('initUser: création de la base pour', email);
    const db = await DatabaseService.getDb(email);
    const userId = uuidv4(); // Générer un ID unique
    const createdAt = Date.now();

    const user = {
      userId,
      email,
      username,
      name: name || '',
      phone: phone || '',
      photoId: null, // Référence à la photo dans la table files
      createdAt,
    };

    console.log('initUser: utilisateur créé', user);
    await db.users.put(user);
    console.log('initUser: utilisateur sauvegardé dans la base', user);
    localStorage.setItem('lastEmail', email); // Stocker le dernier email
    console.log('initUser: dernier email sauvegardé', email);
    return user;
  },

  async checkEmailExists(email) {
    const databases = await Dexie.getDatabaseNames();
    for (const dbName of databases) {
      if (dbName.startsWith('MonApp_')) {
        const dbEmail = dbName.replace('MonApp_', '');
        const db = await DatabaseService.getDb(dbEmail);
        const existingUser = await db.users.where('email').equals(email).first();
        if (existingUser) return true;
      }
    }
    return false;
  },

  async getUserById(userId) {
    const databases = await Dexie.getDatabaseNames();
    for (const dbName of databases) {
      if (dbName.startsWith('MonApp_')) {
        const email = dbName.replace('MonApp_', '');
        const db = await DatabaseService.getDb(email);
        const user = await db.users.where('userId').equals(userId).first();
        if (user) return user;
      }
    }
    // console.error('getUserById: utilisateur non trouvé', userId);
    return null;
  },  

  async getUserByEmail(email) {
    console.log('UserService: getUserByEmail pour', email);
    console.log('getUserByEmail: récupération de l\'utilisateur pour', email);
    // await checkEmailExists(email);
    console.log('getUserByEmail: email trouvé', email);
    const db = await DatabaseService.getDb(email);
    console.log('getUserByEmail: base de données trouvée', db);
    const user = await db.users.where('email').equals(email).first();
    console.log("test", await db.users.toArray());
    console.log('getUserByEmail: utilisateur trouvé', user);
    return user || null;
  },

  async updateUser(email, updates) {
    const db = await DatabaseService.getDb(email);
    const user = await db.users.where('email').equals(email).first();
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const updatedUser = {
      ...user,
      username: updates.username || user.username,
      name: updates.name || user.name,
      phone: updates.phone || user.phone,
      photoId: updates.photoId || user.photoId,
      password: updates.password || user.password,
      email: updates.email || user.email,
    };

    await db.users.put(updatedUser);
    return updatedUser;
  },

  async setProfilePhoto(email, fileData) {
    const db = await DatabaseService.getDb(email);
    const user = await db.users.where('email').equals(email).first();
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const photoId = await ProfileService.savePhotoProfil(email, fileData);
    await db.users.update(user.userId, { photoId });
    return { ...user, photoId };
  },

  async getProfilePhoto(email) {
    const db = await DatabaseService.getDb(email);
    const user = await db.users.where('email').equals(email).first();
    if (!user || !user.photoId) {
      return null;
    }
    return await ProfileService.getPhotoProfil(email);
  },

  async deleteUser(email) {
    const db = await DatabaseService.getDb(email);
    const user = await db.users.where('email').equals(email).first();
    if (user) {
      await db.users.delete(user.userId);
    }
    localStorage.removeItem('lastEmail');
    DatabaseService.closeDb(email);
  },

  async listUsers() {
    const databases = await Dexie.getDatabaseNames();
    const users = [];
    for (const dbName of databases) {
      if (dbName.startsWith('MonApp_')) {
        const email = dbName.replace('MonApp_', '');
        const db = await DatabaseService.getDb(email);
        const dbUsers = await db.users.toArray();
        users.push(...dbUsers);
      }
    }
    return users;
  },
};

export default UserService;