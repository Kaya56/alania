import React from 'react';

const AudioParticipant = ({ participant }) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
      {/* Image avec effet subtil */}
      <div className="relative group">
        <img
          src={participant.avatar}
          alt={participant.name}
          className="w-28 h-28 rounded-full border-4 border-gray-100 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Indicateur de statut */}
        <span
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
            participant.stream ? 'bg-green-400' : 'bg-yellow-400'
          }`}
        ></span>
      </div>

      {/* Infos en dessous */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-gray-800 tracking-tight">
          {participant.name}
        </h3>
        <p
          className={`text-sm font-medium ${
            participant.stream ? 'text-green-600' : 'text-yellow-600'
          }`}
        >
          {participant.stream ? 'Connecté' : 'En attente'}
        </p>
        {/* Placeholder pour flux audio */}
        <div className="mt-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div
            className={`h-full ${
              participant.stream ? 'w-3/4 bg-green-400' : 'w-1/3 bg-yellow-400'
            } animate-pulse`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AudioParticipant;