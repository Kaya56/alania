function ProfileContent({ entity }) {
  if (!entity) return <div className="text-gray-600">Aucun utilisateur</div>;

  return (
    <div className="flex flex-col items-center p-6">
      <img
        src={entity.profilePicture || 'https://via.placeholder.com/150'}
        alt="Photo de profil"
        className="w-24 h-24 rounded-full mb-4"
      />
      <h2 className="text-xl font-semibold">{entity.name || 'Sans nom'}</h2>
      <p className="text-gray-600">{entity.email || 'Email non défini'}</p>
      <p className="text-gray-600 mt-2">{entity.phone || 'Téléphone non défini'}</p>
      <button
        onClick={onLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
      >
        Se déconnecter
      </button>
    </div>
  );
}

export default ProfileContent;