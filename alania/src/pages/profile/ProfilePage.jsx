import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/user/UserService'; // Ajout de UserService

function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Pour gérer le mot de passe
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const navigate = useNavigate();

  // Charger le username initial depuis currentUser
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleSaveUsername = async () => {
    if (username.trim()) {
      try {
        // Sauvegarde locale
        await UserService.updateUser(currentUser.email, { username });
  
        // Sauvegarde sur le backend
        await axios.put(
          '/api/users/profile',
          { username },
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
  
        console.log('Username sauvegardé:', username);
        setIsEditingUsername(false);
        await updateCurrentUser();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du username:', error);
        alert('Erreur lors de la sauvegarde du nom d’utilisateur');
      }
    }
  };

  const handleSavePassword = async () => {
    try {
      await UserService.updateUser(currentUser.email, {
        password: password.trim() || null, // Supprimer le mot de passe si vide
      });
      console.log('Mot de passe sauvegardé');
      setIsEditingPassword(false);
      setPassword('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mot de passe:', error);
      alert('Erreur lors de la sauvegarde du mot de passe');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <div>Chargement...</div>; // Ou rediriger vers /login
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil</h1>

        {/* Informations utilisateur */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{currentUser.email}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
          {isEditingUsername ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez votre nom d’utilisateur"
              />
              <button
                onClick={handleSaveUsername}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">
                {username || 'Non défini'}
              </p>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="text-blue-500 hover:underline"
              >
                Modifier
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          {isEditingPassword ? (
            <div className="flex space-x-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez un nouveau mot de passe (ou laissez vide pour supprimer)"
              />
              <button
                onClick={handleSavePassword}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">
                {currentUser.password ? 'Défini' : 'Non défini'}
              </p>
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-blue-500 hover:underline"
              >
                Modifier
              </button>
            </div>
          )}
        </div>

        {/* Boutons d’action */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Retour au chat
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;