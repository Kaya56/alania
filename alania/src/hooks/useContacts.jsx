import { useState, useEffect, useCallback } from 'react';
import ContactService from '../services/contact/contactService';
import { validateEmail } from '../utils/validatation/validation';

export const useContacts = (currentUser) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    // console.log('useContacts.fetchContacts: Début', { userEmail: currentUser?.email });
    try {
      if (!currentUser?.email) {
        // console.warn('useContacts.fetchContacts: Aucun email utilisateur');
        setContacts([]);
        setError('Utilisateur non connecté');
        return;
      }
      validateEmail(currentUser.email);
      // console.log('useContacts.fetchContacts: Récupération pour', currentUser.email);
      const userContacts = await ContactService.getContacts(currentUser.email);
      // console.log('useContacts.fetchContacts: Contacts récupérés', userContacts);
      const enrichedContacts = userContacts.map((contact) => ({
        ...contact,
        lastMessage: null,
        lastMessageDate: null,
        status: 'offline',
        lastSeen: null,
      }));
      // console.log('useContacts.fetchContacts: Contacts enrichis', enrichedContacts);
      setContacts(enrichedContacts);
      setError(null);
    } catch (err) {
      // console.error('useContacts.fetchContacts: Erreur', err.message, err.stack);
      setError('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
      // console.log('useContacts.fetchContacts: Fin', { loading: false });
    }
  }, [currentUser]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contactEmail, name, photo = null) => {
    // console.log('useContacts.addContact', { contactEmail, name, hasPhoto: !!photo });
    if (!currentUser?.email) {
      // console.error('useContacts.addContact: Aucun utilisateur connecté');
      throw new Error('Utilisateur non connecté');
    }
    try {
      validateEmail(currentUser.email);
      validateEmail(contactEmail);
      // console.log('useContacts.addContact: Emails valides', { userEmail: currentUser.email, contactEmail });
      const newContact = await ContactService.addContact(
        currentUser.email,
        { email: contactEmail, name },
        photo
      );
      // console.log('useContacts.addContact: Nouveau contact', newContact);
      setContacts((prev) => [
        {
          ...newContact,
          lastMessage: null,
          lastMessageDate: newContact.createdAt,
          status: 'offline',
          lastSeen: null,
          profilePending: newContact.profilePending,
        },
        ...prev,
      ]);
      return newContact;
    } catch (err) {
      // console.error('useContacts.addContact: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de l'ajout du contact : ${err.message}`);
    }
  };

  const getContactById = useCallback(async (contactId) => {
    // console.log('useContacts.getContactById', { contactId });
    try {
      if (!currentUser?.email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(currentUser.email);
      const contact = await ContactService.getContactById(currentUser.email, contactId);
      // console.log('useContacts.getContactById: Contact récupéré', contact);
      return contact;
    } catch (err) {
      // console.error('useContacts.getContactById: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la récupération du contact : ${err.message}`);
    }
  }, [currentUser]);

  const blockContact = async (contactId) => {
    // console.log('useContacts.blockContact', { contactId });
    try {
      if (!currentUser?.email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(currentUser.email);
      const updatedContact = await ContactService.blockContact(currentUser.email, contactId);
      // console.log('useContacts.blockContact: Contact mis à jour', updatedContact);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, isBlocked: updatedContact.isBlocked } : c))
      );
    } catch (err) {
      // console.error('useContacts.blockContact: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors du blocage du contact : ${err.message}`);
    }
  };

  const deleteContact = async (contactId) => {
    // console.log('useContacts.deleteContact', { contactId });
    try {
      if (!currentUser?.email) {
        throw new Error('Utilisateur non connecté');
      }
      validateEmail(currentUser.email);
      await ContactService.deleteContact(currentUser.email, contactId);
      // console.log('useContacts.deleteContact: Contact supprimé');
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err) {
      // console.error('useContacts.deleteContact: Erreur', err.message, err.stack);
      throw new Error(`Erreur lors de la suppression du contact : ${err.message}`);
    }
  };

  return {
    contacts,
    loading,
    error,
    addContact,
    getContactById,
    blockContact,
    deleteContact,
    refetch: fetchContacts, // Ajout pour corriger l'erreur
  };
};