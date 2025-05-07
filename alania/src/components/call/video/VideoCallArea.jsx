import React from 'react';
import VideoP2PCall from './VideoP2PCall';
import VideoParticipantList from './VideoParticipantList';
import { MOCK_CALL_DATA } from './mockData';

function VideoCallArea({ callType = 'p2p', callData }) {
  const data = callData || MOCK_CALL_DATA[callType];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      {callType === 'p2p' && data ? (
        <VideoP2PCall
          participantName={data.participantName}
          participantAvatar={data.participantAvatar}
          callStatus={data.callStatus}
          videoStream={data.videoStream}
        />
      ) : callType === 'group' && data ? (
        <VideoParticipantList participants={data.participants} />
      ) : (
        <p className="text-xl font-medium text-gray-700">
          Type d’appel non valide ou données manquantes
        </p>
      )}
    </div>
  );
}

VideoCallArea.defaultProps = {
  callData: null,
};

export default VideoCallArea;
