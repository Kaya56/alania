import React, { useState } from 'react';
import AudioParticipant from './AudioParticipant';

const AudioParticipantList = ({ participants }) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg p-4">
      {/* Liste des participants */}
      <ul className="flex flex-col gap-3">
        {participants.map((participant) => (
          <li
            key={participant.id}
            onClick={() => setSelectedParticipant(participant)}
            className="group flex items-center gap-4 p-4 bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100"
          >
            {/* Avatar avec effet subtil */}
            <div className="relative">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-12 h-12 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {/* Indicateur de statut */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            {/* Nom */}
            <span className="text-gray-800 font-medium truncate">
              {participant.name}
            </span>
            {/* Indicateur audio placeholder */}
            <div className="ml-auto h-1.5 w-12 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-blue-400 animate-pulse"></div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modale améliorée */}
      {selectedParticipant && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 z-50">
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
            {/* Bouton de fermeture */}
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Infos du participant */}
            <div className="flex flex-col items-center gap-4">
              <img
                src={selectedParticipant.avatar}
                alt={selectedParticipant.name}
                className="w-20 h-20 rounded-full object-cover shadow-sm"
              />
              <span className="text-lg font-semibold text-gray-800">
                {selectedParticipant.name}
              </span>
              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-blue-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioParticipantList;