// src/pages/contacts/ContactsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContacts } from '../../hooks/useContacts';

const ContactsPage = () => {
  const { currentUser } = useAuth();
  const { contacts, loading, error, addContact } = useContacts(currentUser?.email);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhoto, setNewContactPhoto] = useState(null);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await addContact(newContactEmail, newContactName, newContactPhoto);
      setNewContactEmail('');
      setNewContactName('');
      setNewContactPhoto(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Contacts</h2>
      {currentUser ? (
        <>
          <form onSubmit={handleAddContact} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nom"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              className="border p-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              required
              className="border p-2 flex-grow"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewContactPhoto(e.target.files[0])}
              className="border p-2"
            />
            <button type="submit" className="bg-blue-500 text-white p-2">
              Ajouter
            </button>
          </form>
          {loading && <p>Chargement...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ul className="my-4">
            {contacts.map((contact) => (
              <li key={contact.id} className="py-2 flex items-center">
                {contact.photoPath && (
                  <img
                    src={`file://${contact.photoPath}`}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                {contact.name} ({contact.email})
                {contact.lastMessage && (
                  <span>
                    {' '}
                    - Dernier message: {contact.lastMessage} (
                    {new Date(contact.lastMessageDate).toLocaleString('fr-FR')})
                  </span>
                )}
                <span className="ml-2 text-gray-500">({contact.status})</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Veuillez vous connecter.</p>
      )}
    </div>
  );
};

export default ContactsPage;