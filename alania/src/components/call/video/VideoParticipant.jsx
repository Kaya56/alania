import React, { useEffect, useRef } from 'react';

const VideoParticipant = ({ participant }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
      {/* Vidéo ou Avatar */}
      <div className="relative group w-40 h-40 rounded-lg overflow-hidden bg-black">
        {participant.stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-full h-full object-cover"
          />
        )}
        {/* Statut caméra */}
        <span
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
            participant.stream ? 'bg-green-400' : 'bg-yellow-400'
          }`}
        ></span>
      </div>

      {/* Infos du participant */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
          {participant.name}
        </h3>
        <p
          className={`text-sm font-medium ${
            participant.stream ? 'text-green-600' : 'text-yellow-600'
          }`}
        >
          {participant.stream ? 'Caméra activée' : 'En attente de connexion'}
        </p>
      </div>
    </div>
  );
};

export default VideoParticipant;
