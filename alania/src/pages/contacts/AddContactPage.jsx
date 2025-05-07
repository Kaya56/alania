// src/pages/contacts/AddContactPage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContacts } from '../../hooks/useContacts';
import ContactService from '../../services/contact/ContactService';
import SearchBar from '../../components/searchBar/SearchBar';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';

function AddContactPage() {
  const { currentUser } = useAuth();
  const { addContact } = useContacts(currentUser?.email);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Entrez un email ou nom d'utilisateur");
      return;
    }
    try {
      const users = await ContactService.searchUserByEmailOrName(currentUser.email, searchQuery);
      if (users.length === 0) {
        setSearchResults([]);
        setError('Aucun utilisateur trouvé');
      } else if (users.some((u) => u.email === currentUser.email)) {
        setSearchResults([]);
        setError('Vous ne pouvez pas vous ajouter vous-même');
      } else {
        setSearchResults(users);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de la recherche');
    }
  };

  const handleAddContact = async (user) => {
    try {
      await addContact(user.email, user.name);
      navigate('/contacts');
    } catch (err) {
      setError("Erreur lors de l'ajout du contact");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour ajouter un contact</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un contact</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Email ou nom d'utilisateur
            </label>
            <div className="flex">
              <SearchBar
                onSearch={setSearchQuery}
                value={searchQuery}
                placeholder={"Entrez un email ou nom d'utilisateur"}
              />
              <button
                onClick={handleSearch}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Rechercher
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <ul className="space-y-2">
              {searchResults.map((user) => (
                <li
                  key={user.email}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {user.photoPath ? (
                      <img
                        src={`file://${user.photoPath}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover mr-2"
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-800">{user.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddContact(user)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Ajouter
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => navigate('/contacts')}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddContactPage;