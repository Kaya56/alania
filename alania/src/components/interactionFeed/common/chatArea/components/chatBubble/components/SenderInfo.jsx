import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const SenderInfo = ({ name, photoUrl }) => (
  <div className="flex items-center mb-1">
    {photoUrl ? (
      <img
        src={photoUrl}
        alt={name}
        className="w-6 h-6 rounded-full mr-2"
        onError={(e) => {
          e.target.onerror = null; // Empêche une boucle en cas d'échec
          e.target.src = '/path/to/default-avatar.png'; // Chemin vers une image par défaut
        }}
      />
    ) : (
      <UserIcon className="w-6 h-6 text-gray-600 mr-2" aria-label="Utilisateur sans photo" />
    )}
    <span className="text-sm font-semibold text-gray-700">{name}</span>
  </div>
);

export default SenderInfo;
