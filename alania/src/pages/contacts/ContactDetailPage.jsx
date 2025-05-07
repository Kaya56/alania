// src/pages/contacts/ContactDetailPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import ContactService from '../../services/contact/ContactService';
import PresenceService from '../../services/presence/PresenceService';
import ChatArea from '../../components/interactionFeed/common/chatArea/ChatArea';
import { UserIcon } from '@heroicons/react/24/outline';

function ContactDetailPage() {
  const { currentUser } = useAuth();
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [presence, setPresence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contactData = await ContactService.getContactById(currentUser.email, contactId);
        if (!contactData) {
          throw new Error('Contact non trouvé');
        }
        const presenceData = await PresenceService.getPresence(currentUser.email, contactData.email);
        setContact(contactData);
        setPresence(presenceData);
      } catch (err) {
        setError('Erreur lors du chargement du contact');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchContact();
  }, [currentUser, contactId]);

  const handleBlockContact = async () => {
    try {
      await ContactService.blockContact(currentUser.email, contactId);
      setContact((prev) => ({ ...prev, isBlocked: 1 }));
      navigate('/contacts');
    } catch (err) {
      setError('Erreur lors du blocage du contact');
    }
  };

  const handleRemoveContact = async () => {
    try {
      await ContactService.deleteContact(currentUser.email, contactId);
      navigate('/contacts');
    } catch (err) {
      setError('Erreur lors de la suppression du contact');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour voir le contact</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Contact non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/contacts')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Discussion avec {contact.name}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails</h2>
          <div className="flex items-center">
            {contact.photoPath ? (
              <img
                src={`file://${contact.photoPath}`}
                alt={contact.name}
                className="w-14 h-14 rounded-full object-cover shadow-sm mr-3"
              />
            ) : (
              <UserIcon className="w-14 h-14 text-gray-400 mr-3" />
            )}
            <div>
              <p className="text-gray-800 font-semibold">{contact.name}</p>
              <p className="text-gray-600">Statut : {presence?.status || 'offline'}</p>
            </div>
          </div>
          {contact.isBlocked ? (
            <p className="text-red-600 mt-2">Ce contact est bloqué</p>
          ) : (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleBlockContact}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Bloquer
              </button>
              <button
                onClick={handleRemoveContact}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {!contact.isBlocked && (
          <ChatArea targetId={contact.email} receiverType="user" />
        )}
      </div>
    </div>
  );
}

export default ContactDetailPage;