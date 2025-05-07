import React from 'react';
import AudioP2PCall from './AudioP2PCall';
import AudioParticipantList from './AudioParticipantList';
import { MOCK_CALL_DATA } from './mockData';

function AudioCallArea({ callType = 'p2p', callData = null }) {
  const data = callData || MOCK_CALL_DATA[callType];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      {callType === 'p2p' && data ? (
        <AudioP2PCall
          participantName={data.participantName}
          participantEmail={data.participantEmail || ''}
          participantAvatar={data.participantAvatar}
          callStatus={data.callStatus}
          audioStream={data.audioStream}
          remoteStream={data.remoteStream}
        />
      ) : callType === 'group' && data ? (
        <AudioParticipantList participants={data.participants} />
      ) : (
        <p className="text-xl font-medium text-gray-700">
          Type d’appel non valide ou données manquantes
        </p>
      )}
    </div>
  );
}

export default AudioCallArea;
