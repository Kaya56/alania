import Modal from './Modal';

function ProfileModal({ isOpen, onClose, entity, entityType, onLogout }) {
  if (!entity) return null;

  const isUser = entityType === 'user';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isUser ? 'Profil' : entityType === 'contact' ? 'Profil du contact' : 'Détails du groupe'}>
      <div className="flex flex-col items-center p-4">
        {/* Image ou icône */}
        <img
          src={entity.profilePicture || 'https://via.placeholder.com/150'}
          alt={entityType === 'group' ? 'Icône du groupe' : 'Photo de profil'}
          className="w-24 h-24 rounded-full mb-4"
        />
        {/* Nom */}
        <h2 className="text-xl font-semibold">{entity.name || 'Sans nom'}</h2>
        {/* Champs spécifiques */}
        {entityType !== 'group' ? (
          <>
            <p className="text-gray-600">{entity.email || 'Email non défini'}</p>
            <p className="text-gray-600 mt-2">{entity.phone || 'Téléphone non défini'}</p>
          </>
        ) : (
          <>
            <p className="text-gray-600">{entity.description || 'Aucune description'}</p>
            <p className="text-gray-600 mt-2">
              Membres : {entity.members?.length || 0}
            </p>
          </>
        )}
        {/* Bouton de déconnexion (uniquement pour l'utilisateur) */}
        {isUser && (
          <button
            onClick={onLogout}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Se déconnecter
          </button>
        )}
      </div>
    </Modal>
  );
}

export default ProfileModal;