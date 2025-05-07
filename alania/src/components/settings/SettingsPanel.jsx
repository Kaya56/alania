// components/SettingsPanel.jsx
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProfileContent from './ProfileContent'; // À créer plus tard
import PlaceholderContent from './PlaceholderContent'; // À créer

function SettingsPanel({
  isOpen,
  onClose,
  selectedOption,
  setSelectedOption,
  currentUser,
  onLogout,
}) {
  const settingsOptions = [
    { label: 'Général', value: 'general' },
    { label: 'Compte', value: 'account' },
    { label: 'Discussions', value: 'discussions' },
    { label: 'Profil', value: 'profile' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-0 left-full ml-4 z-50 w-[700%] h-[80vh] bg-white border border-gray-300 shadow-2xl rounded-lg flex flex-row overflow-hidden"
    >
      {/* Options */}
      <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-200">
        {settingsOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedOption(option.value)}
            className={`w-full text-left py-2 px-4 rounded-md mb-2 transition-colors duration-200 ${
              selectedOption === option.value
                ? 'bg-green-100 text-green-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          aria-label="Fermer le panneau"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        {selectedOption === 'profile' ? (
          <ProfileContent currentUser={currentUser} onLogout={onLogout} />
        ) : (
          <PlaceholderContent label={settingsOptions.find(opt => opt.value === selectedOption)?.label || 'Inconnu'} />
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;