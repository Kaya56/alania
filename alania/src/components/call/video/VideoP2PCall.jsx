import React, { useEffect, useRef } from 'react';

const VideoP2PCall = ({
  participantName,
  participantAvatar = null,
  callStatus = 'connecting',
  remoteStream = null,
  localStream = null,
  onHangUp = null,
}) => {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [remoteStream, localStream]);

  return (
    <div className="relative w-full max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-xl">
      {/* Infos utilisateur */}
      <div className="flex items-center gap-4 mb-4">
        {participantAvatar && (
          <img
            src={participantAvatar}
            alt={participantName}
            className="w-14 h-14 rounded-full border-2 border-gray-200"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{participantName}</h2>
          <p
            className={`text-sm font-medium ${
              callStatus === 'active'
                ? 'text-green-600'
                : callStatus === 'connecting'
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {callStatus === 'connecting'
              ? 'Connexion...'
              : callStatus === 'active'
              ? 'En ligne'
              : 'Déconnecté'}
          </p>
        </div>
      </div>

      {/* Conteneur vidéo principal */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            En attente du flux distant...
          </div>
        )}

        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-32 h-20 rounded-md border-2 border-white object-cover shadow-md"
          />
        )}
      </div>

      {onHangUp && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onHangUp}
            className="px-5 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow"
          >
            Raccrocher
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoP2PCall;
