// src/pages/group/CreateGroupPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../hooks/useGroups';
import ContactService from '../../services/contact/ContactService';
import { useNavigate } from 'react-router-dom';

function CreateGroupPage() {
  const { currentUser } = useAuth();
  const { createGroup, addMember } = useGroups(currentUser?.email);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const userContacts = await ContactService.getContacts(currentUser.email);
        setContacts(userContacts);
      } catch (err) {
        setError('Erreur lors du chargement des contacts');
      }
    };
    if (currentUser) fetchContacts();
  }, [currentUser]);

  const handleMemberToggle = (email) => {
    setSelectedMembers((prev) =>
      prev.includes(email) ? prev.filter((id) => id !== email) : [...prev, email]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }
    try {
      const group = await createGroup(name, description, photo);
      for (const memberEmail of selectedMembers) {
        await addMember(group.id, memberEmail);
      }
      navigate('/groups');
    } catch (err) {
      setError('Erreur lors de la création du groupe');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Connectez-vous pour créer un groupe</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Créer un groupe</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Nom du groupe</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Nom du groupe"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Description (optionnel)"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Photo du groupe</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Ajouter des membres</label>
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.email} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.email)}
                    onChange={() => handleMemberToggle(contact.email)}
                    className="mr-2"
                  />
                  <span className="text-gray-800">{contact.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupPage;