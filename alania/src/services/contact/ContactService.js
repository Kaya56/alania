import axiosAuthInstance from '../api/axiosAuthInstance';
import DatabaseService from '../db/DatabaseService';
import PresenceService from '../presence/PresenceService';
import FileService from '../file/FileService';
import { validateEmail } from '../../utils/validatation/validation';

const ContactService = {
  async getContacts(email) {
    // console.log('ContactService.getContacts: Récupération pour', email);
    try {
      validateEmail(email);
      const db = await DatabaseService.getDb(email);
      // console.log('ContactService.getContacts: Base obtenue', db.name);
      const contacts = await db.contacts.toArray();
      // console.log('ContactService.getContacts: Contacts bruts', contacts);
      return contacts.map((contact) => ({
        ...contact,
        status: 'offline',
        lastMessage: null,
        lastMessageDate: contact.createdAt,
      }));
    } catch (err) {
      // console.error('ContactService.getContacts: Erreur', err.message, err.stack);
      throw err;
    }
  },

  async getContactByEmail(userEmail, contactEmail) {
    // console.log('ContactService.getContactByEmail', { userEmail, contactEmail });
    try {
      validateEmail(userEmail);
      validateEmail(contactEmail);
      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.getContactByEmail: Base obtenue', db.name);
      const contact = await db.contacts.where({ email: contactEmail }).first();
      // console.log('ContactService.getContactByEmail: Contact trouvé', contact);
      return contact;
    } catch (err) {
      // console.error('ContactService.getContactByEmail: Erreur', err.message, err.stack);
      throw err;
    }
  },

  async getContactById(userEmail, contactId) {
    // console.log('ContactService.getContactById', { userEmail, contactId });
    try {
      validateEmail(userEmail);
      if (!contactId || typeof contactId !== 'string') {
        throw new Error('contactId est requis et doit être une chaîne');
      }
      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.getContactById: Base obtenue', db.name);
      const contact = await db.contacts.get(contactId);
      if (contact) {
        // console.log('ContactService.getContactById: Contact trouvé', contact);
        const presence = await PresenceService.getPresence(userEmail, contact.email);
        // console.log('ContactService.getContactById: Présence', presence);
        return {
          ...contact,
          status: presence?.status || 'offline',
          lastSeen: presence?.lastSeen || null,
        };
      }
      // console.log('ContactService.getContactById: Aucun contact trouvé');
      return null;
    } catch (err) {
      console.error('ContactService.getContactById: Erreur', err.message, err.stack);
      throw err;
    }
  },

  async addContact(userEmail, contact, photo) {
    // console.log('ContactService.addContact', { userEmail, contact, hasPhoto: !!photo });
    try {
      validateEmail(userEmail);
      if (!contact || !contact.email) {
        throw new Error('L\'objet contact doit contenir un email');
      }
      validateEmail(contact.email);

      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.addContact: Base obtenue', db.name);

      // Vérifier la table contacts
      const contactsTable = db.tables.find(table => table.name === 'contacts');
      if (!contactsTable) {
        throw new Error('Tableau contacts non trouvé dans la base');
      }

      // Vérifier si le contact existe déjà localement
      const existingContact = await db.contacts.where('email').equals(contact.email).first();
      if (existingContact) {
        console.warn('ContactService.addContact: Contact existant', existingContact);
        throw new Error('Ce contact existe déjà dans votre liste.');
      }

      // Vérifier l'existence de l'utilisateur via l'API
      // console.log('ContactService.addContact: Vérification de l\'existence', contact.email);
      const existsResponse = await axiosAuthInstance.get(`/api/user/exists/${contact.email}`);
      if (!existsResponse.data.success || !existsResponse.data.data.exists) {
        console.error('ContactService.addContact: Utilisateur non trouvé via API');
        throw new Error('Utilisateur non trouvé dans la base de données');
      }

      // Récupérer le nom d'utilisateur
      let username = 'Utilisateur inconnu';
      try {
        // console.log('ContactService.addContact: Récupération du username', contact.email);
        const infoResponse = await axiosAuthInstance.get(`/api/user/info/${contact.email}`);
        if (infoResponse.data.success && infoResponse.data.data?.username) {
          username = infoResponse.data.data.username;
          // console.log('ContactService.addContact: Username récupéré', username);
        }
      } catch (error) {
        console.warn('ContactService.addContact: Erreur récupération username', error.message);
      }

      // Placeholder WebRTC
      // console.log(
      //   'ContactService.addContact: [WebRTC Placeholder] En attente des données : photo=',
      //   photo ? 'présente' : 'aucune'
      // );

      // Sauvegarde de la photo
      let photoPath = null;
      if (photo) {
        // console.log('ContactService.addContact: Sauvegarde de la photo');
        const savedPhoto = await FileService.savePhoto(userEmail, photo);
        photoPath = savedPhoto.path;
        // console.log('ContactService.addContact: Photo sauvegardée', photoPath);
      }

      // Création du contact
      const id = `contact-${Date.now()}`;
      const contactData = {
        id,
        name: username,
        email: contact.email,
        createdAt: Date.now(),
        photoPath,
        isBlocked: 0,
        profilePending: true,
      };
      // console.log('ContactService.addContact: Sauvegarde du contact', contactData);
      await db.contacts.put(contactData);
      // console.log('ContactService.addContact: Contact ajouté avec succès', contactData);
      return contactData;
    } catch (error) {
      console.error('ContactService.addContact: Erreur', error.message, error.stack);
      throw new Error(`Erreur lors de l'ajout du contact : ${error.message}`);
    }
  },

  async searchUserByEmailOrName(userEmail, query) {
    // console.log('ContactService.searchUserByEmailOrName', { userEmail, query });
    try {
      validateEmail(userEmail);
      if (!query || typeof query !== 'string') {
        throw new Error('La requête de recherche est requise et doit être une chaîne');
      }
      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.searchUserByEmailOrName: Base obtenue', db.name);
      const contacts = await db.contacts
        .where('email')
        .startsWithIgnoreCase(query)
        .or('name')
        .startsWithIgnoreCase(query)
        .toArray();
      // console.log('ContactService.searchUserByEmailOrName: Résultats', contacts);
      return contacts.map((c) => ({
        id: c.id,
        username: c.name,
        email: c.email,
        photoUrl: c.photoPath,
      }));
    } catch (err) {
      console.error('ContactService.searchUserByEmailOrName: Erreur', err.message, err.stack);
      throw err;
    }
  },

  async blockContact(userEmail, contactId) {
    // console.log('ContactService.blockContact', { userEmail, contactId });
    try {
      validateEmail(userEmail);
      if (!contactId || typeof contactId !== 'string') {
        throw new Error('contactId est requis et doit être une chaîne');
      }
      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.blockContact: Base obtenue', db.name);
      await db.contacts.update(contactId, { isBlocked: 1 });
      const updatedContact = await db.contacts.get(contactId);
      // console.log('ContactService.blockContact: Contact bloqué', updatedContact);
      return updatedContact;
    } catch (err) {
      console.error('ContactService.blockContact: Erreur', err.message, err.stack);
      throw err;
    }
  },

  async deleteContact(userEmail, contactId) {
    // console.log('ContactService.deleteContact', { userEmail, contactId });
    try {
      validateEmail(userEmail);
      if (!contactId || typeof contactId !== 'string') {
        throw new Error('contactId est requis et doit être une chaîne');
      }
      const db = await DatabaseService.getDb(userEmail);
      // console.log('ContactService.deleteContact: Base obtenue', db.name);
      await db.contacts.delete(contactId);
      // console.log('ContactService.deleteContact: Contact supprimé', contactId);
    } catch (err) {
      console.error('ContactService.deleteContact: Erreur', err.message, err.stack);
      throw err;
    }
  },
};

export default ContactService;