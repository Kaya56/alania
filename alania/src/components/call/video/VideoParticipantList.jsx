import React, { useState } from 'react';
import VideoParticipant from './VideoParticipant';

const VideoParticipantList = ({ participants }) => {
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
            {/* Avatar ou placeholder vidéo statique */}
            <div className="relative">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-12 h-12 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {/* Statut caméra */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  participant.stream ? 'bg-green-400' : 'bg-yellow-400'
                }`}
              ></span>
            </div>

            {/* Nom */}
            <span className="text-gray-800 font-medium truncate">
              {participant.name}
            </span>
          </li>
        ))}
      </ul>

      {/* Modale vidéo */}
      {selectedParticipant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Bouton de fermeture */}
            <button
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Composant vidéo intégré */}
            <VideoParticipant participant={selectedParticipant} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoParticipantList;
