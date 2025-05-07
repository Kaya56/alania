import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useContacts } from '../../../../hooks/useContacts';
import SearchBar from '../../../bar/searchBar/SearchBar';
import { createPortal } from 'react-dom';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

function AddContact({ isOpen, onClose, onDataChanged, showCloseButton = true }) {
  const { currentUser, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  // Ne pas appeler useContacts si currentUser n'est pas défini
  const { addContact } = currentUser ? useContacts(currentUser) : { addContact: null };

  const handleAddContact = async () => {
    if (!currentUser) {
      setError('Utilisateur non connecté');
      return;
    }
    if (!email.trim()) {
      setError('Veuillez entrer un email');
      return;
    }
    if (email === currentUser.email) {
      setError('Vous ne pouvez pas vous ajouter vous-même');
      return;
    }
    try {
      console.log(`Ajout du contact ${email}`);
      await addContact(email, null); // Le nom est géré par ContactService
      console.log(`Contact ${email} ajouté avec succès`);
      setEmail(''); // Réinitialiser le champ de saisie
      onDataChanged("contacts"); // Notifier le changement
      console.log(`[WebRTC Placeholder] Contact ${email} ajouté, synchronisation des données effectuée`);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l’ajout du contact');
    }
  };

  // Gérer la touche Échap pour fermer la modale
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || isLoading) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white rounded-xl p-4 sm:p-6 w-[90vw] max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture stylisé (affiché uniquement sur écrans moyens et plus) */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="hidden sm:flex absolute top-3 right-3 items-center justify-center bg-white/70 hover:bg-white rounded-full p-2 shadow-md text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}

        {/* Titre avec icône */}
        <div className="flex items-center gap-2 mb-4">
          <UserPlusIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Ajouter un contact
          </h2>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Champ de saisie et bouton */}
        <div className="mb-4">
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="email-input"
          >
            Email du contact
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchBar
              onSearch={setEmail}
              value={email}
              placeholder="example@gmail.com"
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              id="email-input"
            />
            <button
              onClick={handleAddContact}
              disabled={!email.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm sm:w-auto w-full transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Bouton Annuler */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 text-sm transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>,
    document.body
  );
}

export default AddContact;