import React from 'react';

const VideoGroupCallPlaceholder = ({ participants, callStatus }) => (
  <div className="flex flex-col items-center gap-4 p-5 bg-gray-100 rounded-lg">
    <span className="text-lg text-gray-700">
      Appel de groupe - Statut : {callStatus}
    </span>
    <ul className="flex flex-col gap-2">
      {participants.map((participant) => (
        <li key={participant.id} className="flex items-center gap-2">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-8 h-8 rounded-full"
          />
          <span>{participant.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default VideoGroupCallPlaceholder;
