import React from 'react';

const AudioP2PCall = ({
  participantName = 'Inconnu',
  participantEmail = '',
  participantAvatar = null,
  callStatus = 'connecting',
  audioStream = null,
  remoteStream = null,
}) => {
  const localAudioRef = React.useRef(null);
  const remoteAudioRef = React.useRef(null);

  React.useEffect(() => {
    if (localAudioRef.current && audioStream) {
      localAudioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  React.useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-xl w-full max-w-md">
      {/* Infos participant */}
      <div className="flex items-center gap-4 mb-6">
        {participantAvatar && (
          <img
            src={participantAvatar}
            alt={participantName}
            className="w-14 h-14 rounded-full border-2 border-gray-200"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{participantName}</h2>
          <p className="text-sm text-gray-500">{participantEmail}</p>
          <p className="text-sm text-gray-500">
            {callStatus === 'connecting' ? 'Connexion...' : callStatus === 'active' ? 'En ligne' : 'Déconnecté'}
          </p>
        </div>
      </div>

      {/* Zone audio */}
      <div className="w-full bg-gray-100 p-4 rounded-lg text-center">
        <audio ref={localAudioRef} autoPlay muted className="hidden" />
        <audio ref={remoteAudioRef} autoPlay className="hidden" />
        <p className="text-gray-600 text-sm">
          {audioStream && remoteStream
            ? 'Appel actif'
            : remoteStream
            ? 'Flux local manquant'
            : audioStream
            ? 'En attente du flux distant'
            : 'En attente des flux'}
        </p>
      </div>
    </div>
  );
};

export default AudioP2PCall;